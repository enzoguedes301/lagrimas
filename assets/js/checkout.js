/* Checkout Pix próprio, na mesma página do quiz.
   Fluxo: dados (nome, e-mail, WhatsApp) -> Pix gerado (QR Code + copia e cola) -> pago.
   Conversa com o servidor em server/ (rotas /api/pix/criar, /api/pix/status/:id).
   O servidor é quem fala com o provedor Pix (Mercado Pago, Asaas...). O site nunca vê chaves. */
(function(){
'use strict';
const CONFIG = window.CONFIG;
const CHAVE_PEDIDO = 'quiz_pedido';
let estado = { aberto:false, pedido:null, timerStatus:null, timerRelogio:null };

const api = (rota)=> (CONFIG.api || '').replace(/\/$/, '') + rota;
const esc = (s)=> String(s == null ? '' : s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function lerPendente(){ try{ return JSON.parse(sessionStorage.getItem(CHAVE_PEDIDO) || 'null'); }catch(e){ return null; } }
function guardarPendente(p){ try{ p ? sessionStorage.setItem(CHAVE_PEDIDO, JSON.stringify(p)) : sessionStorage.removeItem(CHAVE_PEDIDO); }catch(e){} }

function resumo(){
  return `<div class="resumo">
    <img src="${esc(CONFIG.capa)}" alt="">
    <div><b>${esc(CONFIG.produto)}</b><span class="nota">21 dias de oração com Santa Mônica</span><div class="valor">${esc(CONFIG.preco)}</div></div>
  </div>`;
}

/* ---------- Passo 1: dados ---------- */
function telaDados(prefill){
  const d = prefill || {};
  window.Quiz.tela.innerHTML = `
  <section class="tela checkout">
    <div class="selo">Último passo</div>
    <h2>Preencha para receber o devocional</h2>
    ${resumo()}
    <form class="form" id="form-dados" novalidate>
      <div class="campo"><label for="c-nome">Seu nome</label><input id="c-nome" name="nome" type="text" autocomplete="name" value="${esc(d.nome)}" required></div>
      <div class="campo"><label for="c-email">Seu e-mail</label><input id="c-email" name="email" type="email" autocomplete="email" inputmode="email" value="${esc(d.email)}" required><small>Você recebe o acesso por aqui.</small></div>
      <div class="campo"><label for="c-whats">Seu WhatsApp (com DDD)</label><input id="c-whats" name="whatsapp" type="tel" autocomplete="tel" inputmode="numeric" placeholder="11 91234-5678" value="${esc(d.whatsapp)}" required><small>E também por aqui, para não se perder.</small></div>
      ${CONFIG.pedirCpf ? `<div class="campo"><label for="c-cpf">Seu CPF</label><input id="c-cpf" name="cpf" type="text" autocomplete="off" inputmode="numeric" placeholder="000.000.000-00" value="${esc(d.cpf)}" required><small>Pedido pelo banco para registrar o Pix.</small></div>` : ''}
      <p class="erro-msg" id="c-erro" hidden></p>
      <div class="cta"><button class="btn" id="c-gerar" type="submit">Gerar o Pix de ${esc(CONFIG.preco)} ✅</button></div>
    </form>
    <p class="seguro">🔒 Pagamento pelo Pix, direto no aplicativo do seu banco.</p>
  </section>`;
  const form = document.getElementById('form-dados');
  const whats = document.getElementById('c-whats');
  whats.addEventListener('input', ()=>{ whats.value = mascaraTelefone(whats.value); });
  const cpf = document.getElementById('c-cpf');
  if(cpf) cpf.addEventListener('input', ()=>{ cpf.value = mascaraCpf(cpf.value); });
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const dados = { nome:form.nome.value.trim(), email:form.email.value.trim().toLowerCase(), whatsapp:form.whatsapp.value.replace(/\D/g,''), cpf: cpf ? cpf.value.replace(/\D/g,'') : '' };
    const erro = validar(dados, form);
    if(erro){ mostrarErro(erro); return; }
    await gerarPix(dados);
  });
  window.scrollTo({top:0});
}

/* Cookie do Pixel do TikTok (_ttp): vai para o servidor para a Events API casar a compra com o clique */
function cookie(nome){ try{ const m = document.cookie.match(new RegExp('(?:^|; )' + nome + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : ''; }catch(e){ return ''; } }
/* A PixGate pede a plataforma de quem paga (android, ios ou web), detectada no navegador */
function detectarDevice(){
  const ua = navigator.userAgent.toLowerCase();
  return /android/.test(ua) ? 'android' : /iphone|ipad|ipod/.test(ua) ? 'ios' : 'web';
}
function mascaraTelefone(v){
  v = v.replace(/\D/g,'').slice(0,11);
  if(v.length > 6) return v.replace(/^(\d{2})(\d{4,5})(\d{0,4}).*/, '$1 $2-$3').replace(/-$/,'');
  if(v.length > 2) return v.replace(/^(\d{2})(\d*)/, '$1 $2');
  return v;
}
function mascaraCpf(v){
  v = v.replace(/\D/g,'').slice(0,11);
  return v.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}
function cpfValido(c){
  if(!/^\d{11}$/.test(c) || /^(\d)\1{10}$/.test(c)) return false;
  const dv = (n)=>{ let s = 0; for(let i = 0; i < n; i++) s += parseInt(c[i]) * (n + 1 - i); const r = (s * 10) % 11; return (r === 10 ? 0 : r); };
  return dv(9) === parseInt(c[9]) && dv(10) === parseInt(c[10]);
}
function validar(d, form){
  form.querySelectorAll('input').forEach(i=> i.classList.remove('erro'));
  if(d.nome.length < 3){ form.nome.classList.add('erro'); form.nome.focus(); return 'Escreva o seu nome.'; }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)){ form.email.classList.add('erro'); form.email.focus(); return 'Confira o seu e-mail. Exemplo: maria@gmail.com'; }
  if(d.whatsapp.length < 10 || d.whatsapp.length > 11){ form.whatsapp.classList.add('erro'); form.whatsapp.focus(); return 'Coloque o WhatsApp com DDD. Exemplo: 11 91234-5678'; }
  if(CONFIG.pedirCpf && !cpfValido(d.cpf)){ form.cpf.classList.add('erro'); form.cpf.focus(); return 'Confira o seu CPF, só os números.'; }
  return '';
}
function mostrarErro(msg){ const el = document.getElementById('c-erro'); if(!el) return; el.textContent = msg; el.hidden = !msg; }

/* ---------- cria o Pix no servidor ---------- */
async function gerarPix(dados){
  const btn = document.getElementById('c-gerar');
  btn.disabled = true; btn.textContent = 'Gerando o seu Pix...'; mostrarErro('');
  try{
    const r = await fetch(api('/api/pix/criar'), { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(Object.assign({ nome:dados.nome, email:dados.email, whatsapp:'55' + dados.whatsapp, cpf:dados.cpf || undefined, device:detectarDevice(), sessao:window.Quiz.SESSAO, origem:location.href.slice(0,500), ttp:cookie('_ttp') }, window.Quiz.UTM)) });
    const j = await r.json().catch(()=>({}));
    if(!r.ok || !j.ok) throw new Error(j.erro || 'Não foi possível gerar o Pix agora.');
    estado.pedido = Object.assign({ cliente:dados }, j.pedido);
    guardarPendente(estado.pedido);
    // TikTok: e-mail e telefone (o próprio SDK faz o hash) para casar a compra com quem clicou no anúncio
    try{ if(window.ttq) ttq.identify({ email:dados.email, phone_number:'+55' + dados.whatsapp, external_id:j.pedido.id }); }catch(e){}
    // event_id igual ao do servidor ("<pedido>:<evento>") para o TikTok descartar a duplicata
    window.Quiz.rastrear('Quiz_PixGerado', { value:window.Quiz.VALOR, currency:'BRL', pedido:j.pedido.id, event_id:j.pedido.id + ':AddPaymentInfo' }, 'AddPaymentInfo');
    telaPix();
  }catch(e){
    btn.disabled = false; btn.textContent = 'Tentar de novo';
    mostrarErro((e && e.message) || 'Falha de conexão. Tente de novo em instantes.');
    window.Quiz.rastrear('Quiz_PixErro', { erro:String(e && e.message).slice(0,120) });
  }
}

/* ---------- Passo 2: QR Code e copia e cola ---------- */
function telaPix(){
  const p = estado.pedido;
  const qr = p.qrCodeBase64 ? `<img class="qr" alt="QR Code do Pix" src="data:image/png;base64,${p.qrCodeBase64}">` : '';
  window.Quiz.tela.innerHTML = `
  <section class="tela checkout">
    <div class="selo">Pix gerado</div>
    <h2>Agora é só pagar no aplicativo do seu banco</h2>
    <div class="pix-box">
      <div class="valor-grande">${esc(p.valorFormatado || CONFIG.preco)}</div>
      ${qr}
      <div class="copia">
        <button class="btn copiar" id="c-copiar" type="button">Copiar código Pix</button>
        <textarea id="c-codigo" readonly aria-label="Código Pix copia e cola">${esc(p.copiaECola)}</textarea>
      </div>
      <p class="expira">O código vale por <b id="c-relogio">--:--</b></p>
      <div class="aguardando" id="c-aguardando"><i></i>Esperando o seu pagamento...</div>
    </div>
    <div class="passos-pix">
      <h3>Como pagar (leva 1 minuto)</h3>
      <ol>
        <li>Toque em <b>Copiar código Pix</b> aqui em cima.</li>
        <li>Abra o aplicativo do seu banco e escolha <b>Pix</b>.</li>
        <li>Escolha <b>Pix Copia e Cola</b> e cole o código.</li>
        <li>Confira o valor e confirme. <b>Depois volte para esta tela.</b></li>
      </ol>
    </div>
    <p class="nota">Se preferir, aponte a câmera do aplicativo do banco para o QR Code.</p>
    <p class="erro-msg" id="c-erro" hidden></p>
    <button class="link-simples" id="c-novo" type="button">Gerar um novo código</button>
    ${CONFIG.whatsappSuporte ? `<p class="nota">Ficou com dúvida? WhatsApp: <b>+${esc(CONFIG.whatsappSuporte)}</b></p>` : ''}
  </section>`;
  document.getElementById('c-copiar').addEventListener('click', copiar);
  document.getElementById('c-codigo').addEventListener('click', function(){ this.select(); });
  document.getElementById('c-novo').addEventListener('click', ()=>{ pararTimers(); guardarPendente(null); telaDados(p.cliente); });
  iniciarRelogio(p.expiraEm);
  vigiarStatus();
  window.scrollTo({top:0});
}

async function copiar(){
  const btn = document.getElementById('c-copiar'), ta = document.getElementById('c-codigo');
  let ok = false;
  try{ await navigator.clipboard.writeText(ta.value); ok = true; }
  catch(e){ try{ ta.focus(); ta.select(); ok = document.execCommand('copy'); }catch(e2){} }
  btn.textContent = ok ? '✅ Código copiado!' : 'Segure no código e escolha "Copiar"';
  btn.classList.add('ok');
  setTimeout(()=>{ btn.textContent = 'Copiar código Pix'; btn.classList.remove('ok'); }, 4000);
  window.Quiz.rastrear('Quiz_PixCopiou', { pedido:estado.pedido.id, ok });
}

function iniciarRelogio(expiraEm){
  const el = document.getElementById('c-relogio');
  const fim = expiraEm ? new Date(expiraEm).getTime() : Date.now() + 30*60*1000;
  const tick = ()=>{
    const s = Math.max(0, Math.round((fim - Date.now())/1000));
    if(el) el.textContent = String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');
    if(s <= 0){ pararTimers(); expirou(); }
  };
  tick(); estado.timerRelogio = setInterval(tick, 1000);
}
function expirou(){
  const ag = document.getElementById('c-aguardando');
  if(ag) ag.innerHTML = 'Este código venceu. Toque em <b>Gerar um novo código</b> abaixo.';
  mostrarErro('O tempo do Pix acabou. Gere um novo código, é rápido.');
}

/* Pergunta ao servidor, a cada poucos segundos, se o Pix caiu. O servidor recebe o aviso do banco pelo webhook. */
function vigiarStatus(){
  let tentativas = 0;
  const checar = async ()=>{
    if(!estado.aberto || !estado.pedido) return;
    try{
      const r = await fetch(api('/api/pix/status/' + encodeURIComponent(estado.pedido.id) + '?prov=' + encodeURIComponent(estado.pedido.provedorId || '')), { cache:'no-store' });
      const j = await r.json();
      if(j.status === 'pago'){ pararTimers(); pago(j); return; }
      if(j.status === 'expirado' || j.status === 'cancelado'){ pararTimers(); expirou(); return; }
    }catch(e){ tentativas++; }
  };
  estado.timerStatus = setInterval(checar, 4000);
  // Quando a mãe volta do aplicativo do banco, confere na hora
  document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState === 'visible') checar(); });
}
function pararTimers(){ clearInterval(estado.timerStatus); clearInterval(estado.timerRelogio); estado.timerStatus = estado.timerRelogio = null; }

/* ---------- Passo 3: pago ---------- */
function pago(info){
  const p = estado.pedido;
  guardarPendente(null);
  window.Quiz.rastrear('Quiz_PixPago', { value:window.Quiz.VALOR, currency:'BRL', content_name:CONFIG.produto, content_type:'product', pedido:p.id, event_id:p.id + ':CompletePayment' }, 'Purchase');
  const destino = CONFIG.paginaObrigado ? CONFIG.paginaObrigado + '?pedido=' + encodeURIComponent(p.id) : '';
  window.Quiz.tela.innerHTML = `
  <section class="tela checkout">
    <div class="sucesso">
      <div class="check">✓</div>
      <h1>Pagamento confirmado!</h1>
      <p class="sub">Obrigada, <b class="ok">${esc((p.cliente && p.cliente.nome) || '').split(' ')[0]}</b>. Deus abençoe você e o seu filho. 🙏</p>
      <p class="sub">O acesso ao devocional vai para o seu <b class="ok">e-mail</b> e para o seu <b class="ok">WhatsApp</b> em instantes.</p>
      ${destino ? `<div class="cta"><a class="btn quieto" href="${esc(destino)}">Ver como começar hoje</a></div>` : ''}
      ${CONFIG.whatsappSuporte ? `<p class="nota">Não recebeu em 10 minutos? Fale com a gente: <b>+${esc(CONFIG.whatsappSuporte)}</b></p>` : ''}
    </div>
  </section>`;
  window.scrollTo({top:0});
  if(destino) setTimeout(()=>{ location.href = destino; }, 6000);
}

/* ---------- API usada pelo quiz ---------- */
window.Checkout = {
  abrir(op){
    op = op || {};
    estado.aberto = true;
    window.Quiz.voltar.hidden = false;
    const pend = op.retomar ? lerPendente() : null;
    if(pend && pend.id && (!pend.expiraEm || new Date(pend.expiraEm).getTime() > Date.now())){ estado.pedido = pend; telaPix(); }
    else { guardarPendente(null); telaDados(pend && pend.cliente); }
    window.Quiz.rastrear('Quiz_CheckoutAbriu', { botao:op.botao || 0, retomar:!!pend });
    try{ history.replaceState(null, '', '#checkout'); }catch(e){}
  },
  fechar(){ if(!estado.aberto) return; pararTimers(); estado.aberto = false; },
  aberto(){ return estado.aberto; },
  pendente(){ const p = lerPendente(); return !!(p && p.id && (!p.expiraEm || new Date(p.expiraEm).getTime() > Date.now())); }
};
})();
