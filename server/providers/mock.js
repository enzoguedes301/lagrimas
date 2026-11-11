/* Provedor de mentira para testar o checkout inteiro sem conta em banco nenhum.
   Gera um "copia e cola" e um QR Code de verdade (que não paga nada) e, se MOCK_PAGAR_EM_SEGUNDOS > 0,
   marca como pago sozinho depois desse tempo. Também dá para pagar na mão: POST /api/pix/mock/pagar/:id */
const QRCode = require('qrcode');
const cobrancas = {};

module.exports = {
  async criarCobranca(pedido){
    const provedorId = 'mock_' + pedido.id;
    const expiraEm = new Date(Date.now() + pedido.expiraMinutos * 60000).toISOString();
    // Formato parecido com um BR Code real, só para a tela ficar igual à de produção
    const copiaECola = `00020126580014br.gov.bcb.pix0136${pedido.id.padEnd(36,'0').slice(0,36)}5204000053039865406${pedido.valor.toFixed(2)}5802BR5925TESTE SEM VALOR6009SAO PAULO62070503***6304ABCD`;
    const dataUrl = await QRCode.toDataURL(copiaECola, { margin:1, width:320 });
    const qrCodeBase64 = dataUrl.split(',')[1];
    cobrancas[provedorId] = { status:'pendente', expiraEm };
    const seg = parseInt(process.env.MOCK_PAGAR_EM_SEGUNDOS || '0', 10);
    if(seg > 0) setTimeout(()=>{ if(cobrancas[provedorId].status === 'pendente') cobrancas[provedorId].status = 'pago'; }, seg * 1000);
    return { provedorId, copiaECola, qrCodeBase64, expiraEm };
  },
  async consultar(provedorId){
    const c = cobrancas[provedorId];
    if(!c) return 'pendente';
    if(c.status === 'pendente' && new Date(c.expiraEm).getTime() < Date.now()) c.status = 'expirado';
    return c.status;
  },
  pagar(provedorId){ if(cobrancas[provedorId]) cobrancas[provedorId].status = 'pago'; return !!cobrancas[provedorId]; },
  async tratarWebhook(){ return null; }
};
