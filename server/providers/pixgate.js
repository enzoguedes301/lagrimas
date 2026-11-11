/* PixGate: cobrança Pix (cash in).
   Docs: https://app.pixgateip.com/docs/
   Precisa no .env: PIXGATE_API_KEY (Integrações > API Key no painel da PixGate).

   Como funciona:
   - POST /api/v1/cashin (header Apikey) com nome, cpf, valor, descricao, email, telefone, postback, device
     -> { id, pix (copia e cola), value, status:'PENDING' }
     A PixGate NÃO devolve imagem de QR Code nem validade: o QR é gerado aqui (pacote qrcode)
     e a validade mostrada na tela é a nossa (PIX_EXPIRA_MINUTOS).
   - GET /api/stats/:id -> status PENDING | PAID | CANCELLED | REVERSED
   - Postback: POST JSON na URL enviada em "postback" quando o Pix é pago.
     Campos: event ('transaction_paid' no Pix, 'transaction.paid' em outros), transaction_id, id, status, amount, end2end, payer...
     O postback não traz assinatura, então NUNCA liberamos pela mensagem: sempre reconsultamos GET /api/stats/:id.
     Só URLs públicas HTTPS recebem postback (localhost não). Em teste local, o status é conferido pela consulta. */
const QRCode = require('qrcode');
const BASE = 'https://app.pixgateip.com';

function chave(){
  const k = process.env.PIXGATE_API_KEY;
  if(!k) throw new Error('PIXGATE_API_KEY não configurado no server/.env');
  return k;
}
async function chamar(metodo, rota, corpo){
  const r = await fetch(BASE + rota, {
    method: metodo,
    headers: { 'Apikey': chave(), 'Content-Type':'application/json', 'Accept':'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined
  });
  const texto = await r.text();
  let j = {}; try{ j = JSON.parse(texto); }catch(e){}
  if(!r.ok) throw new Error(`PixGate ${r.status}: ${j.message || j.error || (/^\s*</.test(texto) ? '(resposta em HTML)' : texto.slice(0,300))}`);
  return j;
}
function mapaStatus(s){
  s = String(s || '').toUpperCase();
  if(s === 'PAID') return 'pago';
  if(s === 'CANCELLED') return 'cancelado';
  if(s === 'REVERSED' || s === 'DISPUTED') return 'cancelado';
  return 'pendente';
}

module.exports = {
  async criarCobranca(pedido){
    if(!pedido.cliente.cpf) throw new Error('A PixGate exige CPF. Mantenha CONFIG.pedirCpf = true em assets/js/config.js');
    const corpo = {
      nome: pedido.cliente.nome,
      cpf: pedido.cliente.cpf,
      valor: Number(pedido.valor.toFixed(2)),
      descricao: pedido.produto,
      email: pedido.cliente.email,
      telefone: pedido.cliente.whatsapp.replace(/^55/, ''),
      device: pedido.device || 'web'
    };
    if(pedido.postback) corpo.postback = pedido.postback; // URL pública https montada em server/app.js
    const j = await chamar('POST', '/api/v1/cashin', corpo);
    if(!j.id || !j.pix) throw new Error('PixGate não devolveu o código Pix: ' + JSON.stringify(j).slice(0,200));
    const dataUrl = await QRCode.toDataURL(j.pix, { margin:1, width:320, errorCorrectionLevel:'M' });
    return {
      provedorId: String(j.id),
      copiaECola: j.pix,
      qrCodeBase64: dataUrl.split(',')[1],
      expiraEm: new Date(Date.now() + pedido.expiraMinutos * 60000).toISOString()
    };
  },
  async consultar(provedorId){
    try{
      const j = await chamar('GET', '/api/stats/' + encodeURIComponent(provedorId));
      return mapaStatus(j.status);
    }catch(e){
      // Logo depois de criar, a cobrança pode demorar alguns segundos para aparecer na consulta (404). Não é erro: segue pendente.
      if(/^PixGate 404/.test(e.message)) return 'pendente';
      throw e;
    }
  },
  async tratarWebhook(req){
    const b = req.body || {};
    // Saques também chegam aqui se a mesma URL for usada; ignoramos
    if(String(b.type || '').toUpperCase() === 'WITHDRAW' || /^withdraw/.test(String(b.event || ''))) return null;
    const id = b.transaction_id || b.id;
    if(!id) return null;
    // Sem assinatura no postback: a verdade é a consulta na API
    const status = await this.consultar(String(id));
    return { provedorId: String(id), status, detalhes: { end2end: b.end2end || b.end_to_end_id || '', pagador: b.payer || null, liquido: b.net_amount || b.amount } };
  }
};
