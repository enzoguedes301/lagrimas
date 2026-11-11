/* Escolhe o provedor Pix pelo .env (PIX_PROVEDOR). Padrão: pixgate.
   Todo provedor implementa a mesma interface:
     criarCobranca(pedido)        -> { provedorId, copiaECola, qrCodeBase64, expiraEm }
     consultar(provedorId)        -> 'pendente' | 'pago' | 'expirado' | 'cancelado'
     tratarWebhook(req)           -> { provedorId, status, detalhes? } | null   (null = ignorar)
*/
const nome = (process.env.PIX_PROVEDOR || 'pixgate').toLowerCase();
const provedores = {
  pixgate: ()=> require('./pixgate'),
  mock: ()=> require('./mock')
};
if(!provedores[nome]) throw new Error(`PIX_PROVEDOR "${nome}" desconhecido. Use: ${Object.keys(provedores).join(', ')}`);
const provedor = provedores[nome]();
provedor.nome = nome;
module.exports = provedor;
