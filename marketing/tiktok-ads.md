# Briefing TikTok Ads: Quiz "O Filho de Tantas Lágrimas"

Produto: devocional digital católico, 21 dias de oração com Santa Mônica pela vida do filho. Preço R$ 37 no Pix.
Destino do anúncio: o quiz (uma tela por vez, feito para celular). A compra acontece dentro do site, sem sair.

No TikTok o anúncio é o vídeo. Não existe título, descrição e texto principal como na Meta: existe o vídeo, um texto curto
de até 100 caracteres, o nome de exibição e o botão. O vídeo faz 90% do trabalho.

## 1. Antes de subir: Pixel do TikTok

O site já está preparado. Falta só o ID:
1. Gerenciador de Anúncios > Ferramentas > Eventos > Eventos da web > Conectar fonte de dados > Pixel do TikTok > instalação manual.
2. Copie o ID (começa com letra, ex.: `D0ABC12DEF3GH4`) e cole em `tiktokPixelId` no arquivo `assets/js/config.js`.
3. Suba a mudança (git push). Teste com a extensão TikTok Pixel Helper no Chrome: na oferta deve aparecer ViewContent; ao clicar em comprar, InitiateCheckout; ao gerar o Pix, AddPaymentInfo; ao pagar, CompletePayment.

Eventos que o site envia ao TikTok: ViewContent (chegou na oferta), InitiateCheckout (clicou em comprar),
AddPaymentInfo (Pix gerado), CompletePayment (Pix pago, com valor em BRL). O e-mail e o telefone do checkout
são enviados com hash (Advanced Matching) para o TikTok casar a compra com quem clicou. O `ttclid` do clique é guardado no pedido.

## 2. Estrutura da campanha

| Item | Configuração |
|------|--------------|
| Objetivo | Conversões no site |
| Evento de otimização | CompletePayment (compra). Enquanto tiver menos de 50 compras por semana, otimizar por InitiateCheckout e trocar depois |
| Orçamento | Orçamento de campanha (CBO) R$ 80 a R$ 150/dia. Mínimo do TikTok é R$ 50/dia por conjunto |
| Conjuntos | 1 conjunto Smart Targeting (aberto) e 1 conjunto por interesses e hashtags |
| Anúncios | 4 a 6 vídeos por conjunto, Smart Creative desligado no começo |
| Lance | Custo mais baixo. Depois de estabilizar, Custo máximo em R$ 15 por compra |
| Atribuição | 7 dias clique, 1 dia visualização |
| Dispositivo | Só celular. Sistema: Android e iOS |

URL do anúncio (troque o domínio; o TikTok adiciona o ttclid sozinho):
```
https://SEU-DOMINIO/?utm_source=tiktok&utm_medium=paid&utm_campaign=__CAMPAIGN_NAME__&utm_term=__AID_NAME__&utm_content=__CID_NAME__
```
Os UTMs chegam até o pedido no servidor, então dá para ver qual vídeo vendeu em /api/pedidos.

## 3. Público

Perfil: mulher, 45 a 65 anos, católica praticante, mãe de filho adulto ou adolescente que se afastou (bebida, más amizades,
drogas, tristeza, longe de Deus). Reza há anos e sente que nada muda. No TikTok ela assiste vídeos de oração, padres,
Santa Mônica, terço, mensagens de fé. Comenta "Amém" e marca as amigas.

Atenção: no TikTok o público 45+ é menor que na Meta, mas cresce rápido e é barato. Não feche demais.

Conjunto A, Smart Targeting (recomendado para começar): Brasil, mulheres, 35 a 55+ (no TikTok a última faixa é 55+), sem interesses.
Deixe o algoritmo achar as mães pelos vídeos.

Conjunto B, interesses e comportamentos (Brasil, mulheres, 35 a 55+):
- Interesses: Religião e espiritualidade; Família e relacionamentos; Educação (desenvolvimento pessoal)
- Interações com vídeos (assistiu até o fim, curtiu ou comentou nos últimos 15 dias), por hashtag:
  #oração #oracao #oraçãododia #católicos #catolicos #igrejacatólica #santamônica #santamonica #terço #rosário
  #padrefabiodemelo #padremarcelorossi #padrereginaldomanzotti #cançãonova #nossasenhoraaparecida #mãe #mães #fé
- Interações com criadores: categoria Religião e espiritualidade
- Palavras-chave adicionais: oração pelos filhos, mãe que reza, filho afastado de Deus, Santa Mônica

Depois de 50 compras: público semelhante (Lookalike) de CompletePayment e de InitiateCheckout, amplo.
Remarketing: quem viu a oferta (ViewContent) e não comprou, 7 dias. Excluir CompletePayment 180 dias.

## 4. Posicionamentos

Só TikTok. Desmarcar Pangle e Global App Bundle (rede de parceiros, tráfego ruim para esse público).
Desligar "comentários do usuário"? Não. Deixe comentários ligados: nesse nicho os "Amém" e as histórias das mães nos comentários
viram prova social e aumentam a conversão. Modere diariamente e responda.
Desligar download e compartilhamento do vídeo: tanto faz, pode deixar ligado.

Formato único: vídeo vertical 9:16, 1080x1920, 15 a 45 segundos, com som. Legenda queimada no vídeo, letra grande,
porque o público 50+ lê e muitas vezes assiste sem som. Zona segura: nada importante nos 15% de baixo nem na direita (ícones do TikTok).

## 5. O texto do anúncio (até 100 caracteres)

Regras do TikTok: não afirmar nada sobre quem vê ("seu filho usa drogas"). Não prometer resultado nem prazo. Sem "cura".
Religião é permitida; o cuidado é não ofender nem usar imagens sagradas de forma sensacionalista.

Opções (escolha 2 ou 3 e teste):
1. Santa Mônica rezou 17 anos pelo filho. 21 dias de oração com ela, 5 min por manhã. Faça o quiz 🙏
2. Reza há anos pelo filho e sente que nada muda? Não é falta de fé. Veja os 3 passos no quiz 🙏
3. 21 dias de oração pela vida do filho, uma área por dia, com Santa Mônica. Quiz de 2 minutos.
4. "Não é possível que se perca o filho de tantas lágrimas." Reze com direção. Toque e veja 🙏
5. Devocional O Filho de Tantas Lágrimas: 21 dias com Santa Mônica. Comece hoje pelo Dia 1.

Nome de exibição: `Filho de Tantas Lágrimas`
Botão: `Saiba mais`
Imagem de perfil do anúncio: a capa do devocional (assets/img/capa.jpg) ou a imagem de Santa Mônica (assets/img/monica.jpg).

## 6. Os vídeos (o que importa de verdade)

Cada vídeo tem que prender nos 2 primeiros segundos, parecer conteúdo e não anúncio, e terminar mandando para o quiz.
Usar as imagens e o áudio que já estão no projeto (assets/img e assets/audio), mais filmagens simples de celular.

Vídeo 1, "Ana fala" (mecanismo). 30 a 40 s. Mulher 50+ olhando para a câmera, luz natural, sem edição pesada.
Pode usar o áudio pronto da Ana (assets/audio/mecanismo.mp3) com imagens por cima.
- Gancho (0 a 2 s), legenda grande: "Você reza há anos pelo seu filho e nada muda?"
- "Não é falta de fé. Depois de tanto tempo a oração vira um pedido só, repetido no cansaço."
- "Uma oração genérica não alcança uma garra específica: a bebida, as amizades, a tristeza, o afastamento de Deus."
- "Santa Mônica rezou 17 anos pelo filho. E ele virou santo."
- Fechamento: "Eu montei 21 dias de oração com ela, uma área da vida do seu filho por dia. Toque em Saiba mais e faça o quiz."

Vídeo 2, "História de Santa Mônica". 25 a 35 s. Imagem monica.jpg com zoom lento, voz feminina calma, música de órgão baixa.
- Gancho: "Essa mãe rezou 17 anos por um filho perdido."
- "Agostinho se perdeu nas festas e nas más companhias. Ela não parou de rezar."
- "Até um bispo dizer: não é possível que se perca o filho de tantas lágrimas."
- "Aquele filho virou Santo Agostinho."
- Fechamento: "Se você também é uma mãe de muitas lágrimas, reza com ela 21 dias. O quiz está no link."

Vídeo 3, "Correntes" (dor). 20 a 30 s. Imagem passo2.jpg (filho preso por correntes, mãe rezando) com as etiquetas
aparecendo uma por uma: más amizades, bebida, drogas, tristeza, longe de Deus.
- Gancho: "Cada garra que prende um filho tem um nome."
- "E a mãe que reza por tudo de uma vez acaba não rezando por nada."
- "No devocional O Filho de Tantas Lágrimas é um dia para cada garra, na ordem certa."
- Fechamento: "Dia 21: a consagração ao Sagrado Coração. Faça o quiz."

Vídeo 4, "Oração do Dia 1" (conteúdo puro). 40 a 60 s. A oração do Dia 1 inteira, rezada com calma, imagem oracao.jpg
(vela, terço, foto sobre a Bíblia). Esse vídeo não vende: ele reza. Ao final: "Essa é a oração do Dia 1 dos 21 dias. Os outros 20 estão no link."
Costuma ser o que mais engaja e mais entrega barato nesse nicho. Ótimo para Spark Ads.

Vídeo 5, "Tela do celular". 15 a 25 s. Gravação da tela passando pelo quiz e pelo devocional (mockup.jpg),
voz dizendo o que a mãe recebe: "21 dias, 5 minutos por manhã, leitura, reflexão, a oração pelo nome dele e um gesto simples por dia. Pagamento no Pix, R$ 37."

Vídeo 6, "Depoimento" (quando houver depoimentos reais e com autorização). Mãe contando em 30 s como foi rezar com direção. Nada de promessa de mudança do filho; só a mudança na oração e na paz dela.

Spark Ads: publique os vídeos 2 e 4 no perfil do TikTok do devocional como conteúdo orgânico, deixe 2 ou 3 dias, e impulsione
como Spark Ad os que tiverem mais comentários. Spark Ads entregam mais barato e levam os comentários junto.

## 7. Nomes e acompanhamento

Campanha: `QUIZ // Conversoes // CBO // Pix`
Conjuntos: `Mulher 35-55+ // Smart` e `Mulher 35-55+ // Fe e hashtags`
Anúncios: `V1 Ana fala`, `V2 Santa Monica`, `V3 Correntes`, `V4 Oracao dia 1`, `V5 Tela celular`

Primeiros 3 dias: não mexer, o TikTok precisa de 50 eventos para sair da fase de aprendizado.
Olhar: taxa de visualização de 2 s e de 6 s (gancho), CTR (meta acima de 1%), custo por InitiateCheckout,
custo por CompletePayment (meta até R$ 15 para dar margem no R$ 37) e os eventos Quiz_01 a Quiz_13 para ver onde o quiz perde gente.
Vídeo com visualização de 6 s abaixo de 10% ou sem InitiateCheckout após R$ 80 gastos: desligar e trocar o gancho.
Trocar criativos a cada 7 a 10 dias: no TikTok o vídeo cansa rápido.
