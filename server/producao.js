/* Configuração de produção embutida no código, para o deploy funcionar sem cadastrar variáveis na Vercel.
   Os valores estão codificados (base64) só para não ficarem em texto puro: quem abrir este arquivo com intenção
   consegue ler. Por isso o repositório PRECISA continuar privado. Se uma chave vazar, gere outra no painel e troque aqui.
   Uma variável de ambiente, quando existir, tem prioridade sobre este arquivo.
   Para gerar um valor novo: node -e "console.log(Buffer.from('VALOR').toString('base64'))" */
const d = s => Buffer.from(s, 'base64').toString('utf8');

const CODIFICADO = {
  PIX_PROVEDOR: 'cGl4Z2F0ZQ==',
  PIXGATE_API_KEY: 'cGl4Z2F0ZV9saXZlX0NqVmJseDRVTWtCNG1EU3EzV2ZNSnNUY0lKV3RQOVdX',
  PIXGATE_CLIENT_ID: 'N01JTC1zdWIwMQ==',
  PIX_VALOR: 'MzcuMDA=',
  PIX_EXPIRA_MINUTOS: 'MzA=',
  PRODUTO_NOME: 'TyBGaWxobyBkZSBUYW50YXMgTMOhZ3JpbWFz',
  TIKTOK_PIXEL_ID: 'REJROEhMSkM3N1VCUTRQRFVIVUc=',
  TIKTOK_ACCESS_TOKEN: 'MGI0MWQyYmQ5ZjhmYmE3OWI1ZDI2YzQzYzNiYmE5YTAwOTY1NTcyMw==',
  ADMIN_TOKEN: 'bGFncmltYXMtN21pbC0yMDI2'
  // ENTREGA_WEBHOOK_URL e ENTREGA_TOKEN: cadastre aqui (codificados) ou na Vercel quando o n8n estiver pronto
};

/* Preenche process.env com o que ainda não existir */
module.exports = function aplicar(){
  for(const k of Object.keys(CODIFICADO)){
    if(!process.env[k]) process.env[k] = d(CODIFICADO[k]);
  }
};
