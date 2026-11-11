/* TikTok Events API (eventos enviados pelo servidor).
   Docs: https://business-api.tiktok.com/portal/docs?id=1771101303285761
   Endpoint: POST https://business-api.tiktok.com/open_api/v1.3/event/track/  (cabeçalho Access-Token)
   Precisa no .env: TIKTOK_PIXEL_ID e TIKTOK_ACCESS_TOKEN. TIKTOK_TEST_EVENT_CODE é opcional (aba "Testar eventos").

   Por que existe: a compra no Pix é confirmada aqui no servidor (postback/consulta), muitas vezes com o navegador já fechado.
   O Pixel sozinho perderia essas compras. O servidor envia AddPaymentInfo e PlaceAnOrder ao criar o Pix e CompletePayment ao pagar.
   O Pixel do navegador envia os mesmos eventos com o mesmo event_id, e o TikTok descarta a duplicata. */
const crypto = require('crypto');
const URL_API = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';
const sha = v => v ? crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex') : undefined;

function ligado(){ return !!(process.env.TIKTOK_PIXEL_ID && process.env.TIKTOK_ACCESS_TOKEN); }

/* Mesmo formato de event_id usado no navegador (assets/js/checkout.js): "<id do pedido>:<evento>" */
function eventId(pedido, evento){ return pedido.id + ':' + evento; }

function montar(evento, pedido, extra){
  const tel = pedido.cliente.whatsapp ? '+' + String(pedido.cliente.whatsapp).replace(/\D/g, '') : '';
  const user = {
    email: sha(pedido.cliente.email),
    phone: sha(tel),
    external_id: sha(pedido.id),
    ip: pedido.ip || undefined,
    user_agent: pedido.userAgent || undefined,
    ttclid: (pedido.utm && pedido.utm.ttclid) || undefined,
    ttp: pedido.ttp || undefined
  };
  Object.keys(user).forEach(k=> user[k] === undefined && delete user[k]);
  return Object.assign({
    event: evento,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId(pedido, evento),
    user,
    properties: {
      value: Number(pedido.valor), currency: 'BRL', content_type: 'product',
      contents: [{ content_id: 'devocional-21-dias', content_name: pedido.produto, price: Number(pedido.valor), quantity: 1 }],
      order_id: pedido.id
    },
    page: { url: pedido.origem || undefined }
  }, extra || {});
}

/* Envia um ou mais eventos de um pedido. Nunca derruba o fluxo: erro vira log. */
async function enviar(eventos, pedido){
  if(!ligado()) return false;
  const data = [].concat(eventos).map(e=> montar(e, pedido));
  const corpo = { event_source: 'web', event_source_id: process.env.TIKTOK_PIXEL_ID, data };
  if(process.env.TIKTOK_TEST_EVENT_CODE) corpo.test_event_code = process.env.TIKTOK_TEST_EVENT_CODE;
  try{
    const r = await fetch(URL_API, { method:'POST', headers:{ 'Access-Token': process.env.TIKTOK_ACCESS_TOKEN, 'Content-Type':'application/json' }, body: JSON.stringify(corpo) });
    const j = await r.json().catch(()=>({}));
    if(!r.ok || j.code !== 0){ console.warn('[tiktok] falhou:', r.status, j.code, j.message); return false; }
    console.log('[tiktok] enviado:', data.map(d=> d.event).join(', '), pedido.id);
    return true;
  }catch(e){ console.warn('[tiktok] erro:', e.message); return false; }
}

module.exports = { ligado, enviar, eventId };
