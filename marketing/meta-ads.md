# Briefing Meta Ads: Quiz "O Filho de Tantas Lágrimas"

Produto: devocional digital católico, 21 dias de oração com Santa Mônica pela vida do filho. Preço R$ 37 no Pix.
Destino do anúncio: o quiz (uma tela por vez, feito para celular). A compra acontece dentro do site, sem sair.

## 1. Estrutura da campanha

| Item | Configuração |
|------|--------------|
| Objetivo | Vendas (conversões no site) |
| Evento de otimização | Purchase (disparado quando o Pix é confirmado) |
| Pixel | 1072740581471884 |
| Orçamento | CBO na campanha, R$ 60 a R$ 100/dia para começar |
| Conjuntos | 1 conjunto aberto (Advantage+) e 1 conjunto por interesses, mesmos criativos |
| Anúncios | 3 a 5 criativos por conjunto |
| Atribuição | 7 dias clique, 1 dia visualização |
| Dispositivos | Só celular (o quiz e o Pix são para celular) |

Eventos extras que o site já envia, para colunas e públicos: ViewContent (chegou na oferta), InitiateCheckout (clicou em comprar), AddPaymentInfo (Pix gerado), Purchase (Pix pago). Eventos personalizados Quiz_01_capa até Quiz_13_oferta mostram em que tela as mães param.

URL do anúncio (troque o domínio):
```
https://SEU-DOMINIO/?utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.name}}
```
Os UTMs chegam até o pedido no servidor, então dá para ver qual anúncio vendeu em /api/pedidos.

## 2. Público

Perfil: mulher, 45 a 65+ anos, católica praticante, mãe de filho adulto ou adolescente que se afastou (bebida, más amizades, drogas, tristeza, longe de Deus). Reza há anos e sente que nada muda. Usa o celular, principalmente Facebook e WhatsApp, lê devagar, letra grande.

Conjunto A, Advantage+ (recomendado para começar): Brasil, mulheres, 45 a 65+, sem interesses. Deixe o algoritmo aprender com o Purchase.

Conjunto B, interesses (Brasil, mulheres, 45 a 65+), um só grupo com "ou":
- Igreja Católica, Catolicismo, Nossa Senhora Aparecida, Terço, Rosário, Santa Mônica, Santo Agostinho
- Canção Nova, TV Aparecida, Padre Fábio de Melo, Padre Marcelo Rossi, Padre Reginaldo Manzotti, Padre Pio
- Oração, Bíblia, Devocional, Espiritualidade
Comportamento opcional: compradores engajados.

Depois de 50 compras: público semelhante 1% de Purchase e de InitiateCheckout, e remarketing de quem chegou na oferta (ViewContent) e não comprou, 7 dias.

Exclusões: quem comprou (Purchase 180 dias).

## 3. Posicionamentos

Manual, só celular:
- Facebook: Feed, Reels, Stories, Marketplace
- Instagram: Feed, Reels, Stories
Desligar: Audience Network, Messenger, vídeos in-stream, coluna direita, artigos instantâneos.

Formatos por posicionamento: 4:5 (1080x1350) para Feed; 9:16 (1080x1920) para Stories e Reels. Subir os dois para cada criativo.

Para esse público o Facebook Feed costuma ser o maior volume. Reels do Facebook vem crescendo em 50+.

## 4. Textos dos anúncios

Regras da Meta que valem aqui: não afirmar nada sobre a pessoa que vê o anúncio ("seu filho está nas drogas", "você é católica"). Falar da história de Santa Mônica e do devocional, não da vida de quem lê. Não prometer que o filho muda, nem prazo. Não usar antes e depois.

### Texto principal (acima da imagem)

Versão 1, história:
> Santa Mônica rezou 17 anos por um filho que se perdeu nas festas e nas más companhias. Um bispo disse a ela: "Não é possível que se perca o filho de tantas lágrimas." Aquele filho virou Santo Agostinho.
>
> O devocional O Filho de Tantas Lágrimas são 21 dias de oração com Santa Mônica, 5 minutos por manhã, uma área da vida do filho por dia.
>
> Faça o quiz de 2 minutos e veja os 3 passos. 🙏

Versão 2, mecanismo:
> Muitas mães contam a mesma coisa: rezam há anos pelo filho e sentem que nada muda. Não é falta de fé. Depois de tanto tempo, a oração vira um pedido só, repetido no cansaço.
>
> O Filho de Tantas Lágrimas ensina a rezar com direção: 21 dias com Santa Mônica, uma oração por dia, feita pelo nome do filho, e a Consagração no Dia 21.
>
> Toque e faça o quiz. Leva 2 minutos, não precisa de cadastro.

Versão 3, curta:
> 21 dias de oração com Santa Mônica pela vida do filho. 5 minutos por manhã, uma área da vida dele por dia. Faça o quiz e veja os 3 passos. 🙏

### Título (até 40 caracteres)

1. Reze pelo seu filho com direção
2. 21 dias de oração com Santa Mônica
3. O Filho de Tantas Lágrimas
4. Ela rezou 17 anos. Ele virou santo.
5. 5 minutos por manhã, 21 dias

### Descrição (até 30 caracteres)

1. Quiz de 2 minutos. Sem cadastro.
2. Devocional de 21 dias. R$ 37.
3. Comece hoje pelo Dia 1.

### Botão

"Saiba mais" (o anúncio leva ao quiz, não direto à compra).

## 5. Criativos

Usar as imagens que já estão no projeto, em assets/img:
- abertura.jpg (mãe abraçando o filho na igreja): criativo de esperança, combina com o Título 1
- monica.jpg (pintura de Santa Mônica e Agostinho): criativo de história, combina com a Versão 1
- passo2.jpg (filho preso por correntes, mãe rezando): criativo de dor, o mais forte, combina com a Versão 2
- mockup.jpg (devocional no celular e impresso): criativo de produto, combina com a Versão 3

Vídeo: Reel de 30 a 45 s com o áudio da Ana (assets/audio/mecanismo.mp3) sobre as imagens, legenda grande na tela, e no final "Faça o quiz". Para o público 50+, legenda em letra grande e fala pausada.

Texto na imagem: pouco, letra grande, em cima da foto. Exemplos: "Rezo há anos e nada muda?" (só como pergunta geral, sem "você"), "21 dias com Santa Mônica", "Não é possível que se perca o filho de tantas lágrimas".

## 6. Nomes e acompanhamento

Nome da campanha: `QUIZ // Vendas // CBO // Pix`
Conjuntos: `Mulher 45-65 // Advantage` e `Mulher 45-65 // Interesses católicos`
Anúncios: `V1 historia // monica`, `V2 mecanismo // correntes`, `V3 curta // mockup`, `Reel // Ana`

Primeiros 3 dias: não mexer. Avaliar com: custo por Purchase (meta até R$ 15 para dar margem no R$ 37), taxa de InitiateCheckout por clique, e no Gerenciador de Eventos onde o quiz perde mais gente (Quiz_01 a Quiz_13). Desligar criativo com CPM alto e sem InitiateCheckout após R$ 60 gastos.
