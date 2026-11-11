/* API do checkout Pix (PixGate). Este arquivo monta o app do Express e é usado de dois jeitos:
   - local: server/server.js dá app.listen e serve também o site estático;
   - Vercel: api/index.js exporta este app como função serverless (o site estático a Vercel serve sozinha).
   Fala com o provedor Pix escolhido no .env (pixgate em produção, mock para testar sem conta).
   Recebe o postback do provedor, marca o pedido como pago e dispara a entrega (ENTREGA_WEBHOOK_URL). */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const crypto = require('crypto');
const express = require('express');
const store = require('./store');
const provedor = require('./providers');
const tiktok = require('./tiktok');

const app = express();
const VALOR = parseFloat(process.env.PIX_VALOR || '37.00');
const PRODUTO = process.env.PRODUTO_NOME || 'O Filho de Tantas Lágrimas';
const EXPIRA_MIN = parseInt(process.env.PIX_EXPIRA_MINUTOS || '30', 10);
const fmtBRL = v => 'R$ ' + v.toFixed(2).replace('.', ',');

app.set('trust proxy', 1);
app.use(express.json({ limit:'100kb' }));
app.use(express.urlencoded({ extended:false }));

/* Endereço público do site: o do .env ou, na Vercel, o do próprio pedido (x-forwarded-host) */
function urlPublica(req){
  const env = (process.env.URL_PUBLICA || '').replace(/\/$/, '');
  if(env) return env;
  const host = req.get('x-forwarded-host') || req.get('host') || '';
  const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
  return host ? `${proto}://${host}` : '';
}

// CORS só se o site estiver em outro domínio que a API
app.use('/api', (req, res, next)=>{
  const origem = req.get('origin');
  if(origem){
    const permitida = urlPublica(req);
    if(!permitida || origem === permitida || /^https?:\/\/localhost/.test(origem)){
      res.set('Access-Control-Allow-Origin', origem); res.set('Access-Control-Allow-Headers', 'Content-Type'); res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    }
  }
  if(req.method === 'OPTIONS') return res.sendStatus(204);
  res.set('Cache-Control', 'no-store');
  next();
});

// Limite simples por IP para a criação de Pix (evita alguém gerar milhares de cobranças)
const janela = {};
function limitar(req, res, next){
  const ip = req.ip, agora = Date.now();
  janela[ip] = (janela[ip] || []).filter(t=> agora - t < 10*60*1000);
  if(janela[ip].length >= 10) return res.status(429).json({ ok:false, erro:'Muitas tentativas. Espere alguns minutos.' });
  janela[ip].push(agora);
  next();
}

function cpfValido(c){
  if(!/^\d{11}$/.test(c) || /^(\d)\1{10}$/.test(c)) return false;
  const dv = n => { let s = 0; for(let i = 0; i < n; i++) s += parseInt(c[i]) * (n + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
  return dv(9) === parseInt(c[9]) && dv(10) === parseInt(c[10]);
}

const publico = p => ({ id:p.id, provedorId:p.provedorId, status:p.status, valor:p.valor, valorFormatado:fmtBRL(p.valor), copiaECola:p.copiaECola, qrCodeBase64:p.qrCodeBase64, expiraEm:p.expiraEm, linkPagamento:p.linkPagamento || '' });

/* ---------- criar cobrança ---------- */
app.post('/api/pix/criar', limitar, async (req, res)=>{
  try{
    const b = req.body || {};
    const nome = String(b.nome || '').trim().slice(0,120);
    const email = String(b.email || '').trim().toLowerCase().slice(0,160);
    const whatsapp = String(b.whatsapp || '').replace(/\D/g, '').slice(0,15);
    const cpf = String(b.cpf || '').replace(/\D/g, '').slice(0,11);
    if(nome.length < 3) return res.status(400).json({ ok:false, erro:'Escreva o seu nome.' });
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ ok:false, erro:'E-mail inválido.' });
    if(whatsapp.length < 12) return res.status(400).json({ ok:false, erro:'WhatsApp inválido.' });
    if(cpf && !cpfValido(cpf)) return res.status(400).json({ ok:false, erro:'CPF inválido.' });
    const device = ['android','ios','web'].includes(b.device) ? b.device : 'web';

    const publica = urlPublica(req);
    const pedido = {
      id: 'P' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(3).toString('hex').toUpperCase(),
      status: 'pendente', produto: PRODUTO, valor: VALOR, expiraMinutos: EXPIRA_MIN, provedor: provedor.nome, device,
      postback: /^https:\/\//.test(publica) ? publica + '/api/pix/webhook/' + provedor.nome : '',
      cliente: { nome, email, whatsapp, cpf: cpf || undefined },
      utm: {}, sessao: String(b.sessao || '').slice(0,64), origem: String(b.origem || '').slice(0,500),
      ip: req.ip, userAgent: String(req.get('user-agent') || '').slice(0,300), ttp: String(b.ttp || '').slice(0,100) || undefined,
      criadoEm: new Date().toISOString(), pagoEm: null, ultimaConsulta: 0
    };
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','ttclid'].forEach(k=>{ if(b[k]) pedido.utm[k] = String(b[k]).slice(0,200); });

    const cob = await provedor.criarCobranca(pedido);
    Object.assign(pedido, { provedorId: cob.provedorId, copiaECola: cob.copiaECola, qrCodeBase64: cob.qrCodeBase64 || '', expiraEm: cob.expiraEm || new Date(Date.now() + EXPIRA_MIN*60000).toISOString(), linkPagamento: cob.linkPagamento || '' });
    await store.gravar(pedido);
    console.log(`[pix] pedido ${pedido.id} criado (${provedor.nome} ${pedido.provedorId}) ${email}`);
    res.json({ ok:true, pedido: publico(pedido) });
    // Pix gerado = dados de pagamento informados + pedido feito (o pagamento vem depois)
    await tiktok.enviar(['AddPaymentInfo', 'PlaceAnOrder'], pedido);
  }catch(e){
    console.error('[pix] erro ao criar:', e.message);
    res.status(502).json({ ok:false, erro:'Não conseguimos gerar o Pix agora. Tente de novo em instantes.' });
  }
});

/* ---------- status (o site pergunta a cada 4 s) ---------- */
app.get('/api/pix/status/:id', async (req, res)=>{
  const p = await store.obter(req.params.id);
  if(!p){
    // Sem registro (ex.: Vercel sem Redis): confere direto no provedor pelo id da cobrança que o site guardou
    const pid = String(req.query.prov || '');
    if(!pid) return res.status(404).json({ ok:false, status:'inexistente' });
    try{ return res.json({ ok:true, status: await provedor.consultar(pid), semRegistro:true }); }
    catch(e){ return res.status(502).json({ ok:false, status:'erro' }); }
  }
  if(p.status === 'pendente'){
    if(new Date(p.expiraEm).getTime() < Date.now() - 2*60*1000){ p.status = 'expirado'; await store.gravar(p); }
    else if(Date.now() - (p.ultimaConsulta || 0) > 8000){
      // Confere direto no provedor (caso o postback atrase ou não chegue)
      p.ultimaConsulta = Date.now();
      try{ const s = await provedor.consultar(p.provedorId); if(s !== p.status) await atualizarStatus(p, s, 'consulta'); else await store.gravar(p); }
      catch(e){ console.warn('[pix] consulta falhou:', e.message); }
    }
  }
  res.json({ ok:true, status:p.status, pagoEm:p.pagoEm });
});

/* ---------- webhook / postback do provedor ---------- */
app.post('/api/pix/webhook/:provedor', async (req, res)=>{
  try{
    if(req.params.provedor !== provedor.nome) return res.status(404).end();
    const r = await provedor.tratarWebhook(req);
    if(r && r.provedorId){
      const p = await store.porProvedorId(r.provedorId);
      if(p){ if(r.detalhes) p.pagamento = r.detalhes; await atualizarStatus(p, r.status, 'webhook'); }
      else console.warn('[webhook] pedido não encontrado para', r.provedorId);
    }
    res.status(200).json({ ok:true });
  }catch(e){ console.error('[webhook] erro:', e.message); res.status(200).json({ ok:false }); }
});

/* ---------- mock: pagar na mão (só com PIX_PROVEDOR=mock) ---------- */
app.post('/api/pix/mock/pagar/:id', async (req, res)=>{
  if(provedor.nome !== 'mock') return res.status(404).end();
  const p = await store.obter(req.params.id);
  if(!p) return res.status(404).json({ ok:false });
  provedor.pagar(p.provedorId);
  await atualizarStatus(p, 'pago', 'mock');
  res.json({ ok:true, status:p.status });
});

/* ---------- lista de pedidos (protegida) ---------- */
app.get('/api/pedidos', async (req, res)=>{
  const t = process.env.ADMIN_TOKEN;
  if(!t || req.query.token !== t) return res.status(401).json({ ok:false });
  const lista = await store.listar();
  res.json({ ok:true, armazenamento: store.tipo, pedidos: lista.map(p=> ({ id:p.id, status:p.status, valor:p.valor, cliente:p.cliente, utm:p.utm, criadoEm:p.criadoEm, pagoEm:p.pagoEm, provedor:p.provedor, provedorId:p.provedorId, entregueEm:p.entregueEm, entregaPendente:p.entregaPendente })) });
});

/* ---------- saúde ---------- */
app.get('/api/saude', (req, res)=> res.json({ ok:true, provedor: provedor.nome, armazenamento: store.tipo, valor: VALOR, urlPublica: urlPublica(req), tiktokEventsApi: tiktok.ligado() }));

async function atualizarStatus(p, novo, via){
  if(!novo || novo === p.status) return;
  const eraPago = p.status === 'pago';
  p.status = novo;
  if(novo === 'pago' && !p.pagoEm) p.pagoEm = new Date().toISOString();
  await store.gravar(p);
  console.log(`[pix] pedido ${p.id} -> ${novo} (${via})`);
  if(novo === 'pago' && !eraPago){
    await tiktok.enviar('CompletePayment', p);
    await entregar(p);
  }
}

/* Entrega: avisa o n8n (ou qualquer webhook) que o Pix caiu. É lá que sai o e-mail e o WhatsApp com o acesso. */
async function entregar(p){
  const url = process.env.ENTREGA_WEBHOOK_URL;
  if(!url){ console.log('[entrega] ENTREGA_WEBHOOK_URL vazio; pedido pago sem entrega automática:', p.id, p.cliente.email); return; }
  const corpo = { evento:'pix_pago', pedido:p.id, produto:p.produto, valor:p.valor, cliente:p.cliente, utm:p.utm, sessao:p.sessao, pagoEm:p.pagoEm, provedor:p.provedor, provedorId:p.provedorId, pagamento:p.pagamento || null };
  for(let tentativa = 1; tentativa <= 3; tentativa++){
    try{
      const r = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json', 'X-Entrega-Token': process.env.ENTREGA_TOKEN || '' }, body: JSON.stringify(corpo) });
      if(r.ok){ p.entregueEm = new Date().toISOString(); await store.gravar(p); console.log('[entrega] enviada:', p.id); return; }
      console.warn('[entrega] resposta', r.status);
    }catch(e){ console.warn('[entrega] falhou:', e.message); }
    await new Promise(r=> setTimeout(r, 1500 * tentativa));
  }
  p.entregaPendente = true; await store.gravar(p);
}

module.exports = app;
module.exports.info = { provedor: provedor.nome, armazenamento: store.tipo, valor: fmtBRL(VALOR) };
