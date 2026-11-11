/* Motor do quiz: uma tela por vez, rastreamento e oferta.
   A compra é feita pelo checkout Pix próprio (assets/js/checkout.js). */
(function(){
'use strict';
const CONFIG = window.CONFIG;

/* O que cada imagem precisa mostrar (aparece no espaço tracejado enquanto a imagem não vem). */
const FOTOS = {
  abertura: { n:1,  r:'r34', alt:'Mãe abraçando o filho adulto na igreja', desc:'Mãe de uns 55 anos abraçando forte o filho adulto (20 a 30 anos), os dois sorrindo, dentro de uma igreja católica com altar e flores ao fundo. 3:4 vertical.' },
  fe:       { n:2,  r:'r34', alt:'Mãe rezando sozinha à noite', desc:'Mãe 50+ rezando sozinha à noite na mesa da cozinha, terço na mão, Bíblia aberta, luz fraca de abajur, rosto cansado. 3:4 vertical.' },
  ana:      { n:3,  r:'r34', alt:'Mãe ouvindo com o celular no ouvido', desc:'Mãe 50+ sentada no sofá, olhos fechados, celular encostado no ouvido, ouvindo com calma. 3:4 vertical.' },
  mockup:   { n:4,  r:'r34', alt:'O devocional O Filho de Tantas Lágrimas no tablet, no celular e impresso', desc:'Mockup do devocional: a capa no tablet e no celular, páginas impressas na mesa, um terço e uma vela. 3:4 vertical.' },
  passo1:   { n:5,  r:'r34', alt:'Mãe de joelhos entregando o filho a Deus', desc:'Mãe de joelhos na frente do altar ou de uma imagem de Nossa Senhora, segurando a foto do filho junto ao peito. 3:4 vertical.' },
  oracao:   { n:6,  r:'r34', alt:'Vela acesa, terço e foto do filho sobre a Bíblia', desc:'Close de uma vela acesa, um terço e a foto de um rapaz sobre a Bíblia aberta, luz dourada. 3:4 vertical.' },
  passo2:   { n:7,  r:'r34', alt:'Filho preso por correntes com as etiquetas más amizades, bebida, drogas, tristeza, longe de Deus e relacionamento errado, enquanto a mãe reza', desc:'Filho sentado de cabeça baixa, preso por correntes escuras com etiquetas: MÁS AMIZADES, BEBIDA, DROGAS, TRISTEZA, LONGE DE DEUS. A mãe reza de joelhos atrás dele, com luz caindo sobre ela. 3:4 vertical.' },
  passo3:   { n:8,  r:'r34', alt:'Mãe abençoando o filho diante do Sagrado Coração', desc:'Mãe com a mão na cabeça do filho, abençoando, diante das imagens do Sagrado Coração de Jesus e do Imaculado Coração de Maria. 3:4 vertical.' },
  monica:   { n:9,  r:'r34', alt:'Santa Mônica e Santo Agostinho, pintura de Ary Scheffer', desc:'A pintura "Santo Agostinho e Santa Mônica" de Ary Scheffer (1846), domínio público, no Wikimedia Commons, cortada em 3:4 vertical.' },
  escolha:  { n:10, r:'r34', alt:'Mãe desesperada em cima e mãe rezando com paz embaixo', desc:'Imagem dividida em duas, uma em cima da outra. Em cima: mãe com a mão na cabeça, desesperada, faixa vermelha "Continuar rezando do jeito cansado?". Embaixo: mãe de joelhos rezando com paz, faixa verde "Ou rezar com direção?". 3:4 vertical.' }
};

function foto(slot, solta){
  const f = CONFIG.imagens[slot], d = FOTOS[slot];
  const el = f ? `<img class="foto ${d.r}" src="${f}" alt="${d.alt}">`
               : `<div class="foto vazia ${d.r}"><b>📷 Imagem ${d.n}</b><span>${d.desc}</span></div>`;
  // Nas telas do quiz a imagem vai numa caixa que estica/encolhe com a altura do celular; na oferta fica solta.
  return solta ? el : `<div class="media">${el}</div>`;
}

const ORACAO_DIA1 = [
  'Fecha os olhos um instante e põe a mão no coração.',
  'Senhor, hoje eu não venho te pedir do jeito cansado de sempre. Hoje eu venho te entregar o meu filho.',
  '<i>(Fala o nome dele agora, baixinho.)</i>',
  'Onde ele estiver neste momento, deixa ele sentir o teu olhar, como aquele pai que viu o filho ainda de longe e correu ao encontro dele.',
  'Eu te entrego a mente dele, os caminhos dele, as amizades dele e o coração dele, que às vezes parece tão longe de mim.',
  'Eu não desisto do meu filho. E eu sei que tu também não desistes.',
  'Santa Mônica, mãe que chorou anos por um filho, reza comigo agora e leva este nome até Jesus. Amém.'
];

const MECANISMO_TEXTO = [
  'Eu converso com muitas mães aqui, todos os dias. E quase todas me contam a mesma coisa: que rezam há anos, que já choraram escondido, que deitam e não conseguem dormir pensando onde ele está.',
  'E muitas acham que é falta de fé. Não é. Depois de tanto tempo, a oração vira um pedido só, repetido no cansaço. E uma oração genérica não alcança uma garra específica.',
  'O que mais aperta o seu coração em relação ao seu filho? A bebida? As drogas? As amizades? Uma tristeza que faz ele se fechar no quarto? Ou ele se afastou de Deus?'
];

function blocoAudio(texto){
  return `<div class="audio">
    <button class="play" id="play" type="button" aria-label="Tocar áudio">▶</button>
    <div class="info">
      <div class="tempo" aria-hidden="true"><i id="tempo"></i></div>
      <p class="nota">${texto}</p>
    </div>
  </div>`;
}

/* Cada tela: html + texto do botão (+ áudio opcional). */
const TELAS = [
  { id:'capa', botao:'Quero rezar pelo meu filho 🙏', html:`
    <h1>21 dias de oração com Santa Mônica <span class="dest">pela vida do seu filho</span></h1>
    <p class="sub">Reze com direção, uma área da vida dele por dia. <b class="ok">Cinco minutos por manhã.</b></p>
    ${foto('abertura')}
    <p class="nota">Leva 2 minutos. Não precisa de cadastro.</p>` },

  { id:'fe', botao:'Então como eu devo rezar?', html:`
    <h2>Você reza há anos pelo seu filho <span class="dor">e sente que nada muda?</span></h2>
    ${foto('fe')}
    <p class="sub">Isso <b>não é falta de fé.</b></p>
    <p class="sub">Depois de tanto tempo, a oração vira um pedido só, repetido no cansaço.</p>` },

  { id:'ana', botao:'Continuar', audio:'mecanismo', html:`
    <div class="selo">Uma mensagem para você</div>
    <h2>Escute a Ana antes de continuar 🎧</h2>
    ${foto('ana')}
    ${blocoAudio('Coloque o celular no ouvido. Menos de 1 minuto.')}
    <details><summary>Prefere ler? Toque aqui</summary><div class="oracao">${MECANISMO_TEXTO.map(p=>`<p>${p}</p>`).join('')}</div></details>` },

  { id:'tres', botao:'Quais são os 3 passos?', html:`
    <h2>Siga os <span class="dest">3 passos</span> do devocional O Filho de Tantas Lágrimas</h2>
    ${foto('mockup')}
    <p class="sub">Reze pelo seu filho como Santa Mônica rezou pelo dela: <b class="ok">todo dia, sem desistir, sabendo pelo que rezar.</b></p>` },

  { id:'passo1', botao:'Quero fazer a entrega 🙏', html:`
    <div class="passo">Passo 1</div>
    <h2>Entregue o seu filho <span class="dest">nas mãos de Deus</span></h2>
    ${foto('passo1')}
    <p class="sub">No Dia 1 você entrega o seu filho a Deus, como o pai que viu o filho de longe e <b class="ok">correu ao encontro dele</b> (Lucas 15).</p>` },

  { id:'oracao', botao:'Amém 🙏', audio:'oracao', html:`
    <div class="selo">Oração do Dia 1</div>
    <h2>Reze agora comigo pelo seu filho</h2>
    ${foto('oracao')}
    ${blocoAudio('Feche os olhos e reze comigo.')}
    <details><summary>Prefere ler a oração? Toque aqui</summary><div class="oracao">${ORACAO_DIA1.map(p=>`<p>${p}</p>`).join('')}</div></details>` },

  { id:'passo2', botao:'Quero continuar ✅', html:`
    <div class="passo">Passo 2</div>
    <h2>Reze contra <span class="dor">cada garra</span> que prende o seu filho</h2>
    ${foto('passo2')}
    <p class="sub">Um dia para cada garra, <b class="ok">na ordem certa.</b></p>` },

  { id:'passo3', botao:'Quero consagrar meu filho 🙏', html:`
    <div class="passo">Passo 3</div>
    <h2>Consagre o seu filho <span class="dest">no Dia 21</span></h2>
    ${foto('passo3')}
    <p class="sub">No último dia, você consagra o seu filho ao <b class="ok">Sagrado Coração de Jesus</b> e ao <b class="ok">Imaculado Coração de Maria</b>.</p>` },

  { id:'monica', botao:'Ela entende a minha dor', html:`
    <div class="selo">Santa Mônica</div>
    <h2>Ela rezou <span class="dor">17 anos</span> por um filho perdido</h2>
    ${foto('monica')}
    <p class="sub">Agostinho se perdeu nas festas e nas más companhias. Ela não parou de rezar, até um bispo dizer:</p>
    <p class="citacao">“Não é possível que se perca o filho de tantas lágrimas.”</p>
    <p class="sub">E aquele filho <b class="ok">virou santo.</b> <span class="nota">(Confissões III, 12)</span></p>` },

  { id:'recebe', botao:'Quero receber tudo isso ✅', html:`
    <div class="selo">Você vai receber</div>
    <h2>Tudo o que você precisa <span class="dest">para não rezar mais perdida</span></h2>
    ${foto('mockup')}
    <ul class="lista compacta">
      <li><span>📖</span>21 dias com Santa Mônica, 5 minutos por manhã</li>
      <li><span>✝️</span>Leitura da Bíblia e reflexão para cada dia</li>
      <li><span>🙏</span>A oração do dia, feita pelo nome dele</li>
      <li><span>🤲</span>Um gesto simples para fazer pelo seu filho</li>
      <li><span>❤️</span>A Consagração no Dia 21</li>
      <li><span>🕯️</span>Ajuda para quando a dor apertar</li>
    </ul>` },

  { id:'paraquem', botao:'Sou eu 🙏', html:`
    <div class="media lista-img"><img class="foto" src="${CONFIG.imagens.paraquem}" width="1040" height="1664" style="border-radius:0;background:none"
      alt="O Filho de Tantas Lágrimas é para a mãe que: reza há anos e sente que nada muda; vai dormir pensando onde o filho está; às vezes se culpa pelo caminho que ele tomou; tem medo de perder o filho para o mundo. E para mães que querem rezar com direção, sabendo pelo que pedir; querem ter paz enquanto esperam o tempo de Deus; querem entregar o filho como Santa Mônica entregou o dela."></div>` },

  { id:'comunidade', botao:'Quero começar 🙏', html:`
    <div class="boasvindas">Deus te trouxe aqui. Seja muito bem-vinda!<br>Somos uma comunidade de mães que não desistem dos seus filhos.</div>
    <img class="perfil" src="${CONFIG.imagens.perfil}" width="1200" height="505" alt="Perfil devocionalfilhodetantaslagrimas no Instagram, 14 mil seguidores">
    <h2>Somos <span class="dest">14 mil mães</span> em oração no Instagram</h2>
    <p class="sub">Orações e reflexões todos os dias. Mais do que um devocional, <b class="ok">você recebe apoio espiritual sempre.</b></p>` },

  { id:'oferta', oferta:true }
];

function htmlOferta(){
  const produto = CONFIG.imagens.mockup ? foto('mockup', true)
    : `<img class="capa" src="${CONFIG.capa}" alt="Capa do devocional O Filho de Tantas Lágrimas" width="642" height="909">`;
  const preco = `
    <div class="bloco preco">
      ${CONFIG.precoDe ? `<span class="de">de ${CONFIG.precoDe}</span>` : ''}
      <span class="nota">por apenas</span>
      <span class="por">${CONFIG.preco}</span>
      ${CONFIG.parcelas ? `<span class="parc">${CONFIG.parcelas}</span>` : ''}
    </div>`;
  const dep = CONFIG.depoimentos.length ? `
    <div class="bloco"><h3>O que as mães estão dizendo</h3>
      <div class="dep">${CONFIG.depoimentos.map(s=>`<img src="${s}" alt="Depoimento de uma mãe" loading="lazy">`).join('')}</div>
    </div>` : '';
  const gar = CONFIG.garantiaDias > 0 ? `
    <div class="bloco garantia"><span class="escudo">🛡️</span>
      <div><h3>Garantia de ${CONFIG.garantiaDias} dias</h3>
      <p class="sub" style="font-size:18px">Comece hoje. Se em ${CONFIG.garantiaDias} dias você sentir que não é para você, devolvemos o seu dinheiro, sem perguntas.</p></div>
    </div>` : '';
  const sup = CONFIG.whatsappSuporte ? `<p class="nota">Dúvidas? Fale com a gente no WhatsApp: <b>+${CONFIG.whatsappSuporte}</b></p>` : '';
  return `
  <section class="tela oferta">
    <div class="selo">Preparado para você</div>
    <h1>Os 21 dias pelo seu filho <span class="dest">estão prontos</span></h1>
    ${produto}
    ${preco}
    ${botaoCompra()}
    <p class="seguro">🔒 Compra 100% segura · Pix na hora</p>
    ${foto('escolha', true)}
    <div class="escolha">
      <p>❌ Continuar rezando do jeito cansado, <b style="color:var(--vinho)">sem saber se está chegando?</b></p>
      <p>✅ Ou rezar pelo seu filho <b style="color:var(--verde)">com direção, um dia de cada vez</b>, como Santa Mônica?</p>
    </div>
    ${preco}
    ${botaoCompra()}
    ${dep}
    ${CONFIG.instagram ? `<div class="bloco"><h3>Faça parte da nossa comunidade 🙏</h3>
      <img class="perfil" src="${CONFIG.imagens.perfil}" width="1200" height="505" alt="Perfil ${CONFIG.instagram} no Instagram, 14 mil seguidores" loading="lazy">
      <p class="sub" style="font-size:18px">Somos 14 mil mães em oração no Instagram: <b class="ok" style="overflow-wrap:anywhere">@${CONFIG.instagram}</b></p></div>` : ''}
    ${gar}
    <div class="bloco faq"><h3>Perguntas frequentes</h3>
      <details><summary>Meu filho vai mudar em 21 dias?</summary><p>Não prometemos prazo. Esse tempo é de Deus. O que muda desde o primeiro dia é a sua oração: você deixa de rezar perdida e passa a rezar com direção, como Santa Mônica.</p></details>
      <details><summary>E se eu achar que minha fé está fraca?</summary><p>Não precisa de fé forte para começar. O devocional conduz você pela mão, um dia de cada vez.</p></details>
      <details><summary>Não sei mexer muito no celular. Consigo?</summary><p>Consegue. Você recebe tudo no WhatsApp e no e-mail, é só abrir e ler. Cinco minutos por manhã.</p></details>
      <details><summary>Como eu pago?</summary><p>Pelo Pix, na própria tela. Aparece um código: você abre o aplicativo do seu banco, escolhe "Pix Copia e Cola", cola o código e confirma. Em segundos o pagamento é reconhecido.</p></details>
      <details><summary>E se eu perder um dia?</summary><p>Retome no dia seguinte, de onde parou. O importante é não desistir dele.</p></details>
    </div>
    ${botaoCompra()}
    ${sup}
    <p class="rodape">Produto digital. Este site não tem vínculo com o Facebook ou a Meta.</p>
  </section>`;
}

function botaoCompra(){
  return `<div class="compra">
    <button class="btn comprar" type="button">Quero começar agora ✅</button>
  </div>`;
}

/* ---------- motor ---------- */
let atual = 0;
let player = null;
const tela = document.getElementById('tela');
const voltar = document.getElementById('voltar');
const prog = document.getElementById('progresso');

/* ---------- rastreamento ----------
   Cada acontecimento vai para o Pixel da Meta e, se CONFIG.coletor estiver preenchido, também para o nosso banco
   (é de lá que o painel tira o funil tela a tela e onde cada mãe saiu). */
const VALOR = parseFloat(String(CONFIG.preco).replace(/[^\d,]/g,'').replace(',', '.')) || 0;
const UTM = (()=>{ const q = new URLSearchParams(location.search), o = {};
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','ttclid'].forEach(k=>{ if(q.get(k)) o[k] = q.get(k).slice(0,200); });
  return o; })();
const SESSAO = (()=>{ const novo = Date.now().toString(36) + Math.random().toString(36).slice(2,10);
  try{ let s = sessionStorage.getItem('quiz_sessao'); if(!s){ s = novo; sessionStorage.setItem('quiz_sessao', s); } return s; }catch(e){ return novo; } })();
const T0 = Date.now();
let telaDesde = Date.now(), etapaMax = 0, saiuPor = '';
const pad2 = n => String(n).padStart(2, '0');

/* Nomes dos eventos padrão da Meta e o equivalente no TikTok */
const TT_EVENTO = { ViewContent:'ViewContent', InitiateCheckout:'InitiateCheckout', AddPaymentInfo:'AddPaymentInfo', Purchase:'CompletePayment', Contact:'Contact' };
function px(evento, dados){
  try{ if(window.fbq) fbq('track', evento, dados||{}); }catch(e){}
  try{ if(window.ttq && TT_EVENTO[evento]) ttq.track(TT_EVENTO[evento], dadosTikTok(dados)); }catch(e){}
}
function pxc(evento, dados){
  try{ if(window.fbq) fbq('trackCustom', evento, dados||{}); }catch(e){}
  try{ if(window.ttq) ttq.track(evento, dados||{}); }catch(e){}
}
/* O TikTok quer contents[] com content_id; o resto vai igual */
function dadosTikTok(d){
  d = Object.assign({}, d||{});
  if(d.value != null){ d.contents = [{ content_id:'devocional-21-dias', content_type:'product', content_name:CONFIG.produto, price:d.value, quantity:1 }]; d.content_type = 'product'; }
  return d;
}
function coletar(evento, dados){
  if(!CONFIG.coletor) return;
  const corpo = JSON.stringify(Object.assign({ sessao:SESSAO, evento, etapa:atual + 1, tela:(TELAS[atual]||{}).id,
    seg_total:Math.round((Date.now() - T0)/1000), ts:new Date().toISOString(), tela_px:innerWidth + 'x' + innerHeight }, UTM, dados||{}));
  try{
    if(navigator.sendBeacon && navigator.sendBeacon(CONFIG.coletor, new Blob([corpo], {type:'text/plain'}))) return;
    fetch(CONFIG.coletor, {method:'POST', body:corpo, keepalive:true, mode:'no-cors'}).catch(()=>{});
  }catch(e){}
}
/* rastrear(nome, dados, padrao): padrao = nome de evento padrão da Meta (ViewContent, InitiateCheckout, Purchase...) */
function rastrear(nome, dados, padrao){
  if(padrao) px(padrao, dados); else pxc(nome, dados);
  coletar(nome, dados);
}

function pararAudio(){
  if(player){
    const d = player.duration, c = player.currentTime;
    if(d && c > 0) rastrear('Quiz_AudioOuviu', { tela:TELAS[atual].id, pct:Math.min(100, Math.round(c/d*100)), segundos:Math.round(c) });
    player.pause(); player = null;
  }
}

function mostrar(i, porClique){
  pararAudio();
  if(window.Checkout) window.Checkout.fechar();
  const segAnterior = Math.round((Date.now() - telaDesde)/1000), deTela = (TELAS[atual]||{}).id;
  const voltando = i < atual;
  atual = i; telaDesde = Date.now(); etapaMax = Math.max(etapaMax, i + 1);
  const t = TELAS[i];
  voltar.hidden = i === 0;
  prog.style.width = Math.round((i / (TELAS.length - 1)) * 100) + '%';
  // Uma linha por tela no Gerenciador de Eventos (Quiz_01_capa, Quiz_02_fe...) para ver onde as mães param
  const dadosTela = { etapa:i + 1, tela:t.id, de:deTela, seg_tela_anterior:segAnterior, voltando };
  pxc('Quiz_' + pad2(i + 1) + '_' + t.id, dadosTela);
  coletar('tela', dadosTela);
  if(t.oferta){
    tela.innerHTML = htmlOferta();
    rastrear('Quiz_Oferta', { content_name:CONFIG.produto, value:VALOR, currency:'BRL' }, 'ViewContent');
    // Compra pelo Pix: abre o checkout na própria página (assets/js/checkout.js)
    tela.querySelectorAll('.comprar').forEach((b, k)=> b.addEventListener('click', ()=>{
      saiuPor = 'checkout';
      rastrear('Quiz_CliqueCheckout', { value:VALOR, currency:'BRL', botao:k + 1 }, 'InitiateCheckout');
      window.Checkout.abrir({ botao:k + 1 });
    }));
    tela.querySelectorAll('.faq details').forEach((d, k)=> d.addEventListener('toggle', ()=>{ if(d.open) rastrear('Quiz_FAQ', { pergunta:k + 1, texto:d.querySelector('summary').textContent.slice(0,60) }); }));
    vigiarRolagemOferta();
  } else {
    tela.innerHTML = `<section class="tela tela-${t.id}">${t.html}<div class="cta"><button class="btn" id="seguir" type="button">${t.botao}</button></div></section>`;
    document.getElementById('seguir').addEventListener('click', ()=> mostrar(i + 1, true));
    tela.querySelectorAll('details').forEach(d=> d.addEventListener('toggle', ()=>{ if(d.open) rastrear('Quiz_LeuTexto', { tela:t.id }); }));
    if(t.audio) prepararAudio(CONFIG.audios[t.audio], porClique);
  }
  window.scrollTo({top:0, behavior:'instant' in window ? 'instant' : 'auto'});
  try{ history.replaceState(null, '', '#' + t.id); }catch(e){}
}

/* Na oferta: até onde a mãe rolou (25%, 50%, 75%, 100%) */
let rolagemVista = {};
function vigiarRolagemOferta(){
  rolagemVista = {};
  const checar = ()=>{
    if(!TELAS[atual].oferta) return;
    const h = document.documentElement.scrollHeight - innerHeight;
    const pct = h > 0 ? (scrollY / h) * 100 : 100;
    [25, 50, 75, 100].forEach(m=>{ if(pct >= m - 2 && !rolagemVista[m]){ rolagemVista[m] = 1; rastrear('Quiz_OfertaRolou', { pct:m }); } });
  };
  removeEventListener('scroll', window.__rolagem || (()=>{}));
  window.__rolagem = checar;
  addEventListener('scroll', checar, { passive:true });
}

/* Saída: quando a mãe fecha, troca de app ou sai da página, registra em que tela estava e quanto tempo ficou */
function registrarSaida(motivo){
  const dados = { tela:TELAS[atual].id, etapa:atual + 1, etapa_max:etapaMax, seg_na_tela:Math.round((Date.now() - telaDesde)/1000), motivo:saiuPor || motivo };
  pxc('Quiz_Saiu', dados);
  coletar('saiu', dados);
}
addEventListener('pagehide', ()=> registrarSaida('fechou'));
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState === 'hidden') registrarSaida('trocou_de_app'); });

function prepararAudio(src, autoplay){
  const btnPlay = document.getElementById('play');
  const barra = document.getElementById('tempo');
  const seguir = document.getElementById('seguir');
  player = new Audio(src);
  player.preload = 'auto';
  // O botão de seguir fica livre desde o início: quem quiser pode pular o áudio.
  player.addEventListener('timeupdate', ()=>{ if(player && player.duration) barra.style.width = (player.currentTime / player.duration * 100) + '%'; });
  const telaAudio = TELAS[atual].id; let jaTocou = false;
  player.addEventListener('play', ()=>{ btnPlay.textContent = '❚❚'; btnPlay.classList.add('tocando'); btnPlay.setAttribute('aria-label','Pausar áudio');
    if(!jaTocou){ jaTocou = true; rastrear('Quiz_AudioPlay', { tela:telaAudio }); } });
  player.addEventListener('pause', ()=>{ btnPlay.textContent = '▶'; btnPlay.classList.remove('tocando'); btnPlay.setAttribute('aria-label','Tocar áudio'); });
  player.addEventListener('ended', ()=>{ rastrear('Quiz_AudioFim', { tela:telaAudio, segundos:Math.round(player.duration||0) }); player = null; seguir.scrollIntoView({behavior:'smooth', block:'center'}); });
  btnPlay.addEventListener('click', ()=>{ if(!player) return; player.paused ? player.play().catch(()=>{}) : player.pause(); });
  if(autoplay) player.play().catch(()=>{});
}

voltar.addEventListener('click', ()=>{
  // Se o checkout estiver aberto, "voltar" volta para a oferta, não para a tela anterior do quiz
  if(window.Checkout && window.Checkout.aberto()){ rastrear('Quiz_CheckoutVoltou', {}); mostrar(atual, false); return; }
  if(atual > 0){ rastrear('Quiz_Voltou', { de:TELAS[atual].id }); mostrar(atual - 1, false); }
});

/* Os pixels (TikTok e Meta) são carregados no <head> por assets/js/pixels.js */

/* O que o checkout precisa do quiz */
window.Quiz = { rastrear, coletar, SESSAO, UTM, VALOR, tela, voltar,
  telaAtual: ()=> (TELAS[atual]||{}).id,
  irParaOferta: ()=> mostrar(TELAS.length - 1, false) };

coletar('entrou', { referrer:(document.referrer||'').slice(0,200) });

// Se a mãe voltou de um Pix em andamento (recarregou a página), reabre o checkout direto
if(window.Checkout && window.Checkout.pendente()){ mostrar(TELAS.length - 1, false); window.Checkout.abrir({ retomar:true }); }
else mostrar(0, false);
})();
