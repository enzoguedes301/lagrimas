/* Onde os pedidos ficam guardados. Escolhe sozinho:
   - Redis (Upstash) quando KV_REST_API_URL/KV_REST_API_TOKEN (ou UPSTASH_REDIS_REST_URL/TOKEN) existirem. É o modo da Vercel:
     funções serverless não têm disco, então sem Redis os pedidos se perdem entre uma chamada e outra.
   - Arquivo JSON (server/data/pedidos.json) no computador local.
   As quatro funções são assíncronas e iguais nos dois modos: obter, porProvedorId, gravar, listar. */
const fs = require('fs');
const path = require('path');

function modoArquivo(){
  const ARQUIVO = path.join(__dirname, 'data', 'pedidos.json');
  let pedidos = {};
  try{ pedidos = JSON.parse(fs.readFileSync(ARQUIVO, 'utf8')); }catch(e){ pedidos = {}; }
  const salvar = ()=>{
    try{ fs.mkdirSync(path.dirname(ARQUIVO), { recursive:true }); fs.writeFileSync(ARQUIVO, JSON.stringify(pedidos, null, 2)); }
    catch(e){ console.error('[store] erro ao salvar:', e.message); }
  };
  return {
    tipo: 'arquivo',
    async obter(id){ return pedidos[id] || null; },
    async porProvedorId(pid){ return Object.values(pedidos).find(p=> p.provedorId === String(pid)) || null; },
    async gravar(p){ pedidos[p.id] = p; salvar(); return p; },
    async listar(){ return Object.values(pedidos).sort((a,b)=> (b.criadoEm||'').localeCompare(a.criadoEm||'')); }
  };
}

function modoRedis(url, token){
  url = url.replace(/\/$/, '');
  async function cmd(...args){
    const r = await fetch(url, { method:'POST', headers:{ 'Authorization':'Bearer ' + token, 'Content-Type':'application/json' }, body: JSON.stringify(args) });
    const j = await r.json().catch(()=>({}));
    if(!r.ok || j.error) throw new Error('Redis: ' + (j.error || r.status));
    return j.result;
  }
  const K = id => 'pedido:' + id;
  return {
    tipo: 'redis',
    async obter(id){ const v = await cmd('GET', K(id)); return v ? JSON.parse(v) : null; },
    async porProvedorId(pid){ const id = await cmd('GET', 'prov:' + pid); return id ? this.obter(id) : null; },
    async gravar(p){
      if(!p.listado){ p.listado = true; await cmd('LPUSH', 'pedidos', p.id); await cmd('LTRIM', 'pedidos', 0, 9999); }
      await cmd('SET', K(p.id), JSON.stringify(p));
      if(p.provedorId) await cmd('SET', 'prov:' + p.provedorId, p.id);
      return p;
    },
    async listar(){
      const ids = await cmd('LRANGE', 'pedidos', 0, 499);
      if(!ids || !ids.length) return [];
      const vals = await cmd('MGET', ...ids.map(K));
      return vals.filter(Boolean).map(v=> JSON.parse(v));
    }
  };
}

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
let store;
if(url && token) store = modoRedis(url, token);
else {
  store = modoArquivo();
  if(process.env.VERCEL) console.warn('[store] AVISO: rodando na Vercel sem Redis. Os pedidos não ficam guardados. Adicione Upstash Redis (KV_REST_API_URL/KV_REST_API_TOKEN).');
}
module.exports = store;
