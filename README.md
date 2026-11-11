# Quiz "O Filho de Tantas Lágrimas"

Site do quiz (uma tela por vez, celular) com checkout Pix próprio pela **PixGate**. Sem Cakto, sem cartão.
Todos os arquivos (imagens, áudios, fonte) estão nesta pasta: o site não depende de nada externo além do Pixel da Meta.
Feito para rodar na **Vercel** (site estático + API serverless) e também no computador.

```
index.html              página do quiz (só a casca; o conteúdo vem do JS)
obrigado.html           página depois do Pix confirmado
vercel.json             manda /api/* para a função serverless e põe cache nos assets
package.json            dependências (express, qrcode, dotenv)
api/index.js            função serverless da Vercel (só reexporta server/app.js)
assets/
  css/fonts.css         fonte Inter hospedada localmente
  css/style.css         todo o visual
  js/config.js          <- EDITE AQUI: preço, textos, WhatsApp, Pixel, caminhos das imagens
  js/quiz.js            motor do quiz, telas, oferta e rastreamento
  js/checkout.js        checkout Pix na própria página (dados -> QR Code -> pago)
  img/                  13 imagens do quiz (jpg)
  audio/                mecanismo.mp3 e oracao-dia1.mp3
  fonts/                Inter (woff2)
server/
  app.js                a API: rotas /api/pix/*
  server.js             só para rodar no computador (serve o site + a API em localhost:3000)
  providers/pixgate.js  integração com a PixGate (cashin, consulta, postback)
  providers/mock.js     provedor falso para testar sem conta
  store.js              pedidos: Redis (Upstash) na Vercel, arquivo JSON no computador
  .env.example          modelo de configuração local (copie para server/.env)
```

## Subir na Vercel

1. Importe a pasta no painel da Vercel (ou `npx vercel` no terminal). Framework: **Other**. Sem comando de build.
2. **Banco dos pedidos**: no projeto da Vercel, aba **Storage > Create Database > Upstash Redis** (plano grátis).
   Ao conectar, a Vercel cria sozinha as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN`.
   Sem isso a API avisa no log e os pedidos não ficam guardados (o pagamento ainda confirma, mas a entrega automática não sabe para quem enviar).
3. **Variáveis de ambiente** (Settings > Environment Variables):

   | Variável | Valor |
   |----------|-------|
   | `PIX_PROVEDOR` | `pixgate` |
   | `PIXGATE_API_KEY` | chave da PixGate (Integrações > API Key) |
   | `PIX_VALOR` | `37.00` |
   | `PRODUTO_NOME` | `O Filho de Tantas Lágrimas` |
   | `URL_PUBLICA` | `https://seu-dominio.com.br` (opcional: sem ela a API usa o domínio da própria chamada) |
   | `ENTREGA_WEBHOOK_URL` | webhook do n8n que envia o acesso (opcional) |
   | `ENTREGA_TOKEN` | segredo enviado ao n8n no cabeçalho `X-Entrega-Token` (opcional) |
   | `ADMIN_TOKEN` | segredo para `GET /api/pedidos?token=` |

4. Faça o deploy e abra `https://seu-dominio/api/saude`: deve mostrar `"provedor":"pixgate"` e `"armazenamento":"redis"`.
5. O postback da PixGate vai para `https://seu-dominio/api/pix/webhook/pixgate`. A URL segue junto em cada cobrança,
   não precisa cadastrar no painel da PixGate.

## Rodar no computador

Precisa de Node 18 ou mais novo.

```
copy server\.env.example server\.env      (Linux/Mac: cp server/.env.example server/.env)
npm install
npm start
```

Abra http://localhost:3000. Com `PIX_PROVEDOR=mock` no `server/.env` o checkout funciona inteiro sem conta na PixGate:
o QR Code aparece e o pagamento é confirmado sozinho depois de `MOCK_PAGAR_EM_SEGUNDOS` (ou na hora com
`POST /api/pix/mock/pagar/<id do pedido>`). Com `PIX_PROVEDOR=pixgate` e a chave preenchida, cria cobranças reais.

## Como a PixGate é usada

- Cobrança: `POST https://app.pixgateip.com/api/v1/cashin` com cabeçalho `Apikey`. Devolve só o código copia e cola;
  a imagem do QR Code é gerada pelo nosso servidor.
- Consulta: `GET https://app.pixgateip.com/api/stats/:id`. Nos primeiros segundos após criar, a PixGate pode responder 404;
  o adaptador trata isso como "pendente".
- Postback: a PixGate faz um `POST` na nossa URL quando o Pix cai. Ele **não vem assinado**, então o servidor nunca libera
  um pedido só pela mensagem: sempre reconsulta o status na API antes de marcar como pago.
- A PixGate não envia postback para localhost. Mesmo sem postback o pagamento é confirmado pela consulta a cada poucos segundos.
- A PixGate exige o **CPF** de quem paga, por isso `pedirCpf: true` em `assets/js/config.js`.

## Fluxo do checkout

1. Na oferta, "Quero começar agora" abre o checkout na mesma página (nome, e-mail, WhatsApp, CPF).
2. O site chama `POST /api/pix/criar`. O servidor cria a cobrança na PixGate, gera a imagem do QR Code e guarda o pedido.
3. A tela mostra o QR Code, o botão "Copiar código Pix" e as instruções passo a passo.
4. O site pergunta `GET /api/pix/status/:id` a cada 4 segundos (e quando a mãe volta do app do banco).
5. Quando o Pix cai (postback ou consulta), o servidor marca o pedido como pago e dispara a entrega.
6. A tela mostra "Pagamento confirmado" e leva para `obrigado.html`. O Pixel recebe o evento `Purchase`.

Se a mãe recarregar a página com um Pix em aberto, o checkout reabre direto no QR Code (fica guardado na sessão).

## Entrega do produto

Quando um pedido vira **pago**, o servidor faz um `POST` com o JSON do pedido para `ENTREGA_WEBHOOK_URL`
(por exemplo, um webhook do n8n que envia o e-mail e a mensagem no WhatsApp com o acesso).
O cabeçalho `X-Entrega-Token` leva o valor de `ENTREGA_TOKEN` para o n8n conferir a origem.
Se o envio falhar três vezes, o pedido fica marcado com `entregaPendente: true` (visível em `/api/pedidos`).

Lista de pedidos: `GET /api/pedidos?token=<ADMIN_TOKEN>`.

## Rotas da API

| Rota | O que faz |
|------|-----------|
| `POST /api/pix/criar` | cria a cobrança. Corpo: nome, email, whatsapp (55+DDD+número), cpf, device, utm_* |
| `GET /api/pix/status/:id` | `pendente`, `pago`, `expirado` ou `cancelado` |
| `POST /api/pix/webhook/pixgate` | postback da PixGate |
| `POST /api/pix/mock/pagar/:id` | só com provedor mock: marca como pago |
| `GET /api/pedidos?token=` | lista de pedidos (protegida) |
| `GET /api/saude` | provedor, armazenamento e valor em uso |

## Rastreamento

Os eventos do quiz vão para o Pixel da Meta (`pixelId` em config.js) e, se `coletor` estiver preenchido, para o
seu webhook. Eventos novos do checkout: `Quiz_CheckoutAbriu`, `Quiz_PixGerado` (AddPaymentInfo), `Quiz_PixCopiou`,
`Quiz_PixPago` (Purchase), `Quiz_PixErro`.
