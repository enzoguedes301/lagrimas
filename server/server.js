/* Rodar no computador: serve o site (pasta de cima) e a API no mesmo endereço.
   Na Vercel este arquivo não é usado: o site é estático e a API entra por api/index.js. */
const path = require('path');
const express = require('express');
const app = require('./app');

const PORT = parseInt(process.env.PORT || '3000', 10);
const RAIZ = path.join(__dirname, '..');
app.use(express.static(RAIZ, { extensions:['html'], index:'index.html', setHeaders(res, fp){ if(/\.(jpg|mp3|woff2)$/.test(fp)) res.set('Cache-Control', 'public, max-age=604800'); } }));

app.listen(PORT, ()=> console.log(`Site + API no ar: http://localhost:${PORT}  (provedor Pix: ${app.info.provedor}, pedidos em: ${app.info.armazenamento}, valor ${app.info.valor})`));
