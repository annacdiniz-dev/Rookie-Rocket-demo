/* =====================================================================
   ROOKIE ROCKET · demo local em 3D (three.js r128, sem servidor)
   Visual inspirado em jogos de blocos + estética do storyboard
   (traje branco, faixas marinho/vermelho, logotipo de rastro vermelho).

   Fluxo: idioma → astronauta + nome → jogo.
   Mapa (eixo Z negativo = "para frente"):
     Recepção (z 25 → -25)  → Corredor 1 → Museu KSC (z -55 → -145)
     → Corredor 2 (parede oposta) → Hangar (z -175 → -235)
     No hangar: nave RR-01, escada à direita → plataforma → elevador
     → braço de acesso à nave.
   ===================================================================== */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
const toque = matchMedia('(pointer: coarse)').matches;
if (toque) document.body.classList.add('touch');

/* ---------------- salvamento ---------------- */
const SAVE = 'rookie-rocket-v4';
const estado = { lang: '', nome: '', av: { g: '' }, capacete: false, feitas: [], expos: [], estrelas: 0, equip: [] };
try {
  const s = JSON.parse(localStorage.getItem(SAVE) || '{}');
  if (s.lang === 'pt' || s.lang === 'en') estado.lang = s.lang;
  if (typeof s.nome === 'string') estado.nome = s.nome.slice(0, 20);
  if (s.av && (s.av.g === 'h' || s.av.g === 'm')) estado.av = { g: s.av.g };
  estado.capacete = s.capacete === true;
  if ([1, 2, 3].includes(s.estrelas)) estado.estrelas = s.estrelas; // melhor resultado da Fase 1
  // últimas escolhas da Preparação (só ids que existem no dados.js)
  if (Array.isArray(s.equip)) estado.equip = s.equip.filter(id => DADOS.equipamentos.some(e => e.id === id));
  if (Array.isArray(s.feitas)) estado.feitas = s.feitas.filter(x => typeof x === 'string');
  if (Array.isArray(s.expos)) estado.expos = s.expos.filter(x => typeof x === 'string' && DADOS.registros[x]);
} catch (e) { /* segue sem salvar */ }
function salvar() { try { localStorage.setItem(SAVE, JSON.stringify(estado)); } catch (e) {} }
const sessao = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }, del(k) { try { sessionStorage.removeItem(k); } catch (e) {} } };

/* ---------------- idioma ---------------- */
let L = null;
function fmt(s) {
  const f = estado.av.g === 'm';
  return String(s).split('{nome}').join(nomeJogador())
    .split('{o}').join(f ? 'a' : 'o').split('{O}').join(f ? 'A' : 'O').split('{a}').join(f ? 'a' : '');
}
function nomeJogador() { return estado.nome || (L ? fmtSemNome(L.nomePadrao) : 'Rookie'); }
function fmtSemNome(s) { const f = estado.av.g === 'm'; return s.split('{o}').join(f ? 'a' : 'o'); }

function aplicarTextos() {
  document.documentElement.lang = L.codigo;
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = fmt(L.ui[e.dataset.i18n] || ''); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = L.ui[e.dataset.i18nHtml] || ''; }); // textos fixos do dados.js
  document.querySelectorAll('[data-i18n-ph]').forEach(e => { e.placeholder = L.ui[e.dataset.i18nPh] || ''; });
  document.querySelectorAll('[data-i18n-title]').forEach(e => { e.title = L.ui[e.dataset.i18nTitle] || ''; e.setAttribute('aria-label', e.title); });
  document.querySelectorAll('[data-i18n-label]').forEach(e => { e.setAttribute('aria-label', L.ui[e.dataset.i18nLabel] || ''); });
  $('sb-tagline').textContent = L.ui.tagline;
  $('btn-lang-txt').textContent = estado.lang === 'pt' ? 'EN' : 'PT';
  // créditos: nome do desafio escolhido (clicar abre a página do desafio)
  $('cr-desafio').href = DADOS.desafio.url;
  $('cr-desafio-nome').textContent = DADOS.desafio.nome; $('cr-desafio-evento').textContent = DADOS.desafio.evento + ' ↗';
  // créditos: equipe em destaque
  const eq = $('cr-equipe'); eq.innerHTML = '';
  DADOS.equipe.forEach(n => { const s = document.createElement('span'); s.textContent = n; eq.appendChild(s); });
  // créditos: lista de registros
  const box = $('cr-list'); box.innerHTML = '';
  const a0 = document.createElement('a'); a0.href = DADOS.desafio.url; a0.target = '_blank'; a0.rel = 'noopener noreferrer'; a0.textContent = L.ui.cr_desafio;
  const d0 = document.createElement('div'); d0.append(a0); box.appendChild(d0);
  const vistos = new Set();
  const linha = (r, titulo) => {
    if (vistos.has(r.id)) return; vistos.add(r.id);
    const d = document.createElement('div');
    const a = document.createElement('a'); a.href = 'https://images.nasa.gov/details/' + encodeURIComponent(r.id); a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = r.id;
    d.append(a, ` · ${r.credito} · ${titulo}`); box.appendChild(d);
  };
  Object.entries(DADOS.registros).forEach(([k, regs]) => regs.forEach(r => linha(r, L.expos[k].titulo)));
  DADOS.album.forEach(c => { if (c.registro) linha(c.registro, L.cards[c.id].nome); });
  const dn = document.createElement('div');
  const an = document.createElement('a'); an.href = DADOS.ntrs.url; an.target = '_blank'; an.rel = 'noopener noreferrer'; an.textContent = 'NTRS ' + DADOS.ntrs.id;
  dn.append(an, ' · NASA Technical Reports Server · Friendship 7'); box.appendChild(dn);
}

/* ---------------- tela inicial ---------------- */
const PELE = '#c98e63';
/* Card inicial: idioma → nome → gênero → JOGAR.
   Trocar idioma aqui é instantâneo: o mundo 3D só é montado ao clicar em JOGAR. */
let mundo = null;
const HINT_BILINGUE = 'Escolha um idioma para começar · Choose a language to start';
function atualizarStart() {
  document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.lang === estado.lang)));
  document.querySelectorAll('[data-g]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.g === estado.av.g)));
  $('form-rest').classList.toggle('off', !L);
  $('start-hint').textContent = L ? '' : HINT_BILINGUE;
}
function escolherIdioma(lang) {
  if (mundo && estado.lang !== lang) { // jogo já montado: recarrega no novo idioma
    estado.lang = lang; salvar(); sessao.set('rr-abrir', 'jogo'); location.reload(); return;
  }
  estado.lang = lang; salvar();
  L = DADOS.idiomas[lang];
  aplicarTextos(); atualizarStart();
}
document.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { escolherIdioma(b.dataset.lang); $('name-input').focus(); });
document.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { estado.av.g = b.dataset.g; salvar(); if (L) aplicarTextos(); atualizarStart(); });
$('name-input').value = estado.nome;
$('name-input').addEventListener('input', () => { estado.nome = $('name-input').value.trim().slice(0, 20); });
$('start-form').addEventListener('submit', e => { e.preventDefault(); iniciarJogo(false); });
function carregarFonte() {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  const fontes = Promise.all([document.fonts.load('40px Michroma'), document.fonts.load('700 20px Outfit')]).catch(() => {});
  return Promise.race([fontes, new Promise(r => setTimeout(r, 1500))]);
}
carregarFonte(); // já começa a baixar a fonte
function iniciarJogo(retorno) {
  if (!L) { $('start-hint').textContent = HINT_BILINGUE; return; }
  if (!estado.av.g) { $('start-hint').textContent = L.ui.escolha_genero; return; }
  estado.nome = $('name-input').value.trim().slice(0, 20); salvar();
  const btn = $('play-btn'); btn.disabled = true; btn.textContent = L.ui.carregando;
  // deixa o navegador pintar o "Carregando…" antes de montar o mundo
  setTimeout(() => carregarFonte().then(() => {
    try {
      if (!mundo) mundo = criarMundo();
      mundo.jogar(retorno);
    } catch (err) { console.error(err); $('start-hint').textContent = String(err && err.message || err); }
    btn.disabled = false; btn.textContent = L.ui.jogar;
  }), 60);
}
if (estado.lang) { L = DADOS.idiomas[estado.lang]; aplicarTextos(); }
atualizarStart();

/* ================================================================
   MUNDO 3D (montado depois da escolha do idioma)
   ================================================================ */
function criarMundo() {
const P_ = L.placas;
const TIT = 'Michroma, "Segoe UI", sans-serif';
const TXT = 'Outfit, "Segoe UI", system-ui, sans-serif';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('game').appendChild(renderer.domElement);
renderer.domElement.tabIndex = 0;

const scene = new THREE.Scene();
const CEU = new THREE.Color('#9fcff5');
scene.background = CEU;
scene.fog = new THREE.Fog(CEU, 160, 520);
const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 1200);
scene.add(new THREE.HemisphereLight(0xffffff, 0x50607a, 0.62));
scene.add(new THREE.AmbientLight(0xffffff, 0.28));
const sol = new THREE.DirectionalLight(0xffffff, 0.55);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 1, far: 320 });
sol.shadow.bias = -0.0008;
scene.add(sol, sol.target);
function redimensionar() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', redimensionar); redimensionar();

const MARINHO = '#16284f', VERMELHO = '#e3262b', OSSO = '#ece9e2';

/* ---------------- materiais ---------------- */
function canvasStud() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = 'rgba(0,0,0,.07)'; g.fillRect(0, 62, 64, 2); g.fillRect(62, 0, 2, 64);
  g.fillStyle = 'rgba(0,0,0,.16)'; g.beginPath(); g.arc(34, 35, 17, 0, 7); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(31, 31, 17, 0, 7); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.09)'; g.lineWidth = 2; g.stroke();
  return c;
}
const texStud = new THREE.CanvasTexture(canvasStud());
texStud.wrapS = texStud.wrapT = THREE.RepeatWrapping;
texStud.anisotropy = renderer.capabilities.getMaxAnisotropy();
const cacheMat = new Map();
function mat(cor, o = {}) {
  const k = cor + (o.neon ? 'N' : '') + (o.vidro ? 'V' : '') + (o.stud ? 'S' : '') + (o.dupla ? 'D' : '');
  if (cacheMat.has(k)) return cacheMat.get(k);
  let m;
  if (o.neon) m = new THREE.MeshBasicMaterial({ color: cor });
  else if (o.vidro) m = new THREE.MeshLambertMaterial({ color: cor, transparent: true, opacity: 0.25, depthWrite: false });
  else if (o.stud) m = new THREE.MeshLambertMaterial({ color: cor, map: texStud });
  else m = new THREE.MeshLambertMaterial({ color: cor, side: o.dupla ? THREE.DoubleSide : THREE.FrontSide });
  cacheMat.set(k, m);
  return m;
}
const matTex = c => { const t = new THREE.CanvasTexture(c); t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return new THREE.MeshLambertMaterial({ map: t }); };

/* ---------------- mundo físico ---------------- */
const solidos = [], bloqueiaCam = [], clicaveis = [];
function colisor(x0, x1, y0, y1, z0, z1) {
  const s = { min: new THREE.Vector3(x0, y0, z0), max: new THREE.Vector3(x1, y1, z1), off: false };
  solidos.push(s); return s;
}
function bloco(x0, x1, y0, y1, z0, z1, cor, o = {}) {
  const w = x1 - x0, h = y1 - y0, d = z1 - z0;
  const geo = new THREE.BoxGeometry(w, h, d);
  let material;
  if (o.stud) {
    const uv = geo.attributes.uv;
    for (let i = 8; i < 12; i++) uv.setXY(i, uv.getX(i) * w / 2, uv.getY(i) * d / 2);
    const lado = mat(o.lado || cor);
    material = [lado, lado, mat(cor, { stud: true }), lado, lado, lado];
  } else material = mat(cor, o);
  const m = new THREE.Mesh(geo, material);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = o.sombra === true || (o.sombra !== false && !o.neon && !o.vidro && h < 30 && w < 40 && d < 40);
  m.receiveShadow = !o.neon;
  scene.add(m);
  if (o.solido !== false) { m.userData.solido = colisor(x0, x1, y0, y1, z0, z1); if (o.cam !== false) bloqueiaCam.push(m); }
  return m;
}
function cil(rTopo, rBase, h, cor, x, y, z, o = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTopo, rBase, h, o.seg || 28), o.material || mat(cor, o));
  m.position.set(x, y + h / 2, z); m.castShadow = !o.neon; m.receiveShadow = true;
  (o.pai || scene).add(m); return m;
}

/* ---------------- placas com texto ---------------- */
function quebrar(g, texto, larg) {
  const palavras = String(texto).split(' '); const linhas = []; let atual = '';
  for (const p of palavras) { const t = atual ? atual + ' ' + p : p; if (g.measureText(t).width > larg && atual) { linhas.push(atual); atual = p; } else atual = t; }
  if (atual) linhas.push(atual); return linhas;
}
function canvasPlaca(w, h, desenhar) {
  const ch = 256, cw = Math.min(2048, Math.round(ch * w / h));
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  desenhar(c.getContext('2d'), cw, ch); return c;
}
const fonte = (l, tam) => (l.peso && l.peso < 900) ? `${l.peso} ${tam}px ${TXT}` : `${tam}px ${TIT}`;
function logoCanvas(g, x, y, s) { // logotipo: duas faixas vermelhas inclinadas (mesmo desenho do SVG)
  const k = s / 100, P = (a, b) => [x + a * k, y + b * k];
  g.fillStyle = VERMELHO;
  g.beginPath(); g.moveTo(...P(4, 96)); g.lineTo(...P(64, 22)); g.quadraticCurveTo(...P(80, 8), ...P(99, 3)); g.lineTo(...P(37, 96)); g.fill();
  g.beginPath(); g.moveTo(...P(46, 96)); g.lineTo(...P(87, 34)); g.quadraticCurveTo(...P(92, 24), ...P(97, 17)); g.lineTo(...P(73, 96)); g.fill();
}
function placa(linhas, w, h, o = {}) {
  const c = canvasPlaca(w, h, (g, cw, ch) => {
    g.fillStyle = o.fundo || MARINHO; g.fillRect(0, 0, cw, ch);
    if (o.faixa) { g.fillStyle = o.faixa; g.fillRect(0, ch - 18, cw, 18); }
    if (o.borda) { g.strokeStyle = o.borda; g.lineWidth = 10; g.strokeRect(5, 5, cw - 10, ch - 10); }
    const tot = linhas.reduce((a, l) => a + (l.tam || 60) * 1.18, 0);
    let y = (ch - tot) / 2;
    g.textAlign = 'center'; g.textBaseline = 'top';
    for (const l of linhas) {
      let tam = l.tam || 60; g.font = fonte(l, tam);
      while (g.measureText(l.t).width > cw * 0.9 && tam > 10) { tam -= 2; g.font = fonte(l, tam); }
      g.fillStyle = l.cor || '#fff';
      g.fillText(l.t, cw / 2, y + ((l.tam || 60) - tam) / 2);
      y += (l.tam || 60) * 1.18;
    }
  });
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: o.dupla ? THREE.DoubleSide : THREE.FrontSide }));
  if (o.pos) m.position.set(...o.pos);
  if (o.rot) m.rotation.y = o.rot;
  scene.add(m); m.userData.canvas = c; m.userData.tex = tex;
  return m;
}

/* ================================================================
   ASTRONAUTAS (estética do storyboard)
   ================================================================ */
function cv(w, h, f) { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; }
function fundoTraje(g, w, h) {
  g.fillStyle = OSSO; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.045)';
  for (let y = h / 4; y < h; y += h / 4) g.fillRect(0, y, w, 2);
  for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.03})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
}
const TRAJE = (() => {
  const torsoFrente = cv(256, 256, (g, w, h) => {
    fundoTraje(g, w, h);
    g.fillStyle = MARINHO; g.fillRect(0, 0, w, 10);
    for (const x of [46, 182]) { g.fillStyle = '#8a8f99'; g.fillRect(x, 0, 28, h); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x + 24, 0, 4, h); g.fillStyle = '#6f7480'; g.fillRect(x + 4, 150, 20, 14); }
    logoCanvas(g, 140, 26, 54);
    g.fillStyle = '#c9ccd2'; g.fillRect(96, 92, 64, 54); g.strokeStyle = '#7d828d'; g.lineWidth = 4; g.strokeRect(96, 92, 64, 54);
    g.fillStyle = '#3a3f4a'; g.fillRect(106, 102, 18, 14); g.fillRect(132, 102, 18, 14);
    g.fillStyle = '#2a5bd7'; g.fillRect(120, 124, 16, 12);
    g.strokeStyle = '#4b5160'; g.lineWidth = 6; g.beginPath(); g.moveTo(112, 146); g.quadraticCurveTo(108, 165, 100, 178); g.moveTo(146, 146); g.quadraticCurveTo(152, 170, 160, 190); g.stroke();
    for (const [x, y, c] of [[100, 184, '#2a5bd7'], [160, 198, '#d3262b']]) { g.fillStyle = '#7d828d'; g.beginPath(); g.arc(x, y, 15, 0, 7); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(x, y, 11, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(x - 3, y - 3, 4, 0, 7); g.fill(); }
  });
  const torsoLado = cv(128, 256, (g, w, h) => { fundoTraje(g, w, h); g.fillStyle = MARINHO; g.fillRect(0, 0, w, 10); });
  const torsoCostas = cv(256, 256, (g, w, h) => { fundoTraje(g, w, h); g.fillStyle = MARINHO; g.fillRect(0, 0, w, 10); for (const x of [46, 182]) { g.fillStyle = '#8a8f99'; g.fillRect(x, 0, 28, h); } });
  const braco = logo => cv(128, 256, (g, w, h) => {
    fundoTraje(g, w, h);
    g.fillStyle = VERMELHO; g.fillRect(0, 70, w, 9); g.fillStyle = MARINHO; g.fillRect(0, 84, w, 12);
    g.fillStyle = MARINHO; g.fillRect(0, 168, w, 24);
    if (logo) { g.fillStyle = MARINHO; g.textAlign = 'center'; g.font = `900 22px ${TXT}`; g.fillText('ROOKIE', w / 2, 30); g.fillText('ROCKET', w / 2, 54); }
  });
  const pernaFrente = cv(128, 256, (g, w, h) => {
    fundoTraje(g, w, h);
    g.strokeStyle = '#b9b5ab'; g.lineWidth = 4; g.strokeRect(26, 26, 76, 60); g.beginPath(); g.moveTo(26, 44); g.lineTo(102, 44); g.stroke();
    g.fillStyle = '#5f6470'; g.fillRect(28, 110, 72, 40); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(32, 114, 64, 8);
    g.fillStyle = MARINHO; g.fillRect(0, 170, w, 14);
  });
  const pernaLado = cv(128, 256, (g, w, h) => { fundoTraje(g, w, h); g.fillStyle = MARINHO; g.fillRect(0, 170, w, 14); });
  const osso = mat(OSSO);
  return {
    torso: [matTex(torsoLado), matTex(torsoLado), osso, osso, matTex(torsoFrente), matTex(torsoCostas)],
    bracoE: (() => { const b = matTex(braco(false)); return [b, matTex(braco(true)), osso, osso, b, b]; })(),
    bracoD: (() => { const b = matTex(braco(false)); return [b, b, osso, osso, b, b]; })(),
    perna: (() => { const l = matTex(pernaLado); return [l, l, osso, osso, matTex(pernaFrente), l]; })()
  };
})();
function rosto(pele, f, sobr = '#1b1b1b') {
  const c = cv(384, 128, (g) => {
    g.fillStyle = pele; g.fillRect(0, 0, 384, 128);
    g.fillStyle = '#1b1b1b';
    g.beginPath(); g.ellipse(176, 56, 7, 12, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(208, 56, 7, 12, 0, 0, 7); g.fill();
    g.strokeStyle = sobr; g.lineCap = 'round';
    // sem cílios: só sobrancelhas (mais finas no rosto feminino)
    g.lineWidth = f ? 4 : 6; g.beginPath(); g.moveTo(164, 36); g.lineTo(186, 34); g.moveTo(198, 34); g.lineTo(220, 36); g.stroke();
    g.strokeStyle = '#1b1b1b'; g.lineWidth = 6; g.beginPath(); g.arc(192, 70, 20, 0.22 * Math.PI, 0.78 * Math.PI); g.stroke();
  });
  return new THREE.CanvasTexture(c);
}
const TEX_BR = new THREE.CanvasTexture(cv(70, 50, g => {
  g.fillStyle = '#009c3b'; g.fillRect(0, 0, 70, 50);
  g.fillStyle = '#ffdf00'; g.beginPath(); g.moveTo(35, 5); g.lineTo(65, 25); g.lineTo(35, 45); g.lineTo(5, 25); g.fill();
  g.fillStyle = '#002776'; g.beginPath(); g.arc(35, 25, 11, 0, 7); g.fill();
}));
const vidroViseira = new THREE.MeshLambertMaterial({ color: '#8fb4e0', transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide });

function astronauta(cfg) {
  const g = new THREE.Group();
  const f = cfg.g === 'm', pele = cfg.pele || PELE;
  const caixa = (w, h, d, material, pai, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); m.position.set(x, y, z); m.castShadow = true; pai.add(m); return m; };
  const membro = (x, y, materiais, ponta, pontaH) => {
    const piv = new THREE.Group(); piv.position.set(x, y, 0); g.add(piv);
    caixa(1, 2, 1, materiais, piv, 0, -1, 0);
    if (ponta) ponta(piv);
    return piv;
  };
  caixa(2, 2, 1, cfg.estatua ? mat('#9aa1ad') : TRAJE.torso, g, 0, 3, 0);
  const bota = piv => { caixa(1.08, 0.55, 1.12, mat('#f3f2ee'), piv, 0, -1.72, 0.03); caixa(1.1, 0.16, 1.16, mat('#4a4f5a'), piv, 0, -1.94, 0.03); };
  const mao = piv => caixa(0.9, 0.5, 0.9, mat(pele), piv, 0, -2.2, 0);
  const pm = cfg.estatua ? mat('#9aa1ad') : TRAJE.perna;
  const pernaE = membro(-0.5, 2, pm, cfg.estatua ? null : bota);
  const pernaD = membro(0.5, 2, pm, cfg.estatua ? null : bota);
  const bracoE = membro(-1.5, 4, cfg.estatua ? mat('#9aa1ad') : TRAJE.bracoE, cfg.estatua ? null : mao);
  const bracoD = membro(1.5, 4, cfg.estatua ? mat('#9aa1ad') : TRAJE.bracoD, cfg.estatua ? null : mao);
  // gola marinho
  if (!cfg.estatua) { const gola = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.85, 0.3, 24), mat(MARINHO)); gola.position.y = 4.08; g.add(gola); }
  // cabeça
  const cabeca = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.2, 24, 1, false, Math.PI, Math.PI * 2),
    cfg.estatua ? mat('#9aa1ad') : [new THREE.MeshLambertMaterial({ map: rosto(pele, f, cfg.sobrancelha) }), mat(pele), mat(pele)]);
  cabeca.position.set(0, 4.82, 0); cabeca.castShadow = true; g.add(cabeca);
  // cabelo
  const cabeloLongo = new THREE.Group(); g.add(cabeloLongo);
  if (cfg.cabelo) {
    // Cabelo liso que cobre a cabeça inteira (sem falhas no topo).
    // 'liso' = curto padrão (masculino e Marcos) · 'chanel' = liso e curto até o queixo (feminino)
    const m = mat(cfg.corCabelo || '#2b1a12');
    // Dentro do capacete ficam só o topo e a franja (cabem inteiros na bolha de vidro);
    // nuca, laterais e a parte de baixo do chanel ficam em "cabeloLongo" e somem com o capacete.
    const topo = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.64, 0.28, 22), m); topo.position.set(0, 5.44, 0); topo.castShadow = true; g.add(topo);
    caixa(0.98, 0.18, 0.18, m, g, 0, 5.36, 0.52);                                    // franja
    caixa(1.3, 0.72, 0.26, m, cabeloLongo, 0, 5.08, -0.56);                         // nuca
    caixa(0.2, 0.6, 0.9, m, cabeloLongo, -0.64, 5.14, -0.1); caixa(0.2, 0.6, 0.9, m, cabeloLongo, 0.64, 5.14, -0.1); // laterais
    if (cfg.cabelo === 'chanel') { // parte de baixo do chanel
      caixa(1.3, 0.62, 0.26, m, cabeloLongo, 0, 4.46, -0.56);
      caixa(0.2, 0.62, 0.82, m, cabeloLongo, -0.66, 4.56, -0.14); caixa(0.2, 0.62, 0.82, m, cabeloLongo, 0.66, 4.56, -0.14);
    }
    if (cfg.cabelo === 'cacheado') { // cachos volumosos (como no storyboard): bolinhas por cima de toda a cabeça
      const cacho = new THREE.SphereGeometry(0.25, 10, 8), cachoP = new THREE.SphereGeometry(0.2, 10, 8);
      const pos = [[0, 5.7, 0, 1]];
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; pos.push([Math.cos(a) * 0.34, 5.66, Math.sin(a) * 0.34, 1]); }           // topo
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; pos.push([Math.cos(a) * 0.6, 5.5, Math.sin(a) * 0.6, 1]); }           // coroa (inclui a testa)
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; if (Math.sin(a) > 0.45) continue; pos.push([Math.cos(a) * 0.7, 5.22, Math.sin(a) * 0.7, 0]); } // laterais e trás (sem cobrir o rosto)
      for (let i = 0; i < 7; i++) { const a = Math.PI + 0.25 + i / 6 * (Math.PI - 0.5); pos.push([Math.cos(a) * 0.66, 4.95, Math.sin(a) * 0.66, 0]); } // nuca
      for (const [x, y, z, grande] of pos) {
        const c = new THREE.Mesh(grande ? cacho : cachoP, m); c.position.set(x, y, z); c.castShadow = true;
        cabeloLongo.add(c); // somem com o capacete; por dentro fica só a base lisa (topo + franja)
      }
    }
  }
  // capacete
  const capacete = new THREE.Group(); capacete.position.y = 4.85; g.add(capacete);
  if (!cfg.estatua) {
    const R = 1.02, W = 1.9, branco = mat('#f4f3ef', { dupla: true });
    const s1 = new THREE.Mesh(new THREE.SphereGeometry(R, 28, 10, 0, Math.PI * 2, 0, 0.62), branco);
    const s2 = new THREE.Mesh(new THREE.SphereGeometry(R, 28, 12, Math.PI / 2 + W / 2, Math.PI * 2 - W, 0.62, 1.3), branco);
    const s3 = new THREE.Mesh(new THREE.SphereGeometry(R, 28, 8, 0, Math.PI * 2, 1.92, 0.72), branco);
    const vis = new THREE.Mesh(new THREE.SphereGeometry(R * 0.995, 24, 12, Math.PI / 2 - W / 2, W, 0.62, 1.3), vidroViseira);
    [s1, s2, s3].forEach(m => { m.castShadow = true; capacete.add(m); }); capacete.add(vis);
    const luz = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.1), mat(VERMELHO, { neon: true })); luz.position.set(0, -0.38, 0.95); luz.rotation.x = -0.4; capacete.add(luz);
    for (const s of [-1, 1]) {
      const o = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 18), mat('#b8bcc4')); o.rotation.z = Math.PI / 2; o.position.x = s * 1.0; capacete.add(o);
      const o2 = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.22, 14), mat('#8a8f99')); o2.rotation.z = Math.PI / 2; o2.position.x = s * 1.03; capacete.add(o2);
    }
  }
  capacete.visible = !!cfg.cap; cabeloLongo.visible = !cfg.cap;
  // mochila de suporte de vida
  if (!cfg.estatua) { caixa(1.7, 1.8, 0.6, mat('#e4e1d9'), g, 0, 3.05, -0.82); caixa(1.72, 0.2, 0.62, mat(MARINHO), g, 0, 3.7, -0.82); }
  if (cfg.bandeira) { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.53), new THREE.MeshBasicMaterial({ map: TEX_BR })); b.position.set(0.51, -0.55, 0); b.rotation.y = Math.PI / 2; bracoD.add(b); }
  g.userData = { pernaE, pernaD, bracoE, bracoD, fase: 0, capacete, cabeloLongo };
  scene.add(g);
  return g;
}
function definirCapacete(b, cap) { b.userData.capacete.visible = cap; b.userData.cabeloLongo.visible = !cap; }
function animarBoneco(b, vel, dt, noAr) {
  const u = b.userData;
  u.fase += dt * (vel > 0.1 ? 11 : 2);
  const a = noAr ? 0.35 : vel > 0.1 ? Math.sin(u.fase) * 0.85 : 0;
  u.pernaE.rotation.x = a; u.pernaD.rotation.x = -a;
  if (!u.acenando) { u.bracoE.rotation.x = noAr ? -2.6 : -a; u.bracoD.rotation.x = noAr ? -2.6 : a; u.bracoD.rotation.z = 0; }
}

/* ---------------- interações ---------------- */
const interativos = [];
function interativo(o) {
  o.raio = o.raio || 8; interativos.push(o);
  (o.alvos || []).forEach(m => m.traverse(n => { n.userData.inter = o; clicaveis.push(n); }));
  return o;
}
function soClique(grupo, pos, acao) {
  const it = { pos, raio: 0, rotulo: '', acao }; interativos.push(it);
  grupo.traverse(n => { n.userData.inter = it; if (n.isMesh) clicaveis.push(n); });
}

/* ================================================================
   CONSTRUÇÃO DO MUNDO
   ================================================================ */
function sala(c) {
  const { x0, x1, z0, z1, h } = c;
  bloco(x0 - 1, x1 + 1, -1, 0, z0 - 1, z1 + 1, c.chao, { stud: true, lado: c.chaoLado || c.chao });
  bloco(x0, x1, h, h + 1, z0, z1, c.teto, { sombra: false });
  bloco(x0 - 1, x0, 0, h, z0, z1, c.parede, { sombra: false });
  bloco(x1, x1 + 1, 0, h, z0, z1, c.parede, { sombra: false });
  const pa = c.portaAlt || 12;
  for (const [lado, z] of [['sul', z1], ['norte', z0 - 1]]) {
    const vao = c[lado];
    if (c.vidroSul && lado === 'sul') continue;
    if (!vao) { bloco(x0 - 1, x1 + 1, 0, h, z, z + 1, c.parede, { sombra: false }); continue; }
    bloco(x0 - 1, vao[0], 0, h, z, z + 1, c.parede, { sombra: false });
    bloco(vao[1], x1 + 1, 0, h, z, z + 1, c.parede, { sombra: false });
    bloco(vao[0], vao[1], pa, h, z, z + 1, c.parede, { sombra: false });
    for (const zz of [z - 0.05, z + 1.05]) {
      bloco(vao[0] - 0.5, vao[0], 0, pa, zz - 0.05, zz + 0.05, c.neon, { neon: true, solido: false });
      bloco(vao[1], vao[1] + 0.5, 0, pa, zz - 0.05, zz + 0.05, c.neon, { neon: true, solido: false });
      bloco(vao[0] - 0.5, vao[1] + 0.5, pa, pa + 0.5, zz - 0.05, zz + 0.05, c.neon, { neon: true, solido: false });
    }
  }
  if (c.faixa) for (const [a, b] of [[x0 + 0.02, x0 + 0.1], [x1 - 0.1, x1 - 0.02]]) {
    bloco(a, b, 0, 3, z0, z1, c.faixa, { solido: false, sombra: false });
    if (c.faixa2) bloco(a, b + 0.02, 3, 3.5, z0, z1, c.faixa2, { solido: false, sombra: false, neon: true });
  }
  if (c.luzes) for (let z = z1 - 8; z > z0 + 4; z -= c.luzes) bloco(x0 + 6, x1 - 6, h - 0.15, h, z - 0.6, z + 0.6, '#f4fbff', { neon: true, solido: false });
}
function setaChao(x, z, cor) {
  const s = new THREE.Shape();
  s.moveTo(0, 2.2); s.lineTo(-1.8, 0); s.lineTo(-0.7, 0); s.lineTo(-0.7, -2); s.lineTo(0.7, -2); s.lineTo(0.7, 0); s.lineTo(1.8, 0); s.closePath();
  const m = new THREE.Mesh(new THREE.ShapeGeometry(s), mat(cor, { neon: true }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.03, z); scene.add(m); return m;
}
function anelChao(x, y, z, r, cor) {
  const m = new THREE.Mesh(new THREE.RingGeometry(r - 0.35, r, 40), mat(cor, { neon: true }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.04, z); scene.add(m); return m;
}
const totens = [];
function totem(x, z, rot, chave, y = 0) {
  const expo = L.expos[chave];
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rot; scene.add(g);
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.2, 1.3), mat(MARINHO)); base.position.y = 1.6; base.castShadow = true; g.add(base);
  const faixa = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.25, 1.32), mat(VERMELHO, { neon: true })); faixa.position.y = 0.5; g.add(faixa);
  const c = canvasPlaca(3.2, 2, (gg, cw, ch) => {
    gg.fillStyle = '#f1efe9'; gg.fillRect(0, 0, cw, ch);
    gg.fillStyle = MARINHO; gg.fillRect(0, 0, cw, 48);
    logoCanvas(gg, 14, 8, 32);
    gg.fillStyle = '#fff'; gg.font = `20px ${TIT}`; gg.textAlign = 'center'; gg.fillText(P_.totem_topo, cw / 2 + 12, 32);
    gg.fillStyle = MARINHO; gg.font = `800 38px ${TXT}`;
    quebrar(gg, expo.titulo, cw - 40).slice(0, 3).forEach((l, i) => gg.fillText(l, cw / 2, 108 + i * 46));
    gg.fillStyle = VERMELHO; gg.fillRect(0, ch - 40, cw, 40);
    gg.font = `800 22px ${TXT}`; gg.fillStyle = '#fff'; gg.fillText(toque ? '👆' : P_.totem_pe, cw / 2, ch - 13);
  });
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }));
  tela.position.set(0, 3.55, 0.25); tela.rotation.x = -0.45; g.add(tela);
  const moldura = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 0.2), mat('#0d1830')); moldura.position.set(0, 3.5, 0.13); moldura.rotation.x = -0.45; g.add(moldura);
  const anel = anelChao(x, y, z, 3, VERMELHO);
  colisor(x - 1.5, x + 1.5, y, y + 3.2, z - 1.5, z + 1.5);
  const it = interativo({ pos: new THREE.Vector3(x, y + 4.8, z), raio: 8, rotulo: L.prompt.ver, objeto: expo.titulo, acao: () => abrirExpo(chave), alvos: [g], chave });
  totens.push({ g, anel, chave, it });
  return it;
}

/* ---------- RECEPÇÃO ---------- */
sala({ x0: -30, x1: 30, z0: -25, z1: 25, h: 22, chao: '#e9eef5', parede: '#f4f6fa', teto: '#dfe6ef', norte: [-7, 7], vidroSul: true, faixa: MARINHO, faixa2: VERMELHO, luzes: 9, neon: '#5fd4ff' });
bloco(-31, 31, 0, 22, 25, 25.6, '#bfe6ff', { vidro: true, sombra: false });
for (let x = -30; x <= 30; x += 10) bloco(x - 0.4, x + 0.4, 0, 22, 24.9, 25.7, '#c9d2de', { cam: false });
bloco(-31, 31, 0, 1, 24.9, 25.7, '#c9d2de');
bloco(-31, 31, 21, 22, 24.9, 25.7, '#c9d2de');
{ // emblema no piso: logotipo do storyboard
  const c = canvasPlaca(1, 1, (g, cw, ch) => {
    g.clearRect(0, 0, cw, ch);
    g.fillStyle = MARINHO; g.beginPath(); g.arc(cw / 2, ch / 2, ch / 2 - 4, 0, 7); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 6; g.stroke();
    g.fillStyle = '#fff'; for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 50 + (i * 37) % 60; g.fillRect(cw / 2 + Math.cos(a) * r, ch / 2 - 20 + Math.sin(a) * r * 0.6, 4, 4); }
    logoCanvas(g, cw / 2 - 52, 46, 104);
    g.fillStyle = '#fff'; g.font = `22px ${TIT}`; g.textAlign = 'center'; g.fillText('ROOKIE ROCKET', cw / 2, 196);
  });
  const m = new THREE.Mesh(new THREE.CircleGeometry(9, 48), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
  m.rotation.x = -Math.PI / 2; m.position.set(0, 0.03, 8); m.receiveShadow = true; scene.add(m);
}
bloco(-11, 11, 0, 3.4, -12, -9, '#ffffff');
bloco(-11.05, 11.05, 1.6, 1.85, -9.08, -8.92, VERMELHO, { solido: false, neon: true });
bloco(-11.3, 11.3, 3.4, 3.8, -12.3, -8.7, '#c8d3e2');
placa([{ t: P_.recepcao, tam: 64 }, { t: P_.programa, tam: 34, cor: '#ffcf3f', peso: 800 }], 12, 2.6, { pos: [0, 2.2, -8.9] });
// globo terrestre de mesa: mapa desenhado, eixo inclinado, sem anel
const texGlobo = new THREE.CanvasTexture(cv(512, 256, (g, w, h) => {
  g.fillStyle = '#2a73c9'; g.fillRect(0, 0, w, h);
  const blob = (pts, cor) => { g.fillStyle = cor; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x * w, y * h) : g.moveTo(x * w, y * h)); g.closePath(); g.fill(); };
  const verde = '#4caf5a', seco = '#b9a35a';
  blob([[.06, .22], [.16, .14], [.27, .18], [.31, .3], [.26, .42], [.2, .47], [.15, .4], [.1, .33]], verde);      // América do Norte
  blob([[.24, .5], [.31, .52], [.35, .62], [.31, .78], [.27, .9], [.25, .74], [.22, .6]], verde);                 // América do Sul
  blob([[.46, .18], [.55, .14], [.6, .2], [.56, .3], [.48, .32]], verde);                                         // Europa
  blob([[.46, .36], [.57, .35], [.62, .48], [.58, .66], [.52, .78], [.48, .6], [.44, .46]], seco);                // África
  blob([[.58, .14], [.76, .1], [.9, .18], [.92, .3], [.8, .42], [.7, .44], [.62, .34]], verde);                    // Ásia
  blob([[.8, .62], [.9, .6], [.93, .72], [.85, .78], [.79, .72]], seco);                                           // Oceania
  g.fillStyle = '#eef3f7'; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 14, w, 14);                                  // polos
  g.fillStyle = 'rgba(255,255,255,.55)';
  for (let i = 0; i < 16; i++) { g.beginPath(); g.ellipse((i * 37) % w, 30 + (i * 53) % (h - 60), 26, 6, 0, 0, 7); g.fill(); }
}));
const globo = new THREE.Mesh(new THREE.SphereGeometry(2.2, 32, 24), new THREE.MeshLambertMaterial({ map: texGlobo }));
const eixoGlobo = new THREE.Group(); eixoGlobo.position.set(-7, 6.8, -10.5); eixoGlobo.rotation.z = 0.41; scene.add(eixoGlobo); // 23,5°
globo.castShadow = true; eixoGlobo.add(globo);
cil(0.8, 1.1, 2.3, '#c8d3e2', -7, 3.8, -10.5);
cil(0.12, 0.12, 0.9, '#9aa1ad', -7, 4.1, -10.5);
const telao = placa([{ t: ' ', tam: 50 }], 26, 7.5, { pos: [0, 16.4, -24.4] });
function desenharTelao() {
  const c = telao.userData.canvas, g = c.getContext('2d'), cw = c.width, ch = c.height;
  g.fillStyle = MARINHO; g.fillRect(0, 0, cw, ch);
  g.fillStyle = VERMELHO; g.fillRect(0, ch - 20, cw, 20);
  logoCanvas(g, 22, 22, 46);
  g.fillStyle = '#c9d3ea'; g.font = `20px ${TIT}`; g.textAlign = 'center'; g.fillText(P_.telao_topo, cw / 2 + 20, 56);
  let tam = 72; const txt = fmt(P_.telao_bemvindo) + nomeJogador().toUpperCase() + '!';
  do { g.font = `${tam}px ${TIT}`; tam -= 3; } while (g.measureText(txt).width > cw * 0.9);
  g.fillStyle = '#fff'; g.fillText(txt, cw / 2, 152);
  g.font = `700 28px ${TXT}`; g.fillStyle = '#c9d3ea'; g.fillText(P_.telao_pe, cw / 2, 212);
  telao.userData.tex.needsUpdate = true;
}
bloco(-13.6, 13.6, 12.4, 20.4, -24.95, -24.55, '#0d1526', { solido: false });
function planta(x, z) { bloco(x - 1, x + 1, 0, 1.6, z - 1, z + 1, '#f4f6fa'); bloco(x - 0.9, x + 0.9, 1.6, 4, z - 0.9, z + 0.9, '#3ab35e', { solido: false }); bloco(x - 0.6, x + 0.6, 4, 5.2, z - 0.6, z + 0.6, '#4fd27a', { solido: false }); }
planta(-27, -22); planta(27, -22); planta(-27, 21); planta(27, 21);
for (const [x, z] of [[-22, 6], [22, 6], [-22, 15], [22, 15]]) bloco(x - 0.8, x + 0.8, 0, 1.5, z - 3, z + 3, MARINHO, { stud: true });
placa([{ t: P_.poster1a, tam: 40, cor: MARINHO }, { t: P_.poster1b, tam: 48, cor: VERMELHO }], 10, 6, { pos: [-29.4, 10, -6], rot: Math.PI / 2, fundo: '#f1efe9', borda: MARINHO });
placa([{ t: P_.poster2a, tam: 44, cor: MARINHO }, { t: P_.poster2b, tam: 44, cor: VERMELHO }], 10, 6, { pos: [29.4, 10, -6], rot: -Math.PI / 2, fundo: '#f1efe9', borda: MARINHO });
/* ---------- totem do jogo oficial (Roblox) ----------
   Fica à direita de quem entra, virado para a entrada. Apertar E (ou tocar) abre o banner com o link. */
let anelJogo = null;
{
  const kx = 14, kz = 3, g = new THREE.Group(); g.position.set(kx, 0, kz); g.rotation.y = -Math.PI / 4; scene.add(g);
  const peca = (w, h, d, material, y, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); m.position.set(0, y, z); m.castShadow = true; g.add(m); return m; };
  peca(4.4, 7.6, 1.2, mat(MARINHO), 3.8);                       // corpo
  peca(4.44, 0.3, 1.24, mat(VERMELHO, { neon: true }), 0.6);    // faixa de luz embaixo
  peca(4.9, 0.5, 1.6, mat(VERMELHO, { neon: true }), 7.85);     // topo iluminado
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 5.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv(512, 735, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0d1830'); gr.addColorStop(1, '#24407a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = '#fff'; for (let i = 0; i < 40; i++) c.fillRect((i * 97) % w, (i * 151) % (h - 200), 3, 3); // estrelinhas
    logoCanvas(c, w / 2 - 70, 40, 140);
    c.textAlign = 'center';
    c.fillStyle = '#ffcf3f'; c.font = `26px ${TIT}`; c.fillText(P_.jogo_topo, w / 2, 232);
    c.fillStyle = '#fff'; c.font = `34px ${TIT}`; c.fillText('ROOKIE ROCKET', w / 2, 284);
    c.font = `800 62px ${TXT}`; c.fillText(P_.jogo_l1, w / 2, 388); c.fillText(P_.jogo_l2, w / 2, 456);
    c.fillStyle = VERMELHO; c.fillRect(46, 500, w - 92, 110);                                                 // "botão"
    c.fillStyle = '#fff'; c.font = `800 50px ${TXT}`; c.fillText(P_.jogo_botao, w / 2, 572);
    c.font = `700 30px ${TXT}`; c.fillStyle = '#c9d3ea'; c.fillText(toque ? '👆 ' + P_.jogo_pe_toque : P_.jogo_pe, w / 2, 680);
  })) }));
  tela.position.set(0, 4.2, 0.62); g.add(tela);
  anelJogo = anelChao(kx, 0, kz, 3.6, '#ffcf3f');
  colisor(kx - 1.9, kx + 1.9, 0, 8, kz - 1.9, kz + 1.9);
  interativo({ pos: new THREE.Vector3(kx, 5, kz), raio: 9, rotulo: L.prompt.jogar, objeto: L.prompt.jogo, acao: () => abrirRoblox(true), alvos: [g] });
}
/* ---------- quadros decorativos (arte original: céu, Lua e afins) ---------- */
function quadroDecor(x, y, z, rot, w, h, pintar) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rot; scene.add(g);
  const moldura = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, h + 0.6, 0.25), mat('#2b2f3a')); g.add(moldura);
  const filete = new THREE.Mesh(new THREE.BoxGeometry(w + 0.18, h + 0.18, 0.27), mat('#c9a246')); g.add(filete);
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv(Math.round(256 * w / h), 256, pintar)) }));
  tela.position.z = 0.15; g.add(tela);
  bloco(-0.2 + x, 0.2 + x, y - h / 2 - 0.9, y - h / 2 - 0.5, z - 0.2, z + 0.2, '#f4fbff', { neon: true, solido: false }); // luz de galeria
}
const estrelasCeu = (g, w, h, n, max = 2.2) => { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(255,255,255,${0.4 + Math.random() * 0.6})`; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, Math.random() * max, 0, 7); g.fill(); } };
const fundoNoite = (g, w, h, a, b) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, w, h); };
// 1) Lua cheia
quadroDecor(-29.75, 10, 7, Math.PI / 2, 6.5, 5, (g, w, h) => {
  fundoNoite(g, w, h, '#0a1230', '#1c2a5c'); estrelasCeu(g, w, h, 70);
  const cx = w * 0.55, cy = h * 0.48, r = h * 0.32;
  const gl = g.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.6); gl.addColorStop(0, 'rgba(255,250,220,.35)'); gl.addColorStop(1, 'rgba(255,250,220,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
  g.fillStyle = '#ecebe2'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
  g.fillStyle = 'rgba(120,120,128,.35)';
  for (const [dx, dy, rr] of [[-.3, -.2, .22], [.25, .1, .28], [-.1, .35, .15], [.35, -.35, .12], [-.45, .2, .1], [.05, -.05, .1]]) { g.beginPath(); g.arc(cx + dx * r, cy + dy * r, rr * r, 0, 7); g.fill(); }
});
// 2) Céu estrelado com a Via Láctea
quadroDecor(-29.75, 10, 17, Math.PI / 2, 6.5, 5, (g, w, h) => {
  fundoNoite(g, w, h, '#05070f', '#14204a');
  g.save(); g.translate(w / 2, h / 2); g.rotate(-0.5);
  const vl = g.createLinearGradient(0, -h * 0.25, 0, h * 0.25); vl.addColorStop(0, 'rgba(160,140,255,0)'); vl.addColorStop(0.5, 'rgba(210,200,255,.35)'); vl.addColorStop(1, 'rgba(160,140,255,0)');
  g.fillStyle = vl; g.fillRect(-w, -h * 0.25, w * 2, h * 0.5); g.restore();
  estrelasCeu(g, w, h, 220, 1.6); estrelasCeu(g, w, h, 12, 3);
  g.fillStyle = '#0b0f1e'; g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * 0.82); g.quadraticCurveTo(w * 0.3, h * 0.72, w * 0.55, h * 0.84); g.quadraticCurveTo(w * 0.8, h * 0.76, w, h * 0.8); g.lineTo(w, h); g.fill(); // morros
});
// 3) Planeta com anéis
quadroDecor(29.75, 10, 7, -Math.PI / 2, 6.5, 5, (g, w, h) => {
  fundoNoite(g, w, h, '#1a0f2e', '#0a1230'); estrelasCeu(g, w, h, 80);
  const cx = w * 0.5, cy = h * 0.52, r = h * 0.24;
  g.strokeStyle = 'rgba(230,200,150,.85)'; g.lineWidth = 10; g.beginPath(); g.ellipse(cx, cy, r * 2, r * 0.55, -0.25, Math.PI, 2 * Math.PI); g.stroke();
  const pl = g.createLinearGradient(cx, cy - r, cx, cy + r); pl.addColorStop(0, '#f2d49b'); pl.addColorStop(0.5, '#d9a35f'); pl.addColorStop(1, '#a8743c');
  g.fillStyle = pl; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 5; for (const k of [-.4, 0, .4]) { g.beginPath(); g.moveTo(cx - r, cy + k * r); g.lineTo(cx + r, cy + k * r); g.stroke(); }
  g.strokeStyle = 'rgba(230,200,150,.85)'; g.lineWidth = 10; g.beginPath(); g.ellipse(cx, cy, r * 2, r * 0.55, -0.25, 0, Math.PI); g.stroke();
});
// 4) Nascer da Terra visto da Lua
quadroDecor(29.75, 10, 17, -Math.PI / 2, 6.5, 5, (g, w, h) => {
  g.fillStyle = '#04060c'; g.fillRect(0, 0, w, h); estrelasCeu(g, w, h, 50, 1.3);
  const cx = w * 0.6, cy = h * 0.38, r = h * 0.17;
  g.fillStyle = '#2f7fd6'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
  g.fillStyle = '#4caf5a'; g.beginPath(); g.ellipse(cx - r * 0.2, cy - r * 0.1, r * 0.4, r * 0.25, 0.4, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(cx + r * 0.25, cy + r * 0.3, r * 0.5, r * 0.12, -0.3, 0, 7); g.fill();
  g.fillStyle = 'rgba(4,6,12,.75)'; g.beginPath(); g.arc(cx - r * 0.55, cy, r * 1.02, 0, 7); g.fill(); // sombra (fase)
  g.fillStyle = '#8d8d8a'; g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * 0.7); g.quadraticCurveTo(w * 0.5, h * 0.6, w, h * 0.72); g.lineTo(w, h); g.fill();
  g.fillStyle = 'rgba(60,60,60,.45)'; for (const [x, y, rr] of [[.2, .82, 22], [.55, .9, 30], [.8, .8, 16]]) { g.beginPath(); g.ellipse(x * w, y * h, rr, rr * 0.35, 0, 0, 7); g.fill(); }
});
// 5) Nebulosa colorida  ·  6) Cruzeiro do Sul (parede do telão)
quadroDecor(-21, 13, -24.4, 0, 5, 6.2, (g, w, h) => {
  g.fillStyle = '#05040d'; g.fillRect(0, 0, w, h);
  for (const [x, y, r, c] of [[.4, .4, .45, 'rgba(227,38,43,.45)'], [.6, .55, .45, 'rgba(90,110,255,.45)'], [.5, .3, .3, 'rgba(255,170,60,.35)'], [.45, .7, .35, 'rgba(180,80,220,.4)']]) {
    const gr = g.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * w); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
  estrelasCeu(g, w, h, 120, 1.8);
});
quadroDecor(21, 13, -24.4, 0, 5, 6.2, (g, w, h) => {
  fundoNoite(g, w, h, '#06102a', '#173a6e'); estrelasCeu(g, w, h, 90, 1.4);
  const est = (x, y, r) => { g.fillStyle = '#fff'; g.shadowColor = '#bcd6ff'; g.shadowBlur = 12; g.beginPath(); g.arc(x * w, y * h, r, 0, 7); g.fill(); g.shadowBlur = 0; };
  est(.5, .2, 7); est(.5, .78, 8); est(.28, .48, 6.5); est(.72, .42, 6); est(.6, .6, 4);
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.beginPath(); g.moveTo(.5 * w, .2 * h); g.lineTo(.5 * w, .78 * h); g.moveTo(.28 * w, .48 * h); g.lineTo(.72 * w, .42 * h); g.stroke();
});
totem(-18, -4, Math.PI / 4, 'pontes');
totem(18, -4, -Math.PI / 4, 'recepcao');

/* ---------- área externa (vista pela janela) ---------- */
bloco(-400, 400, -2, -1.02, 26, 420, '#68c06e', { stud: true, cam: false, solido: false, sombra: false });
bloco(-6, 6, -1.01, -0.98, 26, 420, '#6c7686', { solido: false, sombra: false });
{
  const X = 70, Z = 210;
  bloco(X - 12, X + 12, -1, 2, Z - 12, Z + 12, '#9aa5b5', { solido: false });
  bloco(X + 7, X + 11, 2, 70, Z - 2, Z + 2, '#d64532', { solido: false, sombra: false });
  for (let y = 8; y < 70; y += 8) bloco(X + 1, X + 7, y, y + 1, Z - 1, Z + 1, '#d64532', { solido: false, sombra: false });
  cil(3.5, 3.5, 48, '#f2f2f2', X - 2, 2, Z); cil(1.4, 3.5, 9, '#f2f2f2', X - 2, 50, Z);
  cil(1.4, 1.4, 34, '#f4f4f4', X - 7, 2, Z); cil(1.4, 1.4, 34, '#f4f4f4', X + 3, 2, Z);
}

/* ---------- CORREDORES ---------- */
function corredor(z0, z1, cor, textoA, textoB) {
  bloco(-8, 8, -1, 0, z0, z1, '#cfd8e4', { stud: true });
  bloco(-7, 7, 14, 15, z0, z1, '#1a2742', { sombra: false });
  bloco(-8, -7, 0, 14, z0, z1, '#22314f', { sombra: false });
  bloco(7, 8, 0, 14, z0, z1, '#22314f', { sombra: false });
  for (const [a, b] of [[-6.95, -6.85], [6.85, 6.95]]) { bloco(a, b, 0.6, 1, z0, z1, cor, { neon: true, solido: false }); bloco(a, b, 12.5, 12.9, z0, z1, cor, { neon: true, solido: false }); }
  for (let z = z1 - 4; z > z0 + 2; z -= 7) setaChao(0, z, cor);
  placa(textoA, 9, 5, { pos: [-6.8, 7, (z0 + z1) / 2], rot: Math.PI / 2, borda: cor });
  placa(textoB, 9, 5, { pos: [6.8, 7, (z0 + z1) / 2], rot: -Math.PI / 2, borda: cor });
}
corredor(-55, -25, '#5fd4ff',
  [{ t: P_.c1a1, tam: 30, cor: '#ffcf3f' }, { t: P_.c1a2, tam: 58 }, { t: P_.c1a3, tam: 30, peso: 700 }],
  [{ t: P_.c1b1, tam: 50 }, { t: P_.c1b2, tam: 50 }, { t: P_.c1b3, tam: 34, cor: '#5fd4ff', peso: 700 }]);

/* ---------- MUSEU: KENNEDY SPACE CENTER VISITOR COMPLEX ---------- */
sala({ x0: -50, x1: 50, z0: -145, z1: -55, h: 45, chao: '#d9dee6', parede: '#1d2a44', teto: '#141e33', sul: [-7, 7], norte: [-7, 7], faixa: MARINHO, faixa2: VERMELHO, luzes: 12, neon: '#ffcf3f' });
bloco(-6, 6, 0, 0.06, -145, -55, MARINHO, { solido: false, sombra: false });
for (let z = -62; z > -142; z -= 10) setaChao(0, z, VERMELHO);
placa([{ t: P_.museu1, tam: 54 }, { t: P_.museu2, tam: 34, cor: '#ffcf3f' }, { t: P_.museu3, tam: 24, cor: '#c9d3ea', peso: 600 }], 24, 7, { pos: [0, 21, -62], faixa: VERMELHO, dupla: true });
for (const x of [-11, 11]) bloco(x - 0.12, x + 0.12, 24.5, 45, -62.12, -61.88, '#30384a', { solido: false });
placa([{ t: P_.voltar, tam: 60 }], 10, 2.4, { pos: [0, 13.6, -55.6], rot: Math.PI });
placa([{ t: P_.hangar1, tam: 58 }, { t: P_.hangar2, tam: 32, cor: '#fff', peso: 700 }], 20, 5, { pos: [0, 15.5, -144.4], fundo: VERMELHO });
placa([{ t: 'HEROES AND LEGENDS', tam: 50 }, { t: P_.heroes2, tam: 34, cor: '#ffcf3f', peso: 700 }], 26, 5.5, { pos: [-49.4, 30, -100], rot: Math.PI / 2, fundo: '#7a1d14', borda: '#ffcf3f' });
placa([{ t: 'SPACE SHUTTLE', tam: 50 }, { t: 'ATLANTIS', tam: 64, cor: '#5fd4ff' }], 24, 7, { pos: [49.4, 30, -110], rot: -Math.PI / 2, fundo: '#0e1424', borda: '#5fd4ff' });
placa([{ t: 'APOLLO / SATURN V CENTER', tam: 48 }], 30, 3.2, { pos: [0, 38, -144.4], fundo: '#101a30', borda: '#fff' });

// 1) Rocket Garden
bloco(-47, -26, 0, 0.6, -84, -60, '#4cb860', { stud: true, lado: '#3d8f4d' });
function aletas(x, z, r, y0, y1, cor) {
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const cx = x + dx * (r + 0.6), cz = z + dz * (r + 0.6), w = dx ? 1.4 : 0.3, d = dz ? 1.4 : 0.3;
    bloco(cx - w / 2, cx + w / 2, y0, y1, cz - d / 2, cz + d / 2, cor, { solido: false });
  }
}
function fogueteSimples(x, z, alt, r, corpo, faixa, nariz) {
  bloco(x - r * 1.6, x + r * 1.6, 0.6, 1.4, z - r * 1.6, z + r * 1.6, '#8a94a6');
  cil(r, r, alt, corpo, x, 1.4, z);
  for (let y = 4; y < alt - 2; y += 7) cil(r + 0.05, r + 0.05, 1.2, faixa, x, 1.4 + y, z);
  cil(0.1, r, r * 3, nariz, x, 1.4 + alt, z);
  aletas(x, z, r, 1.4, 4.4, faixa);
  colisor(x - r - 0.3, x + r + 0.3, 0, alt, z - r - 0.3, z + r + 0.3);
}
fogueteSimples(-42, -66, 24, 1.6, '#e9edf2', '#20242c', '#20242c');
fogueteSimples(-34, -64, 18, 1.2, '#f4f4f4', '#d64532', '#d64532');
fogueteSimples(-42, -78, 30, 1.9, '#c7ccd4', '#3a4a66', '#e9edf2');
fogueteSimples(-31, -76, 21, 1.4, '#f2f2f2', '#1556c6', '#f2f2f2');
cil(0.9, 2.1, 2.6, '#2b3140', -36.5, 0.6, -71.5);
colisor(-38.3, -34.7, 0, 3.2, -73.3, -69.7);
placa([{ t: 'ROCKET GARDEN', tam: 60 }], 12, 2.2, { pos: [-36.5, 2.2, -59.6], fundo: '#2d6b3b' });
totem(-23, -70, Math.PI / 2, 'jardim');

// 2) Sigma 7 sobre Redstone
bloco(-41, -31, 0, 1.2, -105, -95, '#2a3550', { stud: true });
cil(1.6, 1.6, 16, '#f4f4f4', -36, 1.2, -100);
for (const y of [3, 9, 14]) cil(1.65, 1.65, 1.1, '#1d1d1d', -36, 1.2 + y, -100);
aletas(-36, -100, 1.6, 1.2, 4, '#1d1d1d');
cil(1.6, 1.6, 0.6, '#3a3f4a', -36, 17.2, -100);
cil(0.75, 1.6, 2.6, '#22262e', -36, 17.8, -100);
cil(0.55, 0.75, 1.2, '#22262e', -36, 20.4, -100);
cil(0.12, 0.12, 4, '#d64532', -36, 21.6, -100);
cil(0.05, 0.4, 1, '#d64532', -36, 25.6, -100);
colisor(-38, -34, 0, 22, -102, -98);
placa([{ t: 'SIGMA 7', tam: 70 }, { t: P_.sigma2, tam: 38, cor: '#ffcf3f', peso: 700 }], 7, 2.4, { pos: [-36, 2.6, -94.9], fundo: '#7a1d14' });
totem(-27, -98, Math.PI / 2, 'sigma7');

// 3) Controle de Missão Mercury
{
  const c = canvasPlaca(26, 10, (g, cw, ch) => {
    g.fillStyle = '#0a2a4a'; g.fillRect(0, 0, cw, ch);
    g.strokeStyle = 'rgba(120,200,255,.25)'; g.lineWidth = 1;
    for (let x = 0; x < cw; x += cw / 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, ch); g.stroke(); }
    for (let y = 0; y < ch; y += ch / 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(cw, y); g.stroke(); }
    g.fillStyle = '#2f7d55';
    const blob = pts => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x * cw, y * ch) : g.moveTo(x * cw, y * ch)); g.fill(); };
    blob([[.05, .2], [.2, .12], [.3, .25], [.25, .45], [.18, .5], [.1, .38]]);
    blob([[.22, .52], [.3, .55], [.33, .7], [.27, .92], [.23, .7]]);
    blob([[.45, .15], [.58, .12], [.62, .3], [.52, .35], [.46, .28]]);
    blob([[.47, .38], [.58, .38], [.6, .6], [.53, .8], [.48, .6]]);
    blob([[.6, .14], [.88, .12], [.92, .35], [.75, .45], [.62, .32]]);
    blob([[.8, .65], [.9, .63], [.92, .78], [.82, .8]]);
    g.strokeStyle = '#ffcf3f'; g.lineWidth = 4;
    for (let k = 0; k < 3; k++) { g.beginPath(); for (let x = 0; x <= cw; x += 8) { const y = ch / 2 + Math.sin(x / cw * Math.PI * 2 + k * 1.1) * ch * 0.3; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    g.fillStyle = VERMELHO; for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(((i * 0.083) + 0.04) * cw, ch / 2 + Math.sin(i * 1.04) * ch * 0.3, 7, 0, 7); g.fill(); }
    g.fillStyle = '#fff'; g.font = `24px ${TIT}`; g.fillText(P_.mapa, 20, 40);
  });
  const mapa = new THREE.Mesh(new THREE.PlaneGeometry(26, 10), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }));
  mapa.position.set(-49.4, 9, -130); mapa.rotation.y = Math.PI / 2; scene.add(mapa);
  for (let fila = 0; fila < 3; fila++) for (let i = 0; i < 3; i++) {
    const x = -46 + fila * 5, z = -138 + i * 6;
    bloco(x - 1.4, x + 1.4, 0, 2.6, z - 2.2, z + 2.2, '#7d8a98');
    bloco(x - 1.6, x + 1.6, 2.6, 3, z - 2.4, z + 2.4, '#5a6676');
    const tela = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.4), mat(i % 2 ? '#3ad07a' : '#5fd4ff', { neon: true }));
    tela.position.set(x + 1.45, 2.1, z); tela.rotation.y = Math.PI / 2; scene.add(tela);
  }
}
totem(-28, -128, Math.PI / 2, 'controle');

// 4) Hall da Fama
{
  const c = canvasPlaca(22, 9, (g, cw, ch) => {
    g.fillStyle = '#2a1d10'; g.fillRect(0, 0, cw, ch);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 12; k++) {
      const x = 30 + k * (cw - 60) / 12, y = 44 + r * 52;
      g.fillStyle = '#c9a246'; g.fillRect(x, y, (cw - 60) / 12 - 14, 40);
      g.fillStyle = '#7a5a1c'; g.fillRect(x + 8, y + 10, (cw - 60) / 12 - 30, 6); g.fillRect(x + 8, y + 22, (cw - 60) / 12 - 40, 5);
    }
    g.fillStyle = '#ffcf3f'; g.font = `20px ${TIT}`; g.textAlign = 'center'; g.fillText('U.S. ASTRONAUT HALL OF FAME', cw / 2, 30);
  });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(22, 9), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(c) }));
  p.position.set(49.4, 8, -70); p.rotation.y = -Math.PI / 2; scene.add(p);
  bloco(34, 40, 0, 1.6, -73, -67, '#b9bec8', { stud: true });
  const est = astronauta({ estatua: true }); est.position.set(37, 1.6, -70); est.rotation.y = -Math.PI / 2; est.scale.setScalar(1.35);
  est.userData.bracoD.rotation.x = -0.4;
  placa([{ t: P_.estatua1, tam: 40 }, { t: P_.estatua2, tam: 30, cor: '#ffcf3f', peso: 600 }], 6, 1.4, { pos: [33.9, 0.9, -70], rot: -Math.PI / 2, fundo: '#2a1d10', dupla: true });
}
totem(26, -70, -Math.PI / 2, 'halldafama');

// 5) Atlantis: erguido e inclinado 43,21° para bombordo, portas abertas
const atlantis = new THREE.Group();
{
  const branco = mat('#f3f4f6'), preto = mat('#1f2329'), brancoD = mat('#f3f4f6', { dupla: true }), pretoD = mat('#1f2329', { dupla: true });
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; atlantis.add(o); return o; };
  add(new THREE.BoxGeometry(4.2, 3.6, 22), branco, 0, 0, 0);
  add(new THREE.BoxGeometry(4.25, 0.5, 22.4), preto, 0, -1.9, 0);
  const nariz = add(new THREE.SphereGeometry(2.1, 18, 12), branco, 0, -0.2, -11); nariz.scale.set(1, 0.9, 2);
  add(new THREE.BoxGeometry(3, 0.8, 1.6), preto, 0, 1.5, -10.6);
  add(new THREE.BoxGeometry(3.6, 0.3, 15), mat('#cfd6dd'), 0, 1.72, 0.5);
  for (const lado of [1, -1]) {
    const s = new THREE.Shape(); s.moveTo(2, -7); s.lineTo(3.6, -3); s.lineTo(11, 7.6); s.lineTo(11, 10.6); s.lineTo(2, 10.6); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: false }); geo.rotateX(Math.PI / 2); if (lado < 0) geo.scale(-1, 1, 1);
    const w = new THREE.Mesh(geo, brancoD); w.position.y = -1.3; w.castShadow = true; atlantis.add(w);
    const wb = new THREE.Mesh(geo, pretoD); wb.position.y = -1.85; atlantis.add(wb);
  }
  const leme = new THREE.Shape(); leme.moveTo(6, 0); leme.lineTo(11, 0); leme.lineTo(11.5, 8); leme.lineTo(10, 8); leme.closePath();
  const lg = new THREE.ExtrudeGeometry(leme, { depth: 0.5, bevelEnabled: false }); lg.rotateY(-Math.PI / 2);
  const lm = new THREE.Mesh(lg, brancoD); lm.position.set(0.25, 1.8, 0); lm.castShadow = true; atlantis.add(lm);
  for (const [x, y] of [[0, 0.8], [-1.1, -0.6], [1.1, -0.6]]) { const e = add(new THREE.CylinderGeometry(0.45, 0.8, 1.6, 14), preto, x, y, 11.8); e.rotation.x = Math.PI / 2; }
  add(new THREE.BoxGeometry(1.4, 1.2, 4), branco, -1.9, 2.1, 9); add(new THREE.BoxGeometry(1.4, 1.2, 4), branco, 1.9, 2.1, 9);
  for (const lado of [1, -1]) {
    const piv = new THREE.Group(); piv.position.set(lado * 2.1, 1.8, 0.5); atlantis.add(piv);
    const porta = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.22, 15), mat('#e4ecf3')); porta.position.x = -lado * 1.05; porta.castShadow = true; piv.add(porta);
    const rad = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 14), mat('#a9d3ee')); rad.position.set(-lado * 1.05, 0.14, 0); piv.add(rad);
    piv.rotation.z = -lado * (150 * Math.PI / 180);
  }
  atlantis.rotation.z = 43.21 * Math.PI / 180; // inclinação citada pela NASA
  atlantis.position.set(30, 14, -112);
  scene.add(atlantis);
  cil(1.4, 2, 10.5, '#4a5568', 30.5, 0, -112);
  bloco(26, 35, 0, 0.8, -117, -107, '#2a3550', { stud: true });
  colisor(28.5, 32.5, 0, 12, -114, -110);
  for (const [x0, x1, z0, z1] of [[16, 46, -128.5, -128], [16, 46, -94, -93.5], [16, 16.5, -128, -94]]) bloco(x0, x1, 0, 2.6, z0, z1, VERMELHO, { cam: false });
  placa([{ t: 'ATLANTIS', tam: 80 }, { t: P_.atlantis2, tam: 32, cor: '#5fd4ff', peso: 700 }], 9, 2.4, { pos: [16.7, 4, -104], rot: -Math.PI / 2, fundo: '#0e1424', dupla: true });
}
soClique(atlantis, new THREE.Vector3(30, 14, -112), () => abrirExpo('atlantis'));
totem(13, -102, -Math.PI / 2, 'atlantis');

// 6) Saturn V suspenso na horizontal
const saturno = new THREE.Group();
{
  const pecas = [[4.6, 4.6, 22, '#f4f4f4'], [4.6, 4.6, 2, '#dcdcdc'], [4.6, 4.6, 18, '#f4f4f4'], [3.4, 4.6, 4, '#f4f4f4'], [3.4, 3.4, 11, '#f4f4f4'], [3.4, 3.4, 1, '#8a8f99'], [2.0, 3.4, 6, '#e9e9e9'], [2.0, 2.0, 4, '#b8bfc9'], [0.6, 2.0, 3, '#d9dde2']];
  for (let i = 0; i < 5; i++) { const a = (i / 4) * Math.PI * 2; cil(0.6, 1.5, 3, '#2a2d33', i === 4 ? 0 : Math.cos(a) * 2.4, 0, i === 4 ? 0 : Math.sin(a) * 2.4, { pai: saturno, seg: 14 }); }
  let y = 3;
  for (const [rt, rb, h, cor] of pecas) { cil(rt, rb, h, cor, 0, y, 0, { pai: saturno }); y += h; }
  for (const yy of [4, 22, 31]) cil(4.68, 4.68, 1.5, '#1d1d1d', 0, yy, 0, { pai: saturno });
  cil(4.68, 4.68, 1, '#1d1d1d', 0, 49, 0, { pai: saturno });
  cil(0.15, 0.15, 5, '#d64532', 0, y, 0, { pai: saturno }); cil(0.05, 0.5, 1.2, '#d64532', 0, y + 5, 0, { pai: saturno });
  saturno.rotation.z = Math.PI / 2; saturno.position.set(42, 27, -134); scene.add(saturno);
  for (const x of [-26, 0, 26]) { bloco(x - 0.15, x + 0.15, 32, 45, -134.15, -133.85, '#30384a', { solido: false }); bloco(x - 1, x + 1, 31.4, 32.2, -136, -132, '#30384a', { solido: false }); }
}
soClique(saturno, new THREE.Vector3(0, 27, -134), () => abrirExpo('saturnv'));
totem(10, -126, 0, 'saturnv');

/* ---------- CORREDOR 2 → HANGAR (parede oposta) ---------- */
corredor(-175, -145, '#ff8a2a',
  [{ t: P_.c2a1, tam: 32, cor: '#ffcf3f' }, { t: 'HANGAR', tam: 66 }],
  [{ t: 'RR-01', tam: 66 }, { t: P_.c2b2, tam: 34, cor: '#ff8a2a', peso: 700 }]);

/* ---------- HANGAR ---------- */
sala({ x0: -40, x1: 40, z0: -235, z1: -175, h: 60, chao: '#596273', chaoLado: '#3b4250', parede: '#2b3344', teto: '#1c2230', sul: [-7, 7], faixa: '#ffcf3f', luzes: 14, neon: '#ff8a2a' });
{
  const c = canvasPlaca(40, 30, (g, cw, ch) => {
    g.fillStyle = '#3e4757'; g.fillRect(0, 0, cw, ch);
    for (let x = 0; x < cw; x += 24) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, 0, 4, ch); }
    for (let x = -ch; x < cw; x += 60) { g.fillStyle = '#ffcf3f'; g.beginPath(); g.moveTo(x, ch); g.lineTo(x + 30, ch); g.lineTo(x + 60, ch - 30); g.lineTo(x + 30, ch - 30); g.fill(); }
    logoCanvas(g, cw / 2 - 150, 40, 60);
    g.fillStyle = '#fff'; g.font = `44px ${TIT}`; g.textAlign = 'center'; g.fillText('HANGAR', cw / 2 + 30, 92);
  });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(c) }));
  p.position.set(0, 15, -234.4); scene.add(p);
}
for (const [x0, x1, z0, z1] of [[-22, 6, -229, -228.4], [-22, 6, -192, -191.4], [-22, -21.4, -229, -191.4], [5.4, 6, -229, -191.4]]) bloco(x0, x1, 0, 0.05, z0, z1, '#ffcf3f', { solido: false, neon: true });
bloco(-40, 40, 56, 58, -186, -184, VERMELHO, { solido: false });
bloco(-14, -8, 53, 56, -187, -183, '#ffcf3f', { solido: false });
for (const [x, z, s] of [[-34, -182, 3], [-30, -182, 2], [-34, -186, 2.4], [33, -182, 3], [35, -187, 2]]) bloco(x - s, x + s, 0, s * 1.4, z - s, z + s, '#8b5a2b', { stud: true });

// Nave RR-01 (modelo original inspirado em SLS + Orion)
const NAVE = { x: -8, z: -210 };
const nave = new THREE.Group(); scene.add(nave);
{
  bloco(-20, 4, 0, 1, -222, -198, '#3a404c', { stud: true });
  const { x, z } = NAVE;
  cil(4, 4, 34, '#ff8a2a', x, 1, z, { pai: nave });
  for (const yy of [2, 33]) cil(4.05, 4.05, 1, '#c26a22', x, yy, z, { pai: nave });
  for (const dx of [-6.4, 6.4]) { cil(1.7, 1.7, 30, '#f4f4f4', x + dx, 1, z, { pai: nave }); cil(0.2, 1.7, 4, '#f4f4f4', x + dx, 31, z, { pai: nave }); for (const yy of [8, 16, 24]) cil(1.75, 1.75, 0.6, '#2a2d33', x + dx, yy, z, { pai: nave }); }
  cil(4, 4, 3, '#e9e9e9', x, 35, z, { pai: nave });
  cil(4, 4, 3.5, '#c7ccd4', x, 38, z, { pai: nave });
  cil(4.6, 4.6, 0.5, '#2a2d33', x, 38.3, z, { pai: nave, seg: 6 });
  cil(1.6, 4.2, 4.5, '#f2f2f2', x, 41.5, z, { pai: nave });
  cil(0.5, 1.2, 2, '#e1e1e1', x, 46, z, { pai: nave });
  cil(0.25, 0.25, 6, '#d64532', x, 48, z, { pai: nave });
  cil(0.05, 0.4, 1.2, '#d64532', x, 54, z, { pai: nave });
  nave.attach(placa([{ t: 'RR-01', tam: 100 }], 5, 2.2, { pos: [x + 0.1, 20, z + 4.05], fundo: MARINHO }));
  colisor(x - 8.5, x + 8.5, 1, 35, z - 4.5, z + 4.5);
  colisor(x - 4.5, x + 4.5, 35, 56, z - 4.5, z + 4.5);
}
// a nave NÃO é clicável: as informações da exposição ficam só no totem ao lado
totem(-24, -190, Math.PI / 4, 'artemis');
placa([{ t: P_.nave1, tam: 46 }, { t: P_.nave2, tam: 30, cor: '#ffcf3f', peso: 700 }], 14, 2.6, { pos: [-8, 2.6, -197.9] });

// Escada à direita da nave → plataforma (y=14)
const ESC = { x0: 10, x1: 18, zIni: -182, passo: 2, n: 14 };
for (let i = 0; i < ESC.n; i++) {
  const zA = ESC.zIni - ESC.passo * (i + 1), zB = ESC.zIni - ESC.passo * i;
  bloco(ESC.x0, ESC.x1, i, i + 1, zA, zB, i % 2 ? '#8792a3' : '#9aa5b5', { stud: true, cam: false });
  bloco(ESC.x0, ESC.x1, 0, i, zA, zB, '#3b4250', { solido: false });
}
for (const x of [ESC.x0 - 0.4, ESC.x1]) {
  for (let i = 0; i < ESC.n; i += 2) bloco(x, x + 0.4, i + 1, i + 4, ESC.zIni - ESC.passo * (i + 1) - 0.2, ESC.zIni - ESC.passo * (i + 1) + 0.2, '#ffcf3f', { solido: false });
  const corr = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, Math.hypot(ESC.n * ESC.passo, ESC.n)), mat('#ffcf3f'));
  corr.position.set(x + 0.2, ESC.n / 2 + 3.6, ESC.zIni - ESC.n * ESC.passo / 2); corr.rotation.x = Math.atan2(ESC.n, ESC.n * ESC.passo); scene.add(corr);
  colisor(x, x + 0.4, 0, ESC.n + 4, ESC.zIni - ESC.n * ESC.passo, ESC.zIni);
}
placa([{ t: P_.escada1, tam: 66 }, { t: P_.escada2, tam: 34, cor: '#fff', peso: 700 }], 8, 2.6, { pos: [14, 3.6, -181.7], fundo: VERMELHO });

// Plataforma inferior
bloco(6, 24, 13, 14, -232, -210, '#7e8899', { stud: true });
for (const [x, z] of [[7, -231], [23, -231], [7, -211], [23, -211]]) bloco(x - 0.5, x + 0.5, 0, 13, z - 0.5, z + 0.5, '#3b4250');
for (const b of [[6, 6.4, -232, -210], [18, 24, -210.4, -210], [6, 10, -210.4, -210], [6, 24, -232.4, -232], [23.6, 24, -221, -210], [23.6, 24, -232, -230]]) bloco(b[0], b[1], 14, 17, b[2], b[3], '#ffcf3f');
// Plataforma superior + braço de acesso
bloco(6, 24, 40, 41, -232, -206, '#7e8899', { stud: true });
for (const [x, z] of [[7, -231], [7, -207], [23, -207]]) bloco(x - 0.5, x + 0.5, x === 7 && z === -231 ? 14 : 0, 40, z - 0.5, z + 0.5, '#3b4250');
for (const b of [[6, 24, -206.4, -206], [6, 24, -232.4, -232], [6, 6.4, -232, -213], [23.6, 24, -221, -206], [23.6, 24, -232, -230]]) bloco(b[0], b[1], 41, 44, b[2], b[3], '#ffcf3f');
bloco(-3.5, 6, 40, 41, -213, -207, '#a3adbb', { stud: true });
bloco(-3.5, 6, 41, 44, -213.4, -213, '#ffcf3f');
bloco(-3.5, 6, 41, 44, -207, -206.6, '#ffcf3f');
bloco(-3.5, 6, 46, 46.4, -213.4, -213, '#8792a3', { solido: false });
bloco(-3.5, 6, 46, 46.4, -207, -206.6, '#8792a3', { solido: false });
for (const x of [-3, 5.6]) for (const z of [-213.2, -206.8]) bloco(x - 0.2, x + 0.2, 44, 46, z - 0.2, z + 0.2, '#8792a3', { solido: false });
placa([{ t: P_.braco1, tam: 44 }, { t: P_.braco2, tam: 34, cor: '#ffcf3f' }], 6, 1.8, { pos: [1.2, 45.1, -206.5], fundo: VERMELHO, dupla: true });
const escotilha = bloco(-3.9, -3.6, 41, 45, -212, -208, '#2a2d33', { solido: false });
const luzEscotilha = bloco(-3.6, -3.5, 44.4, 44.8, -211.5, -208.5, '#3ad07a', { neon: true, solido: false });
colisor(-4.5, -3.5, 41, 46, -213, -207);
interativo({ pos: new THREE.Vector3(-2.5, 43, -210), raio: 6, rotulo: L.prompt.embarcar, objeto: L.prompt.escotilha, acao: () => embarcar(), alvos: [escotilha] });

// Elevador
const ELEV = { x0: 24, x1: 32, z0: -230, z1: -222, baixo: 14, cima: 41, h: 14, alvo: 14, mov: false };
bloco(24, 33, 14, 50, -231, -230, '#3b4250', { sombra: false });
bloco(24, 33, 14, 50, -222, -221, '#3b4250', { sombra: false });
bloco(32, 33, 14, 50, -230, -222, '#bfe6ff', { vidro: true });
bloco(24, 33, 50, 51, -231, -221, '#ffcf3f');
for (const z of [-230.6, -221.4]) bloco(23.5, 24, 14, 50, z - 0.4, z + 0.4, '#ffcf3f', { solido: false });
const cabine = new THREE.Group(); scene.add(cabine);
{
  const piso = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, 8), [mat('#c9d2de'), mat('#c9d2de'), mat('#e9eef5', { stud: true }), mat('#c9d2de'), mat('#c9d2de'), mat('#c9d2de')]);
  const uv = piso.geometry.attributes.uv; for (let i = 8; i < 12; i++) uv.setXY(i, uv.getX(i) * 4, uv.getY(i) * 4);
  piso.position.y = -0.3; piso.receiveShadow = true; cabine.add(piso);
  const teto = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 8), mat('#ffcf3f')); teto.position.y = 8; cabine.add(teto);
  const fundo = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, 8), mat('#2b3344')); fundo.position.set(3.85, 4, 0); cabine.add(fundo);
  const painel = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2, 1.4), mat(MARINHO)); painel.position.set(3.6, 4, -2.6); cabine.add(painel);
  for (const [y, c] of [[4.5, '#3ad07a'], [3.6, VERMELHO]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.5), mat(c, { neon: true })); b.position.set(3.45, y, -2.6); cabine.add(b); }
  const luz = new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 1), mat('#f4fbff', { neon: true })); luz.position.y = 7.75; cabine.add(luz);
  cabine.position.set(28, ELEV.h, -226);
}
const elevPiso = colisor(ELEV.x0, ELEV.x1, ELEV.h - 0.6, ELEV.h, ELEV.z0, ELEV.z1);
const elevGrade = colisor(23.4, 24, ELEV.h, ELEV.h + 8, ELEV.z0, ELEV.z1);
const portaBaixo = colisor(23.4, 24, 14, 22, ELEV.z0, ELEV.z1);
const portaCima = colisor(23.4, 24, 41, 49, ELEV.z0, ELEV.z1);
const portaBaixoM = bloco(23.5, 23.9, 14, 22, -230, -222, '#ffcf3f', { solido: false });
const portaCimaM = bloco(23.5, 23.9, 41, 49, -230, -222, '#ffcf3f', { solido: false });
placa([{ t: P_.elevador, tam: 64 }], 6, 1.4, { pos: [23.3, 23.2, -226], rot: -Math.PI / 2 });
const dentroElev = () => P.pos.x > ELEV.x0 && P.pos.x < ELEV.x1 && P.pos.z > ELEV.z0 && P.pos.z < ELEV.z1 && Math.abs(P.pos.y - ELEV.h) < 1.2;
const itElev = interativo({ pos: new THREE.Vector3(28, 17, -226), raio: 7.5, rotulo: L.prompt.chamar, objeto: L.prompt.elevador, acao: acionarElevador, alvos: [cabine] });
// Painéis de chamada fixos: se o jogador pular lá de cima, dá para chamar o elevador de volta
const chamadas = [];
function painelChamada(x, y, z, nivel) {
  bloco(x - 0.25, x + 0.25, y, y + 3.1, z - 0.25, z + 0.25, MARINHO);
  const botao = bloco(x - 0.32, x + 0.32, y + 2.3, y + 2.9, z - 0.32, z + 0.32, VERMELHO, { neon: true, solido: false });
  const it = interativo({ pos: new THREE.Vector3(x, y + 3.6, z), raio: 6.5, rotulo: L.prompt.chamar, objeto: L.prompt.elevador, acao: acionarElevador, alvos: [botao] });
  chamadas.push({ it, nivel });
}
painelChamada(22.6, 14, -220.2, ELEV.baixo);   // plataforma de baixo, ao lado da porta
painelChamada(22.6, 41, -220.2, ELEV.cima);    // plataforma de cima
painelChamada(20, 0, -183.5, ELEV.baixo);      // chão do hangar, no pé da escada
function acionarElevador() {
  if (ELEV.mov) return;
  ELEV.alvo = dentroElev() ? (ELEV.h < 27 ? ELEV.cima : ELEV.baixo) : (P.pos.y > 30 ? ELEV.cima : ELEV.baixo);
  if (ELEV.alvo === ELEV.h) return;
  ELEV.mov = true;
  falarSistema(ELEV.alvo === ELEV.cima ? L.msg.subindo : L.msg.descendo);
}
function atualizarElevador(dt) {
  if (ELEV.mov) {
    const ant = ELEV.h, passo = Math.sign(ELEV.alvo - ELEV.h) * (reduz ? 60 : 6) * dt;
    ELEV.h = Math.abs(ELEV.alvo - ELEV.h) <= Math.abs(passo) ? ELEV.alvo : ELEV.h + passo;
    if (P.noChao && P.chaoSol === elevPiso) P.pos.y += ELEV.h - ant;
    if (ELEV.h === ELEV.alvo) ELEV.mov = false;
  }
  elevPiso.min.y = ELEV.h - 0.6; elevPiso.max.y = ELEV.h;
  elevGrade.min.y = ELEV.h; elevGrade.max.y = ELEV.h + 8; elevGrade.off = !ELEV.mov;
  portaBaixo.off = ELEV.h === ELEV.baixo && !ELEV.mov; portaBaixoM.visible = !portaBaixo.off;
  portaCima.off = ELEV.h === ELEV.cima && !ELEV.mov; portaCimaM.visible = !portaCima.off;
  cabine.position.y = ELEV.h;
  itElev.pos.set(28, ELEV.h + 3, -226);
  itElev.rotulo = dentroElev() ? (ELEV.h < 27 ? L.prompt.subir : L.prompt.descer) : L.prompt.chamar;
  itElev.objeto = ELEV.mov ? L.prompt.movendo : L.prompt.elevador;
  for (const c of chamadas) { // o painel só aparece quando o elevador não está parado naquele andar
    c.it.raio = (ELEV.h !== c.nivel || ELEV.mov) ? 6.5 : 0;
    c.it.objeto = ELEV.mov ? L.prompt.movendo : L.prompt.elevador;
  }
}

/* ================================================================
   PERSONAGENS: só o jogador e o Marcos Pontes
   ================================================================ */
let jogador = null;
function criarJogador() {
  const pos = jogador ? jogador.position.clone() : null, rot = jogador ? jogador.rotation.y : 0;
  if (jogador) scene.remove(jogador);
  jogador = astronauta({ g: estado.av.g, cap: false, cabelo: estado.av.g === 'm' ? 'chanel' : 'cacheado', corCabelo: estado.av.g === 'm' ? '#3a2216' : '#2b1a12' });
  if (pos) { jogador.position.copy(pos); jogador.rotation.y = rot; }
}
criarJogador();
const marcos = astronauta({ g: 'h', cap: false, cabelo: 'liso', corCabelo: '#b9bab6', sobrancelha: '#8d8d88', bandeira: true, pele: '#d8a47f' });
marcos.position.set(0, 0, -4.5);
const itMarcos = interativo({ pos: new THREE.Vector3(0, 6.6, -4.5), raio: 10, rotulo: L.prompt.conversar, objeto: L.prompt.marcos, acao: conversar, alvos: [marcos] });

/* ---------------- física do jogador ---------------- */
const P = { pos: new THREE.Vector3(0, 0, 16), vy: 0, noChao: true, chaoSol: null, rot: Math.PI, vel: 0 };
const RAIO = 0.9, ALT = 5.6, DEGRAU = 2.2, VEL = 22, PULO = 50, GRAV = 196.2; // VEL 22 = WalkSpeed 22 (padrão do Roblox é 16)
function bate(x, z, y) {
  for (const s of solidos) {
    if (s.off) continue;
    if (x + RAIO <= s.min.x || x - RAIO >= s.max.x || z + RAIO <= s.min.z || z - RAIO >= s.max.z) continue;
    if (s.max.y <= y + DEGRAU || s.min.y >= y + ALT) continue;
    return true;
  }
  return false;
}
function chaoEm(x, z, y) {
  let h = -Infinity, sol = null; const r = RAIO * 0.7;
  for (const s of solidos) {
    if (s.off) continue;
    if (x + r <= s.min.x || x - r >= s.max.x || z + r <= s.min.z || z - r >= s.max.z) continue;
    if (s.max.y <= y + DEGRAU + 0.01 && s.max.y > h) { h = s.max.y; sol = s; }
  }
  return { h, sol };
}
const teclas = {}, joy = { x: 0, y: 0 };
let pularPedido = false;
const cam = { yaw: 0, pitch: 0.38, dist: 24, alvoDist: 24 };
// ZOOM: a câmera fica entre 6 e 48 studs atrás do jogador. Aproximando além do mínimo, ela entra
// em PRIMEIRA PESSOA (alvoDist = 0: a câmera vai para os olhos e o boneco some).
const ZOOM_MIN = 6, ZOOM_MAX = 48;
const primeiraPessoa = () => cam.alvoDist < 1;
let avisouPP = false;
function zoomPara(d, aproximando) {
  const antes = primeiraPessoa();
  cam.alvoDist = d < ZOOM_MIN ? (aproximando ? 0 : ZOOM_MIN) : Math.min(ZOOM_MAX, d);
  if (!antes && primeiraPessoa() && !avisouPP) { avisouPP = true; falarSistema(toque ? L.msg.primeira_pessoa_toque : L.msg.primeira_pessoa); } // avisa só na 1ª vez
}
function atualizarJogador(dt) {
  let ix = 0, iz = 0;
  if (!pausado()) {
    ix = (teclas.d || teclas.arrowright ? 1 : 0) - (teclas.a || teclas.arrowleft ? 1 : 0) + joy.x;
    iz = (teclas.w || teclas.arrowup ? 1 : 0) - (teclas.s || teclas.arrowdown ? 1 : 0) - joy.y;
  }
  const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
  let dx = fx * iz + rx * ix, dz = fz * iz + rz * ix;
  const n = Math.hypot(dx, dz);
  if (n > 1) { dx /= n; dz /= n; }
  P.vel = Math.min(n, 1);
  if (primeiraPessoa()) P.rot = cam.yaw + Math.PI; // em primeira pessoa o corpo acompanha o olhar
  else if (n > 0.05) { let d = Math.atan2(dx, dz) - P.rot; d = Math.atan2(Math.sin(d), Math.cos(d)); P.rot += d * Math.min(1, dt * 14); }
  for (let i = 0; i < 3; i++) {
    const sx = dx * VEL * dt / 3, sz = dz * VEL * dt / 3;
    if (!bate(P.pos.x + sx, P.pos.z, P.pos.y)) P.pos.x += sx;
    if (!bate(P.pos.x, P.pos.z + sz, P.pos.y)) P.pos.z += sz;
  }
  if (pularPedido && P.noChao && !pausado()) { P.vy = PULO; P.noChao = false; }
  pularPedido = false;
  P.vy -= GRAV * dt;
  const ref = P.pos.y;
  P.pos.y += P.vy * dt;
  const ch = chaoEm(P.pos.x, P.pos.z, ref);
  if (P.pos.y <= ch.h) { P.pos.y = ch.h; P.vy = 0; P.noChao = true; P.chaoSol = ch.sol; } else { P.noChao = false; P.chaoSol = null; }
  if (P.pos.y < -40) teleportar('recepcao');
  jogador.position.copy(P.pos); jogador.rotation.y = P.rot;
  animarBoneco(jogador, P.vel, dt, !P.noChao);
}

/* ---------------- câmera ---------------- */
const ray = new THREE.Raycaster(), alvoCam = new THREE.Vector3();
function atualizarCamera(dt) {
  cam.dist += (cam.alvoDist - cam.dist) * Math.min(1, dt * 10);
  alvoCam.set(P.pos.x, P.pos.y + 4.8, P.pos.z);
  const dir = new THREE.Vector3(Math.sin(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), Math.cos(cam.yaw) * Math.cos(cam.pitch));
  if (primeiraPessoa() && cam.dist < 2.6) {
    // primeira pessoa: câmera nos olhos, olhando para a frente (o oposto de "dir"); o boneco some
    camera.position.set(P.pos.x, P.pos.y + 5, P.pos.z);
    camera.lookAt(v3.copy(camera.position).sub(dir));
    jogador.visible = false;
  } else {
    if (!primeiraPessoa() && cam.pitch < -0.25) cam.pitch += (-0.25 - cam.pitch) * Math.min(1, dt * 8); // saiu da 1ª pessoa olhando para cima
    ray.set(alvoCam, dir); ray.far = cam.dist;
    const hit = ray.intersectObjects(bloqueiaCam, false)[0];
    const d = hit ? Math.max(1.5, hit.distance - 0.8) : Math.max(1.5, cam.dist);
    camera.position.copy(alvoCam).addScaledVector(dir, d); camera.lookAt(alvoCam);
    jogador.visible = d > 2.2;
  }
  sol.position.set(P.pos.x + 40, P.pos.y + 100, P.pos.z + 30); sol.target.position.copy(P.pos);
}

/* ================================================================
   INTERFACE DO MUNDO
   ================================================================ */
const ui = $('world-ui');
const el = cls => { const e = document.createElement('div'); e.className = cls; ui.appendChild(e); return e; };
const tagJogador = el('nametag');
const tagMarcos = el('nametag'); tagMarcos.textContent = 'Marcos Pontes';
{ const s = document.createElement('small'); s.textContent = L.balao.guia; tagMarcos.appendChild(s); }
const exclamacao = el('nametag'); exclamacao.style.cssText = 'font-size:40px;color:#fff;background:#e3262b;border-radius:10px;padding:0 14px;line-height:52px;text-shadow:none;box-shadow:0 4px 0 #b81c20';
exclamacao.textContent = '!';
const balao = el('bubble'); balao.style.display = 'none';
const balaoJog = el('bubble'); balaoJog.style.display = 'none';
const prompt = document.createElement('button'); prompt.className = 'prompt'; prompt.style.display = 'none'; ui.appendChild(prompt);
const seta = el('nametag'); seta.style.cssText = 'font-size:34px;color:#e3262b;text-shadow:0 0 4px #fff,0 0 8px #fff'; seta.textContent = '▼';

const v3 = new THREE.Vector3();
const rayOc = new THREE.Raycaster(), pOc = new THREE.Vector3(), dOc = new THREE.Vector3();
function atrasDeParede(p) { // true se houver parede/teto/piso entre a câmera e o ponto
  dOc.subVectors(p, camera.position); const dist = dOc.length();
  rayOc.set(camera.position, dOc.divideScalar(dist)); rayOc.far = Math.max(0, dist - 0.6);
  return rayOc.intersectObjects(bloqueiaCam, false).length > 0;
}
function naTela(e, pos, dy = 0, ocluir = false) {
  pOc.copy(pos); pOc.y += dy;
  if (ocluir && atrasDeParede(pOc)) { e.style.visibility = 'hidden'; return false; }
  v3.copy(pOc); v3.project(camera);
  if (v3.z > 1 || v3.x < -1.2 || v3.x > 1.2 || v3.y < -1.2 || v3.y > 1.2) { e.style.visibility = 'hidden'; return false; }
  e.style.visibility = 'visible';
  let px = (v3.x + 1) / 2 * innerWidth;
  if (e.classList.contains('bubble')) { const m = e.offsetWidth / 2 + 8; px = Math.max(m, Math.min(innerWidth - m, px)); }
  e.style.left = px + 'px'; e.style.top = ((1 - v3.y) / 2 * innerHeight) + 'px';
  return true;
}

let fala = -1;
function conversar() {
  fala++;
  if (fala >= L.marcos.length) { fala = -1; balao.style.display = 'none'; marcos.userData.acenando = false; itMarcos.rotulo = L.prompt.conversar; return; }
  if (fala === L.marcos.length - 1) concluir('falar');
  balao.innerHTML = '';
  const who = document.createElement('span'); who.className = 'who'; who.textContent = L.balao.quem;
  const txt = document.createElement('span'); txt.textContent = fmt(L.marcos[fala]);
  const nx = document.createElement('span'); nx.className = 'next';
  nx.textContent = fala < L.marcos.length - 1 ? `${fala + 1}/${L.marcos.length} · ${L.balao.proximo}` : L.balao.fim;
  balao.append(who, txt, nx);
  balao.style.display = 'block'; balao.style.animation = 'none'; void balao.offsetWidth; balao.style.animation = '';
  marcos.userData.acenando = true; itMarcos.rotulo = L.prompt.proxima;
  $('sr').textContent = 'Marcos Pontes: ' + txt.textContent;
}
balao.addEventListener('click', conversar);
let tmrSis = 0;
function falarSistema(t) {
  balaoJog.textContent = t; balaoJog.style.display = 'block';
  clearTimeout(tmrSis); tmrSis = setTimeout(() => balaoJog.style.display = 'none', 3200);
  $('sr').textContent = t;
}

let maisPerto = null;
function atualizarPrompt() {
  maisPerto = null; let melhor = Infinity;
  if (!pausado()) for (const it of interativos) {
    if (!it.raio) continue;
    const d = it.pos.distanceTo(v3.set(P.pos.x, P.pos.y + 3, P.pos.z));
    if (d < it.raio && d < melhor) { melhor = d; maisPerto = it; }
  }
  if (!maisPerto) { prompt.style.display = 'none'; return; }
  const k = toque ? '👆' : 'E';
  const chave = maisPerto.rotulo + '|' + maisPerto.objeto + '|' + k;
  if (prompt.dataset.k !== chave) {
    prompt.dataset.k = chave; prompt.innerHTML = '';
    const kk = document.createElement('span'); kk.className = 'key'; kk.textContent = k;
    const tx = document.createElement('span'); const b = document.createElement('b'); b.textContent = maisPerto.rotulo; const s = document.createElement('small'); s.textContent = maisPerto.objeto || '';
    tx.append(b, s); prompt.append(kk, tx);
  }
  prompt.style.display = 'flex';
  naTela(prompt, maisPerto.pos, 0.8);
}
prompt.addEventListener('click', () => { if (maisPerto) maisPerto.acao(); });

/* ---------------- objetivo atual ---------------- */
function alvoObjetivo() {
  const falta = DADOS.missoes.find(m => !estado.feitas.includes(m.id));
  if (!falta) return null;
  switch (falta.id) {
    case 'falar': return null; // o "!" sobre o Marcos já indica o objetivo
    case 'museu': return new THREE.Vector3(0, 6, -40);
    case 'expo': {
      let best = null, bd = Infinity;
      for (const t of totens) if (DADOS.exposMuseu.includes(t.chave) && !estado.expos.includes(t.chave)) { const d = t.it.pos.distanceTo(P.pos); if (d < bd) { bd = d; best = t.it.pos; } }
      return best && best.clone().setY(best.y + 3);
    }
    case 'hangar': return new THREE.Vector3(0, 6, -160);
    case 'escada': return new THREE.Vector3(14, 6, -183);
    case 'elevador': return new THREE.Vector3(28, ELEV.h + 10, -226);
    case 'missao1': return new THREE.Vector3(-2.5, 49, -210);
  }
  return null;
}

/* ================================================================
   MISSÕES, CONQUISTAS E HUD
   ================================================================ */
const contExpos = () => estado.expos.filter(e => DADOS.exposMuseu.includes(e)).length;
function renderMissoes() {
  const ol = $('mission-list'); if (!ol) return; // painel de objetivos removido do HUD; a seta vermelha continua guiando
  ol.innerHTML = '';
  let marcouAtual = false;
  for (const m of DADOS.missoes) {
    const li = document.createElement('li');
    const ok = estado.feitas.includes(m.id);
    if (ok) li.className = 'ok'; else if (!marcouAtual) { li.className = 'now'; marcouAtual = true; }
    const i = document.createElement('i'); i.textContent = ok ? '✓' : '';
    const t = document.createElement('span'); t.textContent = L.missoes[m.id];
    if (m.meta) { const s = document.createElement('small'); s.textContent = `${Math.min(contExpos(), m.meta)}/${m.meta} ${L.missoes.expo_cont}`; t.appendChild(s); }
    li.append(i, t); ol.appendChild(li);
  }
}
const filaBadge = []; let badgeAtivo = false;
function concluir(id) {
  if (estado.feitas.includes(id)) return;
  estado.feitas.push(id); salvar(); renderMissoes();
  filaBadge.push(fmt(L.conquistas[id])); mostrarBadge();
}
function mostrarBadge() {
  if (badgeAtivo || !filaBadge.length) return;
  badgeAtivo = true; $('badge-name').textContent = filaBadge.shift(); $('badge-toast').classList.add('show');
  setTimeout(() => { $('badge-toast').classList.remove('show'); setTimeout(() => { badgeAtivo = false; mostrarBadge(); }, 500); }, 2800);
}
const ZONAS = [
  { id: 'recepcao', teste: z => z > -25 }, { id: 'c1', teste: z => z > -55 }, { id: 'museu', teste: z => z > -145 },
  { id: 'c2', teste: z => z > -175 }, { id: 'hangar', teste: () => true }
];
let zonaAtual = null, tmrZona = 0;
function atualizarZona() {
  const z = ZONAS.find(zz => zz.teste(P.pos.z));
  if (z !== zonaAtual) {
    zonaAtual = z;
    const [sub, nome] = L.zonas[z.id];
    $('zone-sub').textContent = sub; $('zone-title').textContent = nome;
    $('zone-banner').classList.add('show');
    clearTimeout(tmrZona); tmrZona = setTimeout(() => $('zone-banner').classList.remove('show'), 2400);
    $('sr').textContent = nome;
    if (z.id === 'museu') concluir('museu');
    if (z.id === 'hangar') concluir('hangar');
  }
  if (z.id === 'hangar' && P.pos.y >= 13.5 && P.noChao) concluir('escada');
  if (P.pos.y >= 40 && P.noChao) concluir('elevador');
}

/* ---------------- fotos: pré-carregamento ----------------
   As fotos só baixavam quando o card abria (tela preta enquanto isso).
   Agora todas são baixadas em segundo plano logo depois que o mapa aparece,
   uma de cada vez para não disputar banda com o jogo. */
const fotosProntas = new Set();
function preCarregarFotos() {
  const lista = [...new Set([
    ...Object.values(DADOS.registros).flat().map(r => r.foto),
    ...DADOS.album.map(a => a.foto).filter(Boolean)
  ])];
  const proxima = () => {
    const src = lista.shift(); if (!src) return;
    const im = new Image(); im.decoding = 'async';
    im.onload = () => { fotosProntas.add(src); (im.decode ? im.decode() : Promise.resolve()).catch(() => {}).then(proxima); };
    im.onerror = proxima;
    im.src = src;
  };
  setTimeout(proxima, 400);
}
// mostra a foto com um fundo azul animado enquanto carrega (em vez do preto)
function trocarFoto(img, src) {
  const moldura = img.parentElement;
  if (img.getAttribute('src') === src && img.complete) { moldura.classList.remove('carregando'); return; }
  moldura.classList.toggle('carregando', !fotosProntas.has(src));
  img.onload = () => { fotosProntas.add(src); moldura.classList.remove('carregando'); };
  img.onerror = () => moldura.classList.remove('carregando');
  img.src = src;
}

/* ---------------- card de exposição ---------------- */
const dataFmt = iso => new Date(iso + 'T12:00:00').toLocaleDateString(L.codigo, { day: 'numeric', month: 'short', year: 'numeric' });
function abrirExpo(chave) {
  const e = L.expos[chave], regs = DADOS.registros[chave];
  if (!estado.expos.includes(chave)) { estado.expos.push(chave); salvar(); }
  if (contExpos() >= 6) concluir('expo');
  renderMissoes();
  $('info-room').textContent = e.sala.toUpperCase();
  $('info-title').textContent = e.titulo;
  const ul = $('info-facts'); ul.innerHTML = '';
  e.fatos.forEach(f => { const li = document.createElement('li'); li.textContent = f; ul.appendChild(li); });
  const th = $('info-thumbs'); th.innerHTML = '';
  const src = $('info-source'); src.innerHTML = '';
  const mostrar = (r, btn) => { trocarFoto($('info-img'), r.foto); $('info-img').alt = `${e.titulo} · ${L.ui.foto_nasa} ${r.id}`; th.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn)); };
  regs.forEach((r, i) => {
    if (regs.length > 1) {
      const b = document.createElement('button'); b.setAttribute('aria-label', `${L.ui.foto} ${i + 1}`);
      const im = document.createElement('img'); im.src = r.foto; im.alt = ''; b.appendChild(im);
      b.onclick = () => mostrar(r, b); th.appendChild(b);
    }
    const linha = document.createElement('div');
    const a = document.createElement('a'); a.href = 'https://images.nasa.gov/details/' + encodeURIComponent(r.id); a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = r.id;
    linha.append(`${L.ui.fonte}: ${FONTE_API} · `, a, ` · ${dataFmt(r.data)} · ${L.ui.credito}: ${r.credito}`);
    src.appendChild(linha);
  });
  mostrar(regs[0], th.querySelector('button'));
  limparTeclas(); $('info').showModal();
}

/* ---------------- teleporte ---------------- */
const PONTOS = { recepcao: [0, 0, 16, 0], totem: [8, 0, 9, -Math.PI / 4], museu: [0, 0, -84, 0], hangar: [2, 0, -192, 0.35], elevador: [16, 14, -220, -Math.PI / 2], braco: [3, 41, -210, Math.PI / 2] };
function teleportar(k) { const [x, y, z, yaw] = PONTOS[k]; P.pos.set(x, y, z); P.vy = 0; cam.yaw = yaw; P.rot = yaw + Math.PI; }

/* ================================================================
   FASE 1 · PROJETO MERCURY: O COLAPSO DO PILOTO AUTOMÁTICO
   Cabine em primeira pessoa. O piloto automático já começa desligado:
   a tela treme e fica vermelha. O jogador move a câmera até a mira "+"
   (centro da tela) ficar sobre cada um dos 4 pontos vermelhos no espaço
   e segura 2 s em cada um (o círculo branco mostra o tempo).
   Com os 4 pontos travados, o piloto automático volta e tudo se normaliza.
   ================================================================ */
// Ajustes: tempo em cada ponto (s), tolerância da mira (rad), limites da câmera e tremor
// ima: ímã da mira (giroscópio). 0 = desligado. 1 = a mira pula para o centro do ponto
// assim que o "+" encosta no círculo cinza em volta dele (valores maiores aumentam esse alcance).
const RAIO_CIRCULO = 1.95;  // raio do círculo cinza, em unidades da cena (o ponto fica a AJ.dist de distância)
const BRACO_MIRA = 22;      // metade do "+" na tela, em pixels (igual ao .m-mira do estilo.css)
const vibrar = ms => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* sem vibração */ } }; // resposta tátil no celular
const AJ = { segurar: 2, raio: 0.065, dist: 30, yawMax: 0.78, pitchMin: -0.14, pitchMax: 0.64, tremor: 0.006, intro: 2.6, ima: 0 };
// Cópia dos valores originais: os equipamentos mudam AJ só durante uma tentativa e depois tudo volta para cá.
const AJ_BASE = Object.freeze({ ...AJ });
const PONTOS_M = [[-0.46, 0.20], [0.40, 0.34], [-0.10, 0.50], [0.56, 0.08]]; // [giro, inclinação] em radianos
const M = { ativa: false, fase: '', t: 0, tFase: 0, olhar: { x: 0, y: 0.2 }, alvo: { x: 0, y: 0.2 }, pontos: [], naMira: false, teclas: {}, arrasto: null };
const cena2 = new THREE.Scene(); cena2.background = new THREE.Color('#02040a');
const cam2 = new THREE.PerspectiveCamera(72, 1, 0.05, 600); cam2.rotation.order = 'YXZ';
const exterior = new THREE.Group(); cena2.add(exterior);
{
  const pts = [];
  for (let i = 0; i < 900; i++) { const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = 300, s = Math.sqrt(1 - u * u); pts.push(r * s * Math.cos(th), r * u, r * s * Math.sin(th)); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  exterior.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.3, sizeAttenuation: false })));
  const tex = new THREE.CanvasTexture(cv(512, 256, (g, w, h) => {
    g.fillStyle = '#1d5fb4'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3f8f4f'; for (let i = 0; i < 26; i++) { g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 20 + Math.random() * 50, 10 + Math.random() * 30, Math.random() * 3, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 10 + Math.random() * 40, 3 + Math.random() * 8, 0, 0, 7); g.fill(); }
  }));
  const terra = new THREE.Mesh(new THREE.SphereGeometry(80, 48, 32), new THREE.MeshLambertMaterial({ map: tex }));
  terra.position.set(0, -84, -95); exterior.add(terra); exterior.userData.terra = terra;
  const atm = new THREE.Mesh(new THREE.SphereGeometry(82.5, 48, 32), new THREE.MeshBasicMaterial({ color: '#7fc3ff', transparent: true, opacity: 0.25, side: THREE.BackSide }));
  atm.position.copy(terra.position); exterior.add(atm);
  const solM = new THREE.DirectionalLight(0xffffff, 1.1); solM.position.set(60, 40, 20); cena2.add(solM);
}
cena2.add(new THREE.AmbientLight(0xffffff, 0.45));
const luzCabine = new THREE.PointLight(0xffffff, 1, 7); luzCabine.position.set(0, 0.4, -0.4); cena2.add(luzCabine);
const cabineM = new THREE.Group(); cena2.add(cabineM);
const cxm = (w, h, d, cor, x, y, z, pai = cabineM) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof cor === 'string' ? mat(cor) : cor); m.position.set(x, y, z); pai.add(m); return m; };
let texMostrador; const luzesAlarme = [];
{
  // para-brisa amplo: só colunas finas, para o espaço ficar bem visível
  for (const s of [-1, 1]) { const col = cxm(0.16, 3.6, 0.16, '#3a3f4a', s * 2.25, 0.9, -1.9); col.rotation.z = -s * 0.22; cxm(0.3, 4.4, 3.4, '#1c1f26', s * 2.9, 0.6, -0.5); }
  cxm(5, 0.16, 0.16, '#3a3f4a', 0, 2.55, -1.75); cxm(6, 0.3, 3.4, '#1c1f26', 0, 2.8, -0.5);
  // console inclinado embaixo da janela
  const painel = new THREE.Group(); painel.position.set(0, -1.0, -1.55); painel.rotation.x = -0.85; cabineM.add(painel);
  cxm(4.8, 1.3, 0.14, '#2f343e', 0, 0, 0, painel);
  cxm(4.9, 0.08, 0.2, VERMELHO, 0, 0.68, 0.02, painel);
  texMostrador = new THREE.CanvasTexture(cv(512, 512, () => {}));
  const mostrador = new THREE.Mesh(new THREE.CircleGeometry(0.46, 48), new THREE.MeshBasicMaterial({ map: texMostrador })); mostrador.position.set(0, 0, 0.08); painel.add(mostrador);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.035, 10, 48), mat('#b8bcc4')); aro.position.set(0, 0, 0.09); painel.add(aro);
  const gauge = (x, y, rot) => {
    const t = new THREE.CanvasTexture(cv(128, 128, g => { g.fillStyle = '#0b0d12'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.strokeStyle = '#e8e6df'; g.lineWidth = 3; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(64 + Math.cos(a) * 48, 64 + Math.sin(a) * 48); g.lineTo(64 + Math.cos(a) * 58, 64 + Math.sin(a) * 58); g.stroke(); } g.strokeStyle = '#ff7a1a'; g.lineWidth = 5; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.cos(rot) * 44, 64 + Math.sin(rot) * 44); g.stroke(); }));
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.19, 28), new THREE.MeshBasicMaterial({ map: t })); m.position.set(x, y, 0.08); painel.add(m);
  };
  gauge(-0.95, 0.18, 0.6); gauge(-1.45, -0.12, 2.2); gauge(0.95, 0.18, 4.1); gauge(1.45, -0.12, 1.3); gauge(-1.95, 0.2, 5); gauge(1.95, 0.2, 3);
  for (let i = 0; i < 7; i++) { const l = cxm(0.16, 0.1, 0.05, mat(VERMELHO, { neon: true }), -0.75 + i * 0.25, 0.55, 0.08, painel); luzesAlarme.push(l); }
  for (let i = 0; i < 8; i++) cxm(0.07, 0.07, 0.16, '#d9d9d4', -0.9 + i * 0.26, -0.5, 0.14, painel);
}
// pontos vermelhos no espaço (fora da nave)
const matVerm = new THREE.MeshBasicMaterial({ color: '#ff2a2a' }), matVerde = new THREE.MeshBasicMaterial({ color: '#2fe07a' });
const matBrilho = new THREE.MeshBasicMaterial({ color: '#ff2a2a', transparent: true, opacity: 0.28 });
const matBranco = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide }), matZona = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.45, side: THREE.DoubleSide });
const dirDe = (yaw, pitch) => new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
for (const [yaw, pitch] of PONTOS_M) {
  const g = new THREE.Group(); const dir = dirDe(yaw, pitch);
  g.position.copy(dir).multiplyScalar(AJ.dist); g.lookAt(0, 0, 0);
  const nucleo = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), matVerm); g.add(nucleo);
  const brilho = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 12), matBrilho); g.add(brilho);
  const zona = new THREE.Mesh(new THREE.RingGeometry(1.8, 1.95, 48), matZona); g.add(zona);
  const arco = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.65, 48, 1, Math.PI / 2, -0.001), matBranco); arco.visible = false; g.add(arco);
  cena2.add(g);
  M.pontos.push({ yaw, pitch, dir, g, nucleo, brilho, arco, prog: 0, ok: false, desenhado: -1 });
}
function desenharMostrador() { // instrumento decorativo: horizonte balançando e aviso AUTO
  const g = texMostrador.image.getContext('2d'), W = 512, R = 240, falha = M.fase === 'intro' || M.fase === 'mira';
  g.clearRect(0, 0, W, W);
  g.save(); g.translate(256, 256); g.beginPath(); g.arc(0, 0, R, 0, 7); g.clip();
  g.save(); g.rotate(falha ? Math.sin(M.t * 1.7) * 0.5 + Math.sin(M.t * 4.1) * 0.12 : 0);
  g.fillStyle = '#2f6fb8'; g.fillRect(-W, -W, W * 2, W); g.fillStyle = '#7a4e2a'; g.fillRect(-W, 0, W * 2, W);
  g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.moveTo(-W, 0); g.lineTo(W, 0); g.stroke(); g.restore();
  g.save(); g.rotate(falha ? M.t * 0.9 : 0); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 4;
  for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2, r1 = i % 3 ? R - 18 : R - 34; g.beginPath(); g.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); g.lineTo(Math.cos(a) * R, Math.sin(a) * R); g.stroke(); }
  g.restore();
  g.strokeStyle = '#ffb21a'; g.lineWidth = 10; g.beginPath(); g.moveTo(-44, 0); g.lineTo(44, 0); g.moveTo(0, -44); g.lineTo(0, 44); g.stroke();
  g.fillStyle = falha ? '#e3262b' : '#2fbf71'; g.fillRect(-90, 120, 180, 54);
  g.fillStyle = '#fff'; g.font = `700 34px ${TXT}`; g.textAlign = 'center'; g.fillText(falha ? 'AUTO OFF' : 'AUTO ON', 0, 159);
  g.restore();
  g.strokeStyle = '#0b0d12'; g.lineWidth = 16; g.beginPath(); g.arc(256, 256, R + 6, 0, 7); g.stroke();
  texMostrador.needsUpdate = true;
}
let audio = null;
function bip(f = 880, d = 0.08, tipo = 'square', vol = 0.05) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), gn = audio.createGain();
    o.type = tipo; o.frequency.value = f; gn.gain.value = vol; o.connect(gn); gn.connect(audio.destination);
    o.start(); gn.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + d); o.stop(audio.currentTime + d + 0.02);
  } catch (e) { /* sem áudio */ }
}
const LM = () => L.missao;
const missaoFeita = () => estado.feitas.includes('missao1');
function embarcar() {
  if (M.ativa) return;
  const primeira = !estado.capacete;
  if (primeira) { estado.capacete = true; salvar(); falarSistema(L.msg.capacete); bip(660, 0.15, 'sine', 0.06); } // capacete aparece sozinho
  if (missaoFeita()) abrirEscolha();         // fase 1 já concluída: refazer ou ir para a próxima (Roblox)
  else if (primeira) setTimeout(() => abrirPreparo(), 1100); // espera o capacete aparecer
  else abrirPreparo();                       // a fase não começa direto: antes vem a Preparação
}

/* ---------------- Preparação: equipamentos x peso ----------------
   Todos os números (pesos, limite, efeitos, bônus) vêm de DADOS.regrasPeso e DADOS.equipamentos. */
const RP = DADOS.regrasPeso;
const equipPorId = id => DADOS.equipamentos.find(e => e.id === id);
const pesoTotal = sel => RP.pesoNave + sel.reduce((soma, id) => soma + equipPorId(id).peso, 0);
const kgLivres = sel => RP.limite - pesoTotal(sel);                         // negativo = acima do limite
const bonusLeveza = sel => Math.floor(Math.max(0, kgLivres(sel)) / RP.kgPorBonus) * RP.segundosPorBonus; // em segundos
let selPreparo = [];                                                         // escolhas marcadas no painel aberto
const fmtNum = n => String(n).replace('.', L.codigo === 'pt-BR' ? ',' : '.');
function abrirPreparo(selInicial) {
  selPreparo = (selInicial || estado.equip).slice();
  const p = L.preparo;
  $('pr-fase').textContent = LM().fase; $('pr-titulo').textContent = p.titulo;
  $('pr-task').textContent = LM().task; $('pr-obj').textContent = p.objetivo;
  $('pr-nave').textContent = p.nave.replace('{n}', RP.pesoNave); $('pr-limite').textContent = p.limite.replace('{n}', RP.limite);
  $('pr-dica').textContent = p.dica.replace('{kg}', RP.kgPorBonus).replace('{s}', RP.segundosPorBonus);
  $('pr-lancar').textContent = p.lancar;
  // cards de equipamento: clicar liga/desliga
  const box = $('pr-itens'); box.innerHTML = '';
  DADOS.equipamentos.forEach(eq => {
    const tx = p.itens[eq.id], b = document.createElement('button');
    b.type = 'button'; b.className = 'pr-item'; b.dataset.id = eq.id;
    const ico = document.createElement('span'); ico.className = 'ico'; ico.textContent = eq.icone;
    const kg = document.createElement('span'); kg.className = 'kg'; kg.textContent = '+' + eq.peso + ' kg';
    const nome = document.createElement('b'); nome.textContent = tx.nome;
    const desc = document.createElement('p'); desc.textContent = tx.txt;
    const ck = document.createElement('span'); ck.className = 'check';
    b.append(ico, kg, nome, desc, ck);
    b.onclick = () => { selPreparo = selPreparo.includes(eq.id) ? selPreparo.filter(x => x !== eq.id) : [...selPreparo, eq.id]; atualizarPreparo(); };
    box.appendChild(b);
  });
  atualizarPreparo();
  limparTeclas();
  if (!$('preparo').open) $('preparo').showModal();
}
function atualizarPreparo() {
  const p = L.preparo, peso = pesoTotal(selPreparo), livre = kgLivres(selPreparo);
  const escala = RP.pesoNave + DADOS.equipamentos.reduce((s, e) => s + e.peso, 0); // barra vai até "tudo marcado"
  const cor = peso > RP.limite ? 'vermelho' : peso > RP.faixaVerde ? 'amarelo' : 'verde';
  $('pr-fill').style.width = Math.min(100, peso / escala * 100) + '%'; $('pr-fill').className = 'pr-fill ' + cor;
  $('pr-marca').style.left = (RP.limite / escala * 100) + '%';
  const linha = $('pr-peso'); linha.className = 'pr-peso' + (cor === 'vermelho' ? ' vermelho' : ''); linha.textContent = '';
  linha.append(livre >= 0 ? p.peso.replace('{p}', peso).replace('{l}', RP.limite).replace('{f}', livre)
                          : p.acima.replace('{p}', peso).replace('{l}', RP.limite).replace('{x}', -livre));
  const b = bonusLeveza(selPreparo);
  if (b > 0) { const s = document.createElement('small'); s.textContent = p.bonus.replace('{b}', b); linha.appendChild(s); }
  document.querySelectorAll('#pr-itens .pr-item').forEach(el => el.setAttribute('aria-pressed', String(selPreparo.includes(el.dataset.id))));
}
// Lançar fica sempre habilitado: errar o peso faz parte do aprendizado
$('pr-lancar').onclick = () => {
  estado.equip = selPreparo.slice(); salvar();            // pré-marca na próxima vez
  $('preparo').close();
  comecarMissao(); // acima do limite também entra na cabine: a falha acontece lá dentro (ver atualizarMissao)
};
// Liga os efeitos escolhidos SÓ nesta tentativa (sempre partindo dos valores originais)
function aplicarEquipamentos(sel) {
  Object.assign(AJ, AJ_BASE); M.limiteTempo = LIMITE_TEMPO;
  sel.forEach(id => {
    const ef = equipPorId(id).efeito;
    if (ef.tremorFator) AJ.tremor = AJ_BASE.tremor * ef.tremorFator;
    if (ef.raioFator) AJ.raio = AJ_BASE.raio * ef.raioFator;
    if (ef.segurar) AJ.segurar = ef.segurar;
    if (ef.ima) AJ.ima = ef.ima;
    if (ef.limiteTempo) M.limiteTempo = ef.limiteTempo;
  });
  M.equip = sel.slice(); M.peso = pesoTotal(sel); M.bonus = bonusLeveza(sel);
}
function restaurarEquipamentos() { Object.assign(AJ, AJ_BASE); M.limiteTempo = LIMITE_TEMPO; }
// Estrelas pelo tempo (M.t) até estabilizar a nave
const LIMITE_ESTRELAS = [10.0, 17.0, 25.0]; // ≤10 s = 3 · ≤17 s = 2 · ≤25 s = 1 · acima de 25 s = 0 (falhou)
const LIMITE_TEMPO = 40.0;                   // aos 40 s a missão é encerrada automaticamente como falha
const arred = s => Math.round(s * 10) / 10; // mesma precisão do cronômetro da tela
// valores padrão da tentativa (sem equipamentos), trocados por aplicarEquipamentos()
Object.assign(M, { limiteTempo: LIMITE_TEMPO, bonus: 0, equip: [], peso: DADOS.regrasPeso.pesoNave });
function calcularEstrelas(tempo) {
  const t = arred(tempo);
  if (t <= LIMITE_ESTRELAS[0]) return 3;
  if (t <= LIMITE_ESTRELAS[1]) return 2;
  if (t <= LIMITE_ESTRELAS[2]) return 1;
  return 0;
}
function desenharEstrelas(alvoId, n) {
  const box = $(alvoId); box.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const s = document.createElement('span');
    s.className = 'estrela ' + (i < n ? 'ativa' : 'inativa'); s.textContent = '★';
    box.appendChild(s);
  }
}
const tempoTxt = s => s.toFixed(1).replace('.', L.codigo === 'pt-BR' ? ',' : '.') + ' s';
function abrirEscolha() {
  const t = LM();
  $('me-titulo').textContent = t.escolha_titulo; $('me-txt').textContent = t.escolha_txt;
  desenharEstrelas('me-estrelas', estado.estrelas);
  $('me-refazer').textContent = '↻ ' + t.refazer; $('me-proxima').textContent = t.proxima + ' ▶';
  limparTeclas(); $('m-escolha').showModal();
}
$('me-refazer').onclick = () => { $('m-escolha').close(); abrirPreparo(); };
$('me-proxima').onclick = () => { $('m-escolha').close(); abrirRoblox(); };
function dica(txt) { $('m-dica').textContent = txt; }
const dicaMira = () => (toque ? LM().dica_toque : LM().dica).replace('{s}', fmtNum(AJ.segurar)); // "segure 2 s" ou "1,3 s"
function comecarMissao() {
  const t = LM();
  // zera o cronômetro (M.t) e o resto do estado: "Tentar de novo" sempre começa do zero
  Object.assign(M, { ativa: true, fase: 'intro', t: 0, tFase: 0, naMira: false, teclas: {}, arrasto: null, ima: null, alertaPeso: false });
  aplicarEquipamentos(estado.equip);                       // efeitos valem só nesta tentativa
  M.pesado = M.peso > RP.limite;                           // acima do limite: a nave sai de controle antes da mira liberar
  exterior.position.y = 0;
  $('m-tempo').textContent = tempoTxt(0);
  $('m-comb-l').textContent = t.combustivel; atualizarCombustivel();
  M.estrelasBarra = undefined; atualizarBarraEstrelas(); $('m-estbar').setAttribute('aria-label', t.barra_estrelas);
  $('m-bonus').textContent = M.bonus > 0 ? `${t.bonus_hud} −${M.bonus} s` : '';
  M.olhar.x = M.alvo.x = 0; M.olhar.y = M.alvo.y = 0.2;
  M.pontos.forEach(p => { p.prog = 0; p.ok = false; p.desenhado = -1; p.nucleo.material = matVerm; p.brilho.visible = true; p.arco.visible = false; });
  document.body.classList.add('em-missao'); $('missao').hidden = false;
  $('m-fase').textContent = t.fase; $('m-task').textContent = t.task; $('m-sair').textContent = '✕ ' + t.sair;
  $('m-splash-fase').textContent = t.fase; $('m-splash-task').textContent = t.task; $('m-splash').classList.add('on');
  $('m-alvos-l').textContent = t.pontos; $('m-tempo-l').textContent = t.tempo;
  $('m-alerta').textContent = t.alerta; $('m-alerta').className = 'm-alerta pisca';
  $('m-vermelho').classList.add('on'); $('m-mira').className = 'm-mira';
  document.querySelectorAll('#m-luzes i').forEach(i => i.classList.remove('on'));
  dica(''); luzCabine.color.set('#ff3030');
  limparTeclas(); cvs.focus({ preventScroll: true });
  bip(440, 0.25, 'sawtooth', 0.04);
}
// Troca os marcadores de uma fala do Marcos pelos valores reais da tentativa
function falaMarcos(chave, v = {}) {
  let s = fmt(L.marcosResultado[chave]); // {nome}, {o}, {a}
  for (const [k, val] of Object.entries(v)) s = s.split('{' + k + '}').join(val);
  return s;
}
// Escolhe UMA dica, a mais útil para esta tentativa
function escolherDica(motivo) {
  const tem = id => M.equip.includes(id);
  const comb = equipPorId('combustivel');
  if (motivo === 'tempo') return tem('combustivel') ? falaMarcos('dica_proximos')
    : falaMarcos('dica_combustivel', { extra: comb.efeito.limiteTempo - LIMITE_TEMPO });
  if (motivo === 'lento') return !tem('giroscopio') ? falaMarcos('dica_giroscopio')
    : falaMarcos('dica_leveza', { bonusKg: RP.kgPorBonus, bonusS: RP.segundosPorBonus });
  return ''; // peso: a própria fala já ensina o que fazer
}
// Monta o banner de resultado. motivo: undefined (fase jogada) ou 'peso' (não decolou)
function fimMissao(motivo) {
  M.fase = 'fim';
  const t = LM();
  let estrelas = 0, tempoFinal = 0;
  if (motivo !== 'peso') {
    tempoFinal = Math.max(0, M.t - M.bonus);                       // tempo final = tempo − bônus de leveza
    const estourou = arred(M.t) > M.limiteTempo;                   // 40 s (ou 55 s com combustível extra)
    estrelas = estourou ? 0 : calcularEstrelas(tempoFinal);
    if (estrelas === 0) motivo = estourou ? 'tempo' : 'lento';
    const e = estrelas > 0 ? '⭐'.repeat(estrelas) : t.sem_estrelas;
    $('m-estrelas-txt').textContent = t.conta.replace('{t}', tempoTxt(M.t)).replace('{b}', M.bonus).replace('{f}', tempoTxt(tempoFinal)).replace('{e}', e);
  } else {
    $('m-estrelas-txt').textContent = t.conta_peso.replace('{p}', M.peso).replace('{l}', RP.limite);
  }
  desenharEstrelas('m-estrelas', estrelas);
  const card = $('mf-card'); card.innerHTML = '';
  $('mf-trocar').textContent = '🎒 ' + t.trocar;
  $('mf-trocar').onclick = () => { if (M.ativa) sairMissao(); else $('m-fim').close(); abrirPreparo(); };
  if (estrelas > 0) { // passou de fase: card da NASA, selo e Próxima fase → Roblox
    $('mf-topo').className = 'banner-topo ok'; $('mf-selo').textContent = '✔';
    $('mf-titulo').textContent = t.sucesso_titulo;
    $('mf-fala').textContent = falaMarcos('sucesso', { tempo: tempoTxt(tempoFinal), estrelas }); $('mf-dica').textContent = '';
    $('mf-novo').textContent = t.novo_card; card.hidden = false;
    card.appendChild(cardMissao(DADOS.album[0], true));
    $('mf-voltar').textContent = t.voltar; $('mf-voltar').onclick = sairMissao;
    $('mf-trocar').hidden = true;
    $('mf-proxima').hidden = false; $('mf-proxima').textContent = t.proxima + ' ▶'; $('mf-proxima').onclick = () => { sairMissao(); abrirRoblox(); };
    estado.estrelas = Math.max(estado.estrelas, estrelas); salvar(); // guarda o melhor resultado
    concluir('missao1');
  } else { // 0 estrelas: missão falhou, Marcos explica o motivo e dá uma dica
    $('mf-topo').className = 'banner-topo falha'; $('mf-selo').textContent = '✕';
    $('mf-titulo').textContent = t.falhou_titulo;
    $('mf-fala').textContent = falaMarcos(motivo, { peso: M.peso, limite: RP.limite, tempo: tempoTxt(tempoFinal), limiteEstrela: LIMITE_ESTRELAS[2] });
    $('mf-dica').textContent = escolherDica(motivo);
    $('mf-novo').textContent = ''; card.hidden = true;
    $('mf-voltar').textContent = t.sair_mapa; $('mf-voltar').onclick = () => { if (M.ativa) sairMissao(); else $('m-fim').close(); };
    $('mf-trocar').hidden = false;
    // "Tentar de novo" repete com as mesmas escolhas. No peso não aparece: com a mesma carga o foguete falharia de novo.
    $('mf-proxima').hidden = motivo === 'peso';
    $('mf-proxima').textContent = '↻ ' + t.tentar; $('mf-proxima').onclick = () => { $('m-fim').close(); comecarMissao(); };
    bip(160, 0.6, 'sawtooth', 0.06); vibrar([90, 60, 90]);
  }
  $('m-fim').showModal();
}
// Barra de combustível: cheia no começo, vazia no limite de tempo.
// Sem o item ela dura 40 s; com o combustível extra, 55 s (esvazia mais devagar).
function atualizarCombustivel() {
  const resta = Math.max(0, 1 - M.t / M.limiteTempo), pct = Math.round(resta * 100);
  $('m-comb').style.setProperty('--n', (resta * 100) + '%'); // o CSS usa --n como altura (computador) ou largura (celular)
  $('m-comb').className = 'm-comb' + (resta <= 0.2 ? ' vermelho' : resta <= 0.45 ? ' amarelo' : '');
  $('m-comb').setAttribute('aria-valuenow', pct);
}
// Barra das estrelas: mostra quantas estrelas ainda dá para ganhar com o tempo final (tempo − bônus de leveza).
// Cada terço da barra vale uma estrela e dura o intervalo daquela estrela (LIMITE_ESTRELAS):
// cheia → 2/3 nos primeiros 10 s (3★) · 2/3 → 1/3 até 17 s (2★) · 1/3 → vazia até 25 s (1★).
function atualizarBarraEstrelas() {
  const tf = Math.max(0, M.t - M.bonus), [a, b, c] = LIMITE_ESTRELAS;
  const resta = tf <= a ? 1 - (tf / a) / 3 : tf <= b ? 2 / 3 - ((tf - a) / (b - a)) / 3 : tf <= c ? 1 / 3 - ((tf - b) / (c - b)) / 3 : 0;
  const n = calcularEstrelas(tf), barra = $('m-estbar');
  barra.style.setProperty('--n', (resta * 100) + '%');
  if (n === M.estrelasBarra) return;
  // mudou o número de estrelas possíveis: atualiza ícones e cor; se perdeu uma durante a mira, avisa com som, vibração e um tranco
  const perdeu = M.estrelasBarra !== undefined && n < M.estrelasBarra && M.fase === 'mira';
  M.estrelasBarra = n;
  barra.className = 'm-estbar e' + n; barra.setAttribute('aria-valuenow', n);
  document.querySelectorAll('#mb-estrelas span').forEach((s, i) => s.classList.toggle('off', i >= n));
  if (perdeu) { bip(300, 0.18, 'square', 0.05); vibrar(35); void barra.offsetWidth; barra.classList.add('perdeu'); }
}
function sairMissao() {
  restaurarEquipamentos();                                 // AJ e limite de tempo voltam ao normal
  M.ativa = false; M.fase = ''; M.pesado = false; exterior.position.y = 0;
  if ($('m-fim').open) $('m-fim').close();
  document.body.classList.remove('em-missao'); $('missao').hidden = true;
  $('m-vermelho').classList.remove('on'); $('m-splash').classList.remove('on');
  teleportar('braco');
}
$('m-sair').onclick = sairMissao;
// os botões do banner de fim (mf-voltar / mf-proxima) são configurados em fimMissao(), conforme as estrelas
// fechar o banner de resultado de qualquer jeito (Esc, clique fora) volta ao mapa
$('m-fim').addEventListener('close', () => setTimeout(() => { if (M.ativa && M.fase === 'fim') sairMissao(); }, 0));

function atualizarMissao(dt) {
  // segurança: passou do limite (40 s, ou 55 s com combustível extra) = falha por tempo, na hora
  if (M.fase === 'mira' && arred(M.t) > M.limiteTempo) { fimMissao(); return; }
  if (Math.abs(cam2.aspect - innerWidth / innerHeight) > 0.001) { cam2.aspect = innerWidth / innerHeight; cam2.updateProjectionMatrix(); }
  const t = LM(); M.tFase += dt;
  // PESO ACIMA DO LIMITE: o jogador entra na cabine, mas a mira nunca libera.
  // 1,4 s depois da abertura o alarme muda, a cabine sacode forte e a Terra "sobe" na janela (nave caindo);
  // aos 3,4 s o banner de falha abre por cima da própria cena.
  if (M.fase === 'intro' && M.pesado) {
    if (M.tFase > 1.4 && !M.alertaPeso) {
      M.alertaPeso = true; $('m-splash').classList.remove('on');
      $('m-alerta').textContent = t.alerta_peso; dica(t.dica_peso); bip(220, 0.5, 'sawtooth', 0.06);
    }
    if (M.tFase > 3.4) fimMissao('peso');
  } else if (M.fase === 'intro' && M.tFase > AJ.intro) { M.fase = 'mira'; M.tFase = 0; $('m-splash').classList.remove('on'); dica(dicaMira()); }
  if (M.pesado) exterior.position.y = Math.min(14, Math.max(0, M.tFase - 1.4) * 6);
  if (M.fase === 'mira') M.t += dt;
  // câmera: teclado soma no alvo, mouse/toque definem o alvo; a visão segue suave
  const kx = (M.teclas.arrowright || M.teclas.d ? 1 : 0) - (M.teclas.arrowleft || M.teclas.a ? 1 : 0), ky = (M.teclas.arrowup || M.teclas.w ? 1 : 0) - (M.teclas.arrowdown || M.teclas.s ? 1 : 0);
  M.alvo.x = Math.max(-AJ.yawMax, Math.min(AJ.yawMax, M.alvo.x + kx * dt * 0.7));
  M.alvo.y = Math.max(AJ.pitchMin, Math.min(AJ.pitchMax, M.alvo.y + ky * dt * 0.6));
  // GIROSCÓPIO (ímã): se o jogador apontou perto de um ponto ainda vermelho, a visão pula para o centro dele.
  // Ela fica presa ali enquanto o jogador não afastar a mira; depois que o ponto trava, solta sozinha.
  let ima = null;
  if (M.fase === 'mira' && AJ.ima > 0) {
    // alcance = círculo cinza + o braço do "+" (convertido de pixels para ângulo, então vale em qualquer tela)
    const pxPorRad = (innerHeight / 2) / Math.tan(cam2.fov * Math.PI / 360);
    let melhor = (Math.atan(RAIO_CIRCULO / AJ.dist) + BRACO_MIRA / pxPorRad) * AJ.ima;
    const quer = dirDe(M.alvo.x, M.alvo.y);
    M.pontos.forEach(p => { if (p.ok) return; const a = quer.angleTo(p.dir); if (a < melhor) { melhor = a; ima = p; } });
  }
  if (ima !== M.ima) { M.ima = ima; if (ima) { bip(1180, 0.06, 'sine', 0.05); vibrar(25); } $('m-mira').classList.toggle('ima', !!ima); }
  if (ima) { M.olhar.x = ima.yaw; M.olhar.y = ima.pitch; }
  else { const s = Math.min(1, dt * 8); M.olhar.x += (M.alvo.x - M.olhar.x) * s; M.olhar.y += (M.alvo.y - M.olhar.y) * s; }
  const falha = M.fase === 'intro' || M.fase === 'mira' || (M.pesado && M.fase === 'fim');
  let tr = reduz ? 0 : (falha ? AJ.tremor : Math.max(0, AJ.tremor * (1 - M.tFase)));
  if (M.alertaPeso) tr *= 5;   // nave pesada: sacode muito
  if (ima) tr *= 0.3;          // presa no ponto: quase parada
  const yaw = M.olhar.x + (Math.random() - 0.5) * tr * 2, pitch = M.olhar.y + (Math.random() - 0.5) * tr * 2;
  cam2.rotation.set(pitch, -yaw, (Math.random() - 0.5) * tr * 2);
  cam2.position.set((Math.random() - 0.5) * tr * 5, (Math.random() - 0.5) * tr * 5, 0);
  exterior.rotation.z = Math.sin(M.t * 0.25) * 0.04; exterior.userData.terra.rotation.y += dt * 0.02;
  // mira "+" sobre os pontos
  if (M.fase === 'mira') {
    const frente = ima ? ima.dir : dirDe(yaw, pitch); let naMira = false; // com o ímã, conta o centro exato do ponto
    M.pontos.forEach(p => {
      if (p.ok) return;
      if (frente.angleTo(p.dir) < AJ.raio) {
        naMira = true; p.prog += dt;
        if (p.prog >= AJ.segurar) {
          p.ok = true; p.nucleo.material = matVerde; p.brilho.visible = false; p.arco.visible = false;
          bip(990, 0.12, 'sine', 0.07); vibrar(45);
        }
      } else p.prog = Math.max(0, p.prog - dt * 1.5);
      const f = Math.min(1, p.prog / AJ.segurar), passo = Math.round(f * 48);
      if (!p.ok && passo !== p.desenhado) { // círculo branco que mostra os 2 s
        p.desenhado = passo; p.arco.visible = passo > 0;
        if (passo > 0) { p.arco.geometry.dispose(); p.arco.geometry = new THREE.RingGeometry(2.2, 2.65, 48, 1, Math.PI / 2, -Math.PI * 2 * f); }
      }
    });
    // luzes laterais: contadas DEPOIS de checar todos os pontos, então a ordem em que o jogador trava os pontos não importa
    const feitos = M.pontos.filter(p => p.ok).length;
    document.querySelectorAll('#m-luzes i').forEach((l, i) => l.classList.toggle('on', i < feitos));
    if (naMira !== M.naMira) { M.naMira = naMira; $('m-mira').classList.toggle('on', naMira); dica(naMira ? t.segure : dicaMira()); }
    if (feitos >= M.pontos.length) { // piloto automático volta
      M.fase = 'ok'; M.tFase = 0; $('m-alerta').textContent = t.restaurado; $('m-alerta').className = 'm-alerta ok';
      $('m-vermelho').classList.remove('on'); $('m-mira').className = 'm-mira ok'; luzCabine.color.set('#ffffff'); dica(''); bip(1320, 0.3, 'sine', 0.07);
    }
  } else if (M.fase === 'ok' && M.tFase > 1.7) fimMissao();
  $('m-tempo').textContent = M.t.toFixed(1).replace('.', L.codigo === 'pt-BR' ? ',' : '.') + ' s';
  atualizarCombustivel(); atualizarBarraEstrelas();
  const pisca = Math.sin(M.tFase * 10) > 0;
  luzesAlarme.forEach((l, i) => l.visible = falha ? (pisca ? i % 2 === 0 : i % 2 === 1) : false);
  luzCabine.intensity = falha ? 0.8 + (pisca ? 0.5 : 0) : 0.9;
  desenharMostrador();
}
// mover a câmera da cabine: mouse (posição na tela), toque (arrastar) ou setas/WASD
addEventListener('pointermove', e => {
  if (!M.ativa || document.querySelector('dialog[open]')) return;
  if (e.pointerType === 'mouse') {
    M.alvo.x = (e.clientX / innerWidth - 0.5) * 2 * AJ.yawMax;
    M.alvo.y = AJ.pitchMin + (1 - e.clientY / innerHeight) * (AJ.pitchMax - AJ.pitchMin);
  } else if (M.arrasto && M.arrasto.id === e.pointerId) {
    M.alvo.x = Math.max(-AJ.yawMax, Math.min(AJ.yawMax, M.alvo.x + (e.clientX - M.arrasto.x) * 0.004));
    M.alvo.y = Math.max(AJ.pitchMin, Math.min(AJ.pitchMax, M.alvo.y - (e.clientY - M.arrasto.y) * 0.004));
    M.arrasto.x = e.clientX; M.arrasto.y = e.clientY;
  }
});
addEventListener('pointerdown', e => { if (M.ativa && e.pointerType !== 'mouse') M.arrasto = { id: e.pointerId, x: e.clientX, y: e.clientY }; });
addEventListener('pointerup', () => { M.arrasto = null; });
addEventListener('keyup', e => { delete M.teclas[e.key.toLowerCase()]; });

/* ---------------- card da missão real, álbum espacial e Roblox ---------------- */
function cardMissao(c, completo) {
  const tx = L.cards[c.id], el = document.createElement('div'); el.className = 'card-missao';
  const foto = document.createElement('div'); foto.className = 'cm-foto';
  const im = document.createElement('img'); im.src = c.foto; im.alt = tx.nome + ' · ' + L.ui.foto_nasa; foto.appendChild(im);
  const ano = document.createElement('span'); ano.className = 'cm-ano'; ano.textContent = c.ano; foto.appendChild(ano);
  const corpo = document.createElement('div'); corpo.className = 'cm-corpo';
  const tag = document.createElement('small'); tag.textContent = L.album.real;
  const nome = document.createElement('b'); nome.textContent = tx.nome;
  corpo.append(tag, nome);
  if (completo) {
    for (const [rot, val] of [[L.album.objetivo, tx.objetivo], [L.album.aconteceu, tx.aconteceu]]) {
      const p = document.createElement('p'); const s = document.createElement('span'); s.textContent = rot; p.append(s, val); corpo.appendChild(p);
    }
    const f = document.createElement('div'); f.className = 'cm-fonte';
    const a1 = document.createElement('a'); a1.href = 'https://images.nasa.gov/details/' + encodeURIComponent(c.registro.id); a1.target = '_blank'; a1.rel = 'noopener noreferrer'; a1.textContent = c.registro.id;
    const a2 = document.createElement('a'); a2.href = DADOS.ntrs.url; a2.target = '_blank'; a2.rel = 'noopener noreferrer'; a2.textContent = 'NTRS ' + DADOS.ntrs.id;
    f.append(L.ui.fonte + ': NASA · ', a1, ' · ', a2); corpo.appendChild(f);
  }
  el.append(foto, corpo);
  return el;
}
function abrirAlbum() {
  $('al-titulo').textContent = L.album.titulo; $('al-sub').textContent = L.album.sub;
  const grade = $('al-grade'); grade.innerHTML = '';
  DADOS.album.forEach((c, i) => {
    const slot = document.createElement('div'); slot.className = 'al-slot';
    const num = document.createElement('span'); num.className = 'al-num'; num.textContent = String(i + 1).padStart(2, '0'); slot.appendChild(num);
    if (estado.feitas.includes(c.id) && c.foto) { slot.classList.add('cheio'); slot.appendChild(cardMissao(c, true)); }
    else { const v = document.createElement('div'); v.className = 'al-vazio'; const q = document.createElement('b'); q.textContent = '?'; const s = document.createElement('small'); s.textContent = L.cards[c.id].vazio; v.append(q, s); slot.appendChild(v); }
    grade.appendChild(slot);
  });
  limparTeclas(); $('album').showModal();
}
function abrirRoblox(doTotem) { // doTotem = aberto pelo totem da recepção (texto de convite, não de "continuação")
  $('rb-titulo').textContent = doTotem === true ? L.roblox.titulo_totem : L.roblox.titulo;
  $('rb-texto').textContent = doTotem === true ? L.roblox.texto_totem : L.roblox.texto;
  const b = $('rb-link');
  if (DADOS.linkRoblox) { b.href = DADOS.linkRoblox; b.textContent = L.roblox.botao + ' ↗'; b.classList.remove('off'); b.removeAttribute('aria-disabled'); }
  else { b.removeAttribute('href'); b.textContent = L.roblox.em_breve; b.classList.add('off'); b.setAttribute('aria-disabled', 'true'); }
  limparTeclas(); $('roblox').showModal();
}
$('btn-album').onclick = abrirAlbum;

/* ================================================================
   ENTRADA
   ================================================================ */
const jogando = () => $('start').classList.contains('hide');
const pausado = () => !jogando() || document.querySelector('dialog[open]');
function limparTeclas() { for (const k in teclas) delete teclas[k]; joy.x = joy.y = 0; }
addEventListener('keydown', e => {
  if (e.target.matches('input,textarea')) return;
  const k = e.key.toLowerCase();
  if (M.ativa) { // controles da cabine
    if (document.querySelector('dialog[open]')) return;
    if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 'a', 's', 'd', ' '].includes(k)) { e.preventDefault(); M.teclas[k] = true; }
    return;
  }
  if (pausado()) return;
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  if (k === ' ') pularPedido = true;
  else if (k === 'e' && !e.repeat) { if (fala >= 0 && maisPerto !== itMarcos && P.pos.distanceTo(marcos.position) < 14) conversar(); else if (maisPerto) maisPerto.acao(); }
  else teclas[k] = true;
});
addEventListener('keyup', e => { delete teclas[e.key.toLowerCase()]; });
addEventListener('blur', limparTeclas);

const cvs = renderer.domElement;
let arrasto = null;
// Um dedo (ou o mouse) gira a câmera. Dois dedos na tela fazem a PINÇA de zoom:
// afastar os dedos aproxima (até entrar em primeira pessoa), juntar os dedos afasta.
const dedos = new Map(); let pinca = null;
const distDedos = () => { const [a, b] = [...dedos.values()]; return Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)); };
cvs.addEventListener('pointerdown', e => {
  dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
  try { cvs.setPointerCapture(e.pointerId); } catch (err) { /* ponteiro já solto: segue sem captura */ }
  if (dedos.size === 2) { arrasto = null; pinca = { d0: distDedos(), z0: cam.alvoDist }; return; }
  if (dedos.size === 1) arrasto = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY };
});
cvs.addEventListener('pointermove', e => {
  const dd = dedos.get(e.pointerId); if (dd) { dd.x = e.clientX; dd.y = e.clientY; }
  if (pinca && dedos.size >= 2) {
    const r = pinca.d0 / distDedos();                 // < 1: dedos se afastando (aproximar) · > 1: dedos se juntando (afastar)
    if (pinca.z0 < 1) { if (r > 1.2) zoomPara(ZOOM_MIN * r * r, false); }   // estava em 1ª pessoa: só sai com um gesto claro
    else zoomPara(pinca.z0 * r * r, r < 1);           // ao quadrado: dobrar a abertura dos dedos já leva do zoom padrão ao mínimo
    return;
  }
  if (!arrasto || arrasto.id !== e.pointerId) return;
  cam.yaw -= (e.clientX - arrasto.x) * 0.006;
  cam.pitch = Math.max(primeiraPessoa() ? -1.3 : -0.25, Math.min(1.25, cam.pitch + (e.clientY - arrasto.y) * 0.005)); // em 1ª pessoa dá para olhar para cima
  arrasto.x = e.clientX; arrasto.y = e.clientY;
});
const soltarDedo = e => { dedos.delete(e.pointerId); if (pinca) { if (dedos.size < 2) pinca = null; arrasto = null; return true; } return false; };
cvs.addEventListener('pointerup', e => {
  if (soltarDedo(e)) return;                          // fim de uma pinça não conta como clique
  if (!arrasto || arrasto.id !== e.pointerId) return;
  const moveu = Math.hypot(e.clientX - arrasto.sx, e.clientY - arrasto.sy); arrasto = null;
  if (moveu < 6 && !pausado()) clicarMundo(e.clientX, e.clientY);
});
cvs.addEventListener('pointercancel', e => { soltarDedo(e); arrasto = null; });
// roda do mouse (ou pinça no touchpad): aproxima/afasta; no mínimo, mais um passo entra em primeira pessoa
cvs.addEventListener('wheel', e => { e.preventDefault(); zoomPara(cam.alvoDist + e.deltaY * 0.03, e.deltaY < 0); }, { passive: false });
cvs.addEventListener('contextmenu', e => e.preventDefault());
const mouse = new THREE.Vector2();
function clicarMundo(x, y) {
  mouse.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1);
  ray.setFromCamera(mouse, camera); ray.far = 200;
  for (const h of ray.intersectObjects(clicaveis, false)) {
    const it = h.object.userData.inter; if (!it) continue;
    if (P.pos.distanceTo(it.pos) > 70) { falarSistema(L.msg.perto); return; }
    it.acao(); return;
  }
}
{ // joystick
  const base = $('joystick'), stick = $('stick'); let id = null, cx = 0, cy = 0;
  const mover = e => {
    if (e.pointerId !== id) return;
    let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy), max = 50;
    if (d > max) { dx = dx / d * max; dy = dy / d * max; }
    stick.style.transform = `translate(${dx}px,${dy}px)`; joy.x = dx / max; joy.y = dy / max;
  };
  base.addEventListener('pointerdown', e => { id = e.pointerId; base.setPointerCapture(id); const r = base.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; mover(e); });
  base.addEventListener('pointermove', mover);
  const soltar = () => { id = null; joy.x = joy.y = 0; stick.style.transform = ''; };
  base.addEventListener('pointerup', soltar); base.addEventListener('pointercancel', soltar);
  $('jump-btn').addEventListener('pointerdown', e => { e.preventDefault(); pularPedido = true; });
}
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(d => {
  d.addEventListener('click', e => { if (e.target === d) d.close(); });
  d.addEventListener('close', () => { limparTeclas(); cvs.focus({ preventScroll: true }); });
});
$('btn-credits').onclick = () => { limparTeclas(); $('credits').showModal(); };
$('btn-lang').onclick = () => { // troca de idioma: salva posição e recarrega já dentro do jogo
  estado.lang = estado.lang === 'pt' ? 'en' : 'pt'; salvar();
  sessao.set('rr-abrir', 'jogo'); sessao.set('rr-pos', JSON.stringify([P.pos.x, P.pos.y, P.pos.z, cam.yaw]));
  location.reload();
};

function jogar(retorno) {
  salvar();
  tagJogador.textContent = nomeJogador();
  desenharTelao(); renderMissoes(); aplicarTextos();
  $('start').classList.add('hide'); document.body.classList.remove('inicio');
  cvs.focus({ preventScroll: true });
  const pos = sessao.get('rr-pos'); sessao.del('rr-pos');
  if (retorno && pos) { try { const [x, y, z, yaw] = JSON.parse(pos); P.pos.set(x, y, z); cam.yaw = yaw; P.rot = yaw + Math.PI; } catch (e) {} }
  else setTimeout(() => { if (!estado.feitas.includes('falar')) falarSistema(toque ? L.msg.chamado_toque : L.msg.chamado); }, 900);
  // no celular não há barra de dicas: ensina a pinça de zoom uma vez, depois do primeiro aviso
  if (toque) setTimeout(() => { if (!pausado() && !M.ativa && !avisouPP) falarSistema(L.msg.dica_pinca); }, 7000);
}
tagJogador.textContent = nomeJogador(); desenharTelao(); renderMissoes();
preCarregarFotos();

/* ================================================================
   LOOP
   ================================================================ */
let ultimo = performance.now(), tempo = 0;
function quadro(t) {
  const dt = Math.min((t - ultimo) / 1000, 0.05); ultimo = t; tempo += dt;
  if (M.ativa) { atualizarMissao(dt); renderer.render(cena2, cam2); requestAnimationFrame(quadro); return; }
  atualizarElevador(dt); atualizarJogador(dt); atualizarCamera(dt);
  if (jogando()) atualizarZona();
  // capacete: só fica na cabeça lá em cima (plataforma superior e braço de acesso), depois do primeiro embarque
  const comCapacete = estado.capacete && P.pos.y > 36;
  if (jogador.userData.capacete.visible !== comCapacete) definirCapacete(jogador, comCapacete);
  const dm = P.pos.distanceTo(marcos.position);
  if (dm < 22) { let d = Math.atan2(P.pos.x - marcos.position.x, P.pos.z - marcos.position.z) - marcos.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); marcos.rotation.y += d * Math.min(1, dt * 5); }
  animarBoneco(marcos, 0, dt, false);
  if (marcos.userData.acenando) { marcos.userData.bracoD.rotation.z = 2.6 + Math.sin(tempo * 8) * 0.35; marcos.userData.bracoD.rotation.x = 0; marcos.userData.bracoE.rotation.x = 0; }
  else marcos.userData.bracoD.rotation.z = 0;
  if (fala >= 0 && dm > 26) { fala = -1; balao.style.display = 'none'; marcos.userData.acenando = false; itMarcos.rotulo = L.prompt.conversar; }
  if (!reduz) {
    globo.rotation.y += dt * 0.4;
    const pulso = 1 + Math.sin(tempo * 3) * 0.06;
    totens.forEach(tt => tt.anel.scale.set(pulso, pulso, 1));
    anelJogo.scale.set(pulso, pulso, 1);
    luzEscotilha.visible = Math.sin(tempo * 4) > 0;
  }
  totens.forEach(tt => tt.anel.material = mat(estado.expos.includes(tt.chave) ? '#2fbf71' : VERMELHO, { neon: true }));
  renderer.render(scene, camera);
  const emPP = primeiraPessoa() && cam.dist < 2.6;
  if (emPP) tagJogador.style.visibility = 'hidden'; else naTela(tagJogador, P.pos, 7.4);
  const marcosPerto = dm < 45; // longe demais: não mostra nome nem "!"
  if (marcosPerto) naTela(tagMarcos, marcos.position, 7.6, true); else tagMarcos.style.visibility = 'hidden';
  exclamacao.style.display = estado.feitas.includes('falar') || fala >= 0 || !marcosPerto ? 'none' : 'block';
  if (exclamacao.style.display === 'block') naTela(exclamacao, marcos.position, 10.4 + (reduz ? 0 : Math.sin(tempo * 4) * 0.4), true);
  if (balao.style.display === 'block') naTela(balao, marcos.position, 8.6, true);
  if (balaoJog.style.display === 'block') {
    // em primeira pessoa não há boneco para ancorar o aviso: ele fica fixo no alto da tela
    if (emPP) { balaoJog.style.visibility = 'visible'; balaoJog.style.left = (innerWidth / 2) + 'px'; balaoJog.style.top = (innerHeight * 0.3) + 'px'; }
    else naTela(balaoJog, P.pos, 8.8);
  }
  const alvo = jogando() ? alvoObjetivo() : null;
  const mostraSeta = alvo && alvo.distanceTo(P.pos) >= 9 && fala < 0;
  seta.style.display = mostraSeta ? 'block' : 'none';
  if (mostraSeta) naTela(seta, alvo, reduz ? 0 : Math.sin(tempo * 4) * 0.6, true);
  atualizarPrompt();
  requestAnimationFrame(quadro);
}
teleportar('recepcao');
requestAnimationFrame(quadro);

// atalhos para apresentação: index.html#lang=pt&g=m&jogar&tp=museu  ·  &expo=atlantis  ·  &missao
const h = new URLSearchParams(location.hash.slice(1));
if (PONTOS[h.get('tp')]) teleportar(h.get('tp'));
if (h.has('missao')) setTimeout(() => { // #missao abre a fase 1 · #missao=fim mostra o banner de conclusão
  estado.capacete = true; teleportar('braco'); comecarMissao();
  if (h.get('missao') === 'mira') { M.fase = 'mira'; M.tFase = 0; $('m-splash').classList.remove('on'); dica(dicaMira()); M.alvo.x = PONTOS_M[0][0] + 0.03; M.alvo.y = PONTOS_M[0][1]; M.pontos[1].prog = 2; }
  if (h.get('missao') === 'fim') { M.t = parseFloat(h.get('t')) || 11.4; fimMissao(); } // ex.: #missao=fim&t=30 (1 estrela) · &t=41 (falha)
  if (h.get('missao') === 'escolha') { sairMissao(); if (!estado.estrelas) estado.estrelas = 2; if (!missaoFeita()) estado.feitas.push('missao1'); abrirEscolha(); }
}, 300);
if (h.has('capacete')) estado.capacete = true; // atalho: já chega com o capacete liberado (aparece na plataforma de cima)
// atalho do pitch: #preparo=falha (3 itens, 80 kg → não decola) · #preparo=bom (só o giroscópio) · #preparo (últimas escolhas)
if (h.has('preparo')) setTimeout(() => {
  estado.capacete = true; teleportar('braco');
  const modo = h.get('preparo');
  abrirPreparo(modo === 'falha' ? DADOS.equipamentos.map(e => e.id) : modo === 'bom' ? ['giroscopio'] : undefined);
}, 300);
if (h.has('album')) setTimeout(abrirAlbum, 300);
if (h.has('roblox')) setTimeout(abrirRoblox, 300);
if (L.expos[h.get('expo')]) abrirExpo(h.get('expo'));
if (h.has('pp')) cam.dist = cam.alvoDist = 0; // atalho: já começa em primeira pessoa
if (h.has('cam')) { const [d, y, p] = h.get('cam').split(',').map(Number); if (d) cam.dist = cam.alvoDist = d; if (!isNaN(y)) cam.yaw = y; if (!isNaN(p)) cam.pitch = p; }
if (h.has('falar')) conversar();

return { jogar };
}

// atalhos de apresentação: index.html#lang=en&g=m&jogar  (g = m feminino, h masculino)
{
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.get('g') === 'm' || h.get('g') === 'h') estado.av.g = h.get('g');
  if (h.get('lang') === 'pt' || h.get('lang') === 'en') escolherIdioma(h.get('lang'));
  atualizarStart();
  if (sessao.get('rr-abrir') === 'jogo' && L && estado.av.g) { sessao.del('rr-abrir'); iniciarJogo(true); } // volta de uma troca de idioma
  else if (h.has('jogar') && L && estado.av.g) iniciarJogo(false);
}
})();
