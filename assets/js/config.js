/* ============ EDITE AQUI ============
   Tudo o que muda com frequência fica neste arquivo. O resto do site não precisa ser tocado. */
window.CONFIG = {
  produto: 'O Filho de Tantas Lágrimas',      // nome do produto (aparece no checkout e nos eventos)
  preco: 'R$ 37,00',                           // preço à vista que aparece na oferta (o valor cobrado de verdade fica no servidor: server/.env)
  precoDe: 'R$ 97,00',                         // preço riscado ("de"); deixe '' para não mostrar
  parcelas: 'pagamento no Pix, na hora',       // linha embaixo do preço; '' para não mostrar

  /* Checkout Pix próprio pela PixGate (substitui o checkout da Cakto). Só Pix, sem cartão.
     api: endereço do servidor em server/. '' = mesmo domínio do site (recomendado: o servidor serve o site e a API juntos).
     Exemplo em produção com domínios separados: 'https://api.devocionalfilhodelagrimas.com.br' */
  api: '',
  pedirCpf: true,                              // a PixGate exige o CPF de quem paga; deixe true
  paginaObrigado: 'obrigado.html',             // para onde a mãe vai depois do Pix confirmado

  garantiaDias: 7,                             // dias de garantia; 0 esconde o bloco
  whatsappSuporte: '5511914608952',            // número de suporte só com dígitos, ex.: 5575999999999; '' esconde
  instagram: 'devocionalfilhodetantaslagrimas',
  tiktokPixelId: 'DBQ8HLJC77UBQ4PDUHUG',       // ID do Pixel do TikTok (Gerenciador de Anúncios > Ativos > Eventos > Web); '' desliga
  pixelId: '1072740581471884',                 // ID do Pixel da Meta; '' desliga
  coletor: '',                                 // endereço que grava os eventos no nosso banco (webhook do n8n); '' desliga
  depoimentos: [],                             // prints REAIS das mães, ex.: ['assets/img/dep1.jpg']; vazio esconde

  audios: { mecanismo: 'assets/audio/mecanismo.mp3', oracao: 'assets/audio/oracao-dia1.mp3' },
  capa: 'assets/img/capa.jpg',
  // Imagens de apoio de cada tela. Coloque o caminho do arquivo; vazio mostra o espaço tracejado com a descrição.
  imagens: {
    abertura: 'assets/img/abertura.jpg', // 1
    fe:       'assets/img/fe.jpg',       // 2
    ana:      'assets/img/ana.jpg',      // 3
    mockup:   'assets/img/mockup.jpg',   // 4 (aparece nas telas 4, 10 e na oferta)
    passo1:   'assets/img/passo1.jpg',   // 5
    oracao:   'assets/img/oracao.jpg',   // 6
    passo2:   'assets/img/passo2.jpg',   // 7
    passo3:   'assets/img/passo3.jpg',   // 8
    monica:   'assets/img/monica.jpg',   // 9
    escolha:  'assets/img/escolha.jpg',  // 10 (na oferta)
    paraquem: 'assets/img/paraquem.jpg', // tela "para quem é"
    perfil:   'assets/img/perfil.jpg'    // print do perfil do Instagram
  }
};
/* ==================================== */
