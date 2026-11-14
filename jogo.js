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
const estado = { lang: '', nome: '', av: { g: '' }, capacete: false, feitas: [], expos: [] };
try {
  const s = JSON.parse(localStorage.getItem(SAVE) || '{}');
  if (s.lang === 'pt' || s.lang === 'en') estado.lang = s.lang;
  if (typeof s.nome === 'string') estado.nome = s.nome.slice(0, 20);
  if (s.av && (s.av.g === 'h' || s.av.g === 'm')) estado.av = { g: s.av.g };
  estado.capacete = s.capacete === true;
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
  $('btn-lang').textContent = estado.lang === 'pt' ? 'EN' : 'PT';
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
  DADOS.missao1.forEach(r => linha(r, L.missao.fase));
}

/* ---------------- tela inicial ---------------- */
const PELE = '#c98e63';
function svgAvatar(g, cap) {
  const f = g === 'm', clip = 'v' + g + (cap ? 1 : 0);
  const cabelo = f
    ? `<path d="M40 30 Q42 14 60 14 Q80 14 81 32 L82 62 Q78 70 70 66 L70 34 L50 34 L50 66 Q42 70 38 62Z" fill="#3a2216"/><circle cx="36" cy="44" r="9" fill="#3a2216"/>`
    : [[46, 22], [54, 17], [62, 16], [70, 18], [76, 24], [44, 30], [78, 31], [50, 22], [66, 20], [58, 21], [72, 25]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6.5" fill="#2b1a12"/>`).join('');
  const olhos = `<ellipse cx="53" cy="41" rx="2.6" ry="3.6" fill="#1b1b1b"/><ellipse cx="67" cy="41" rx="2.6" ry="3.6" fill="#1b1b1b"/>` +
    (f ? `<path d="M50 37 l-2 -2 M56 37 l2 -2 M64 37 l-2 -2 M70 37 l2 -2" stroke="#1b1b1b" stroke-width="1.4"/>` : `<path d="M49 35 h8 M63 35 h8" stroke="#1b1b1b" stroke-width="2.2"/>`);
  const cabeca = `<rect x="44" y="24" width="32" height="34" rx="7" fill="${PELE}"/>${olhos}<path d="M53 49 Q60 55 67 49" stroke="#1b1b1b" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const capacete = cap
    ? `<circle cx="60" cy="40" r="30" fill="#f4f3ef" stroke="#b8bcc4" stroke-width="2"/><circle cx="29" cy="40" r="6" fill="#b8bcc4"/><circle cx="91" cy="40" r="6" fill="#b8bcc4"/>`
    : '';
  const viseira = cap ? `<ellipse cx="60" cy="41" rx="23" ry="21" fill="rgba(127,167,214,.28)" stroke="#16284f" stroke-width="2"/><rect x="50" y="64" width="20" height="3" rx="1.5" fill="#e3262b"/>` : '';
  return `<svg viewBox="0 0 120 170" aria-hidden="true">
    <ellipse cx="60" cy="164" rx="34" ry="5" fill="rgba(0,0,0,.15)"/>
    <rect x="38" y="104" width="21" height="48" fill="#ece9e2" stroke="#c9c6be"/><rect x="61" y="104" width="21" height="48" fill="#ece9e2" stroke="#c9c6be"/>
    <rect x="41" y="128" width="14" height="10" rx="2" fill="#5f6470"/><rect x="65" y="128" width="14" height="10" rx="2" fill="#5f6470"/>
    <rect x="38" y="142" width="21" height="3" fill="#16284f"/><rect x="61" y="142" width="21" height="3" fill="#16284f"/>
    <rect x="36" y="150" width="24" height="10" rx="2" fill="#f3f2ee" stroke="#c9c6be"/><rect x="60" y="150" width="24" height="10" rx="2" fill="#f3f2ee" stroke="#c9c6be"/>
    <rect x="36" y="158" width="24" height="4" fill="#4a4f5a"/><rect x="60" y="158" width="24" height="4" fill="#4a4f5a"/>
    <rect x="16" y="64" width="17" height="38" fill="#ece9e2" stroke="#c9c6be"/><rect x="87" y="64" width="17" height="38" fill="#ece9e2" stroke="#c9c6be"/>
    <rect x="16" y="73" width="17" height="2.5" fill="#e3262b"/><rect x="16" y="77" width="17" height="3" fill="#16284f"/><rect x="87" y="73" width="17" height="2.5" fill="#e3262b"/><rect x="87" y="77" width="17" height="3" fill="#16284f"/>
    <rect x="16" y="96" width="17" height="5" fill="#16284f"/><rect x="87" y="96" width="17" height="5" fill="#16284f"/>
    <rect x="17" y="101" width="15" height="10" rx="3" fill="${PELE}"/><rect x="88" y="101" width="15" height="10" rx="3" fill="${PELE}"/>
    <rect x="33" y="62" width="54" height="44" fill="#ece9e2" stroke="#c9c6be"/>
    <rect x="40" y="62" width="6" height="44" fill="#8a8f99"/><rect x="74" y="62" width="6" height="44" fill="#8a8f99"/>
    <use href="#logo" x="64" y="64" width="13" height="13"/>
    <rect x="52" y="78" width="16" height="12" fill="#c9ccd2" stroke="#8a8f99"/><rect x="57" y="85" width="5" height="3" fill="#2a5bd7"/>
    <circle cx="51" cy="96" r="3.5" fill="#2a5bd7"/><circle cx="69" cy="98" r="3.5" fill="#d3262b"/>
    <rect x="44" y="57" width="32" height="7" rx="2" fill="#16284f"/>
    ${cap ? `<clipPath id="${clip}"><ellipse cx="60" cy="41" rx="23" ry="21"/></clipPath>` : ''}
    ${capacete}<g ${cap ? `clip-path="url(#${clip})"` : ''}>${cabeca}${cabelo}</g>${viseira}
  </svg>`;
}
/* Card inicial: idioma → nome → gênero → JOGAR.
   Trocar idioma aqui é instantâneo: o mundo 3D só é montado ao clicar em JOGAR. */
let mundo = null;
const HINT_BILINGUE = 'Escolha um idioma para começar · Choose a language to start';
function atualizarStart() {
  document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.lang === estado.lang)));
  document.querySelectorAll('[data-g]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.g === estado.av.g)));
  $('av-preview').innerHTML = svgAvatar(estado.av.g || 'h', !estado.av.g); // sem gênero escolhido: astronauta de capacete
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
  return Promise.race([document.fonts.load('40px Michroma').catch(() => {}), new Promise(r => setTimeout(r, 1500))]);
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
const TXT = '"Segoe UI", system-ui, sans-serif';

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
    if (f) { g.lineWidth = 3; for (const [x, s] of [[170, -1], [182, 1], [202, -1], [214, 1]]) { g.beginPath(); g.moveTo(x, 46); g.lineTo(x + s * 5, 40); g.stroke(); } g.lineWidth = 3; g.beginPath(); g.moveTo(166, 36); g.lineTo(184, 33); g.moveTo(200, 33); g.lineTo(218, 36); g.stroke(); }
    else { g.lineWidth = 6; g.beginPath(); g.moveTo(164, 36); g.lineTo(186, 34); g.moveTo(198, 34); g.lineTo(220, 36); g.stroke(); }
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
  if (cfg.cabelo === 'cacheado') {
    const m = mat('#2b1a12');
    const geo = new THREE.SphereGeometry(0.23, 10, 8);
    const pts = [[0, 5.55, 0]];
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; pts.push([Math.cos(a) * 0.38, 5.5, Math.sin(a) * 0.38]); }
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; if (Math.sin(a) > 0.55) continue; pts.push([Math.cos(a) * 0.62, 5.3, Math.sin(a) * 0.62]); }
    for (let i = 0; i < 10; i++) { const a = Math.PI + i / 9 * Math.PI; pts.push([Math.cos(a) * 0.6, 4.95, Math.sin(a) * 0.6]); }
    for (const [x, y, z] of pts) { const s = new THREE.Mesh(geo, m); s.position.set(x, y, z); s.castShadow = true; g.add(s); }
  } else if (cfg.cabelo === 'longo') {
    const m = mat('#3a2216');
    const tampa = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.68, 0.32, 20), m); tampa.position.y = 5.45; tampa.castShadow = true; g.add(tampa);
    caixa(0.24, 0.9, 1.0, m, cabeloLongo, -0.62, 5.0, -0.12); caixa(0.24, 0.9, 1.0, m, cabeloLongo, 0.62, 5.0, -0.12);
    caixa(1.3, 0.8, 0.28, m, cabeloLongo, 0, 5.05, -0.55);
    caixa(1.4, 1.4, 0.32, m, cabeloLongo, 0, 4.4, -0.62);
    const coque = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), m); coque.position.set(-0.45, 4.6, -0.78); cabeloLongo.add(coque);
  } else if (cfg.cabelo === 'grisalho') { // cabelo curto grisalho, mais claro em cima
    const claro = mat('#d3d3cf'), medio = mat('#a9aaa6');
    const topo = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.66, 0.26, 20), claro); topo.position.set(0, 5.47, -0.04); topo.castShadow = true; g.add(topo);
    caixa(1.3, 0.62, 0.26, medio, g, 0, 5.08, -0.55);
    caixa(0.2, 0.52, 0.86, medio, g, -0.63, 5.12, -0.12); caixa(0.2, 0.52, 0.86, medio, g, 0.63, 5.12, -0.12);
    caixa(0.9, 0.14, 0.2, claro, g, 0, 5.38, 0.5); // franja curta
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
const globo = new THREE.Mesh(new THREE.SphereGeometry(2.2, 24, 16), new THREE.MeshLambertMaterial({ color: '#3d8de0', emissive: '#16284f', emissiveIntensity: 0.35 }));
globo.position.set(-7, 6.8, -10.5); globo.castShadow = true; scene.add(globo);
globo.add(new THREE.Mesh(new THREE.SphereGeometry(2.25, 12, 8, 0, 2, 0.6, 1.6), mat('#3ad07a')));
const anelGlobo = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.12, 8, 48), mat(VERMELHO, { neon: true }));
anelGlobo.position.copy(globo.position); anelGlobo.rotation.x = 1.2; scene.add(anelGlobo);
cil(0.8, 1.1, 2.3, '#c8d3e2', -7, 3.8, -10.5);
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
  [{ t: P_.c2a1, tam: 32, cor: '#ffcf3f' }, { t: 'HANGAR 01', tam: 66 }],
  [{ t: 'RR-01', tam: 66 }, { t: P_.c2b2, tam: 34, cor: '#ff8a2a', peso: 700 }]);

/* ---------- HANGAR ---------- */
sala({ x0: -40, x1: 40, z0: -235, z1: -175, h: 60, chao: '#596273', chaoLado: '#3b4250', parede: '#2b3344', teto: '#1c2230', sul: [-7, 7], faixa: '#ffcf3f', luzes: 14, neon: '#ff8a2a' });
{
  const c = canvasPlaca(40, 30, (g, cw, ch) => {
    g.fillStyle = '#3e4757'; g.fillRect(0, 0, cw, ch);
    for (let x = 0; x < cw; x += 24) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, 0, 4, ch); }
    for (let x = -ch; x < cw; x += 60) { g.fillStyle = '#ffcf3f'; g.beginPath(); g.moveTo(x, ch); g.lineTo(x + 30, ch); g.lineTo(x + 60, ch - 30); g.lineTo(x + 30, ch - 30); g.fill(); }
    logoCanvas(g, cw / 2 - 150, 40, 60);
    g.fillStyle = '#fff'; g.font = `44px ${TIT}`; g.textAlign = 'center'; g.fillText('HANGAR 01', cw / 2 + 30, 92);
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
soClique(nave, new THREE.Vector3(NAVE.x, 20, NAVE.z), () => abrirExpo('artemis'));
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
}

/* ================================================================
   PERSONAGENS: só o jogador e o Marcos Pontes
   ================================================================ */
let jogador = null;
function criarJogador() {
  const pos = jogador ? jogador.position.clone() : null, rot = jogador ? jogador.rotation.y : 0;
  if (jogador) scene.remove(jogador);
  jogador = astronauta({ g: estado.av.g, cap: estado.capacete, cabelo: estado.av.g === 'm' ? 'longo' : 'cacheado' });
  if (pos) { jogador.position.copy(pos); jogador.rotation.y = rot; }
}
criarJogador();
const marcos = astronauta({ g: 'h', cap: false, cabelo: 'grisalho', sobrancelha: '#8d8d88', bandeira: true, pele: '#d8a47f' });
marcos.position.set(0, 0, -4.5);
const itMarcos = interativo({ pos: new THREE.Vector3(0, 6.6, -4.5), raio: 10, rotulo: L.prompt.conversar, objeto: L.prompt.marcos, acao: conversar, alvos: [marcos] });

/* ---------------- física do jogador ---------------- */
const P = { pos: new THREE.Vector3(0, 0, 16), vy: 0, noChao: true, chaoSol: null, rot: Math.PI, vel: 0 };
const RAIO = 0.9, ALT = 5.6, DEGRAU = 2.2, VEL = 16, PULO = 50, GRAV = 196.2;
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
  if (n > 0.05) { let d = Math.atan2(dx, dz) - P.rot; d = Math.atan2(Math.sin(d), Math.cos(d)); P.rot += d * Math.min(1, dt * 14); }
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
  ray.set(alvoCam, dir); ray.far = cam.dist;
  const hit = ray.intersectObjects(bloqueiaCam, false)[0];
  const d = hit ? Math.max(1.5, hit.distance - 0.8) : cam.dist;
  camera.position.copy(alvoCam).addScaledVector(dir, d); camera.lookAt(alvoCam);
  jogador.visible = d > 2.2;
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
function naTela(e, pos, dy = 0) {
  v3.copy(pos); v3.y += dy; v3.project(camera);
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
  const ol = $('mission-list'); ol.innerHTML = '';
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
  $('ls-name').textContent = nomeJogador();
  $('ls-expo').textContent = `${contExpos()}/6`;
  $('ls-badges').textContent = estado.feitas.length;
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
  const mostrar = (r, btn) => { $('info-img').src = r.foto; $('info-img').alt = `${e.titulo} · ${L.ui.foto_nasa} ${r.id}`; th.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn)); };
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
const PONTOS = { recepcao: [0, 0, 16, 0], museu: [0, 0, -84, 0], hangar: [2, 0, -192, 0.35], elevador: [16, 14, -220, -Math.PI / 2], braco: [3, 41, -210, Math.PI / 2] };
function teleportar(k) { const [x, y, z, yaw] = PONTOS[k]; P.pos.set(x, y, z); P.vy = 0; cam.yaw = yaw; P.rot = yaw + Math.PI; }

/* ================================================================
   FASE 1 · PROJETO MERCURY · TASK 1: O COLAPSO DO PILOTO AUTOMÁTICO
   Cabine em primeira pessoa (cena própria). Fluxo:
   alarme (tela treme, alerta laranja) → botão DESLIGAR AUTOPILOTO →
   controle manual com ← → (cada toque gasta RCS) → 4 alvos travados →
   piloto automático restaurado.  RCS zerado = fim de jogo.
   ================================================================ */
// Ajuste de dificuldade: 40 toques de RCS no tanque (2,5% cada). Em pânico (~4 toques/s) acaba em ~10 s.
const AJ = { impulso: 6, custo: 2.5, raioAlvo: 5, segurar: 1.2, limite: 50, empurrao: 6, vies: 2.5, amortecer: 0.3 };
const ALVOS = [22, -26, 34, -8];
const M = { ativa: false, fase: '', a: 0, w: 0, tq: 0, tqT: 0, fuel: 100, alvoI: 0, hold: 0, t: 0, toques: [], avisoT: 0, look: { x: 0, y: 0 }, fimT: 0 };
const cena2 = new THREE.Scene(); cena2.background = new THREE.Color('#02040a');
const cam2 = new THREE.PerspectiveCamera(72, 1, 0.05, 600);
const exterior = new THREE.Group(); cena2.add(exterior); // gira com a nave (roll)
{
  const pts = [];
  for (let i = 0; i < 900; i++) { const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = 300, s = Math.sqrt(1 - u * u); pts.push(r * s * Math.cos(th), r * u, r * s * Math.sin(th)); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  exterior.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: false })));
  const tex = new THREE.CanvasTexture(cv(512, 256, (g, w, h) => {
    g.fillStyle = '#1d5fb4'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3f8f4f'; for (let i = 0; i < 26; i++) { g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 20 + Math.random() * 50, 10 + Math.random() * 30, Math.random() * 3, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 10 + Math.random() * 40, 3 + Math.random() * 8, 0, 0, 7); g.fill(); }
  }));
  const terra = new THREE.Mesh(new THREE.SphereGeometry(80, 48, 32), new THREE.MeshLambertMaterial({ map: tex }));
  terra.position.set(0, -58, -105); exterior.add(terra); exterior.userData.terra = terra;
  const atm = new THREE.Mesh(new THREE.SphereGeometry(82.5, 48, 32), new THREE.MeshBasicMaterial({ color: '#7fc3ff', transparent: true, opacity: 0.25, side: THREE.BackSide }));
  atm.position.copy(terra.position); exterior.add(atm);
  const solM = new THREE.DirectionalLight(0xffffff, 1.1); solM.position.set(60, 40, 20); cena2.add(solM);
}
const luzAmb = new THREE.AmbientLight(0xffffff, 0.45); cena2.add(luzAmb);
const luzCabine = new THREE.PointLight(0xffffff, 1, 6); luzCabine.position.set(0, 0.6, -0.4); cena2.add(luzCabine);
const cabineM = new THREE.Group(); cena2.add(cabineM);
const cx = (w, h, d, cor, x, y, z, rx = 0, pai = cabineM) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof cor === 'string' ? mat(cor) : cor); m.position.set(x, y, z); m.rotation.x = rx; pai.add(m); return m; };
let mostrador, texMostrador, luzesAlarme = [];
{
  // moldura da janela + paredes da cápsula (o vão central mostra o espaço)
  cx(4, 0.5, 0.2, '#262a33', 0, 1.25, -1.9); cx(1.1, 1.6, 0.2, '#262a33', -1.45, 0.55, -1.9); cx(1.1, 1.6, 0.2, '#262a33', 1.45, 0.55, -1.9);
  cx(0.12, 1.2, 0.25, '#3a3f4a', -0.88, 0.55, -1.85); cx(0.12, 1.2, 0.25, '#3a3f4a', 0.88, 0.55, -1.85); cx(1.9, 0.12, 0.25, '#3a3f4a', 0, 1.1, -1.85);
  cx(0.3, 3, 3, '#1c1f26', -2, 0, -0.8); cx(0.3, 3, 3, '#1c1f26', 2, 0, -0.8); cx(4.3, 0.3, 3, '#1c1f26', 0, 1.6, -0.8);
  // painel principal inclinado
  const painel = new THREE.Group(); painel.position.set(0, -0.5, -1.75); painel.rotation.x = -0.3; cabineM.add(painel);
  cx(3.6, 1.35, 0.14, '#2f343e', 0, 0, 0, 0, painel);
  cx(3.7, 0.08, 0.2, VERMELHO, 0, 0.7, 0.02, 0, painel);
  texMostrador = new THREE.CanvasTexture(cv(512, 512, () => {}));
  mostrador = new THREE.Mesh(new THREE.CircleGeometry(0.48, 48), new THREE.MeshBasicMaterial({ map: texMostrador }));
  mostrador.position.set(0, 0.02, 0.08); painel.add(mostrador);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 10, 48), mat('#b8bcc4')); aro.position.set(0, 0.02, 0.09); painel.add(aro);
  // instrumentos e chaves decorativos
  const gauge = (x, y, rot) => {
    const t = new THREE.CanvasTexture(cv(128, 128, g => { g.fillStyle = '#0b0d12'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.strokeStyle = '#e8e6df'; g.lineWidth = 3; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(64 + Math.cos(a) * 48, 64 + Math.sin(a) * 48); g.lineTo(64 + Math.cos(a) * 58, 64 + Math.sin(a) * 58); g.stroke(); } g.strokeStyle = '#ff7a1a'; g.lineWidth = 5; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.cos(rot) * 44, 64 + Math.sin(rot) * 44); g.stroke(); }));
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.17, 28), new THREE.MeshBasicMaterial({ map: t })); m.position.set(x, y, 0.08); painel.add(m);
  };
  gauge(-1.05, 0.25, 0.6); gauge(-1.05, -0.2, 2.2); gauge(1.05, 0.25, 4.1); gauge(1.05, -0.2, 1.3); gauge(-1.5, 0.02, 5); gauge(1.5, 0.02, 3);
  for (let i = 0; i < 6; i++) { cx(0.07, 0.16, 0.07, '#d9d9d4', -0.62 + i * 0.25, -0.52, 0.1, 0.4, painel); cx(0.12, 0.06, 0.04, '#111', -0.62 + i * 0.25, -0.6, 0.08, 0, painel); }
  for (let i = 0; i < 5; i++) { const l = cx(0.14, 0.09, 0.05, mat(VERMELHO, { neon: true }), -0.5 + i * 0.25, 0.58, 0.08, 0, painel); luzesAlarme.push(l); }
  const etiqueta = (txt, x, y) => { const t = new THREE.CanvasTexture(cv(256, 64, g => { g.fillStyle = '#2f343e'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#e8e6df'; g.font = `26px ${TIT}`; g.textAlign = 'center'; g.fillText(txt, 128, 42); })); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.1), new THREE.MeshBasicMaterial({ map: t })); m.position.set(x, y, 0.08); painel.add(m); };
  etiqueta('ATTITUDE', 0, -0.42); etiqueta('RCS', -1.05, 0.48); etiqueta('RETRO', 1.05, 0.48);
  // laterais com chaves (cápsula apertada, como a Mercury)
  for (const s of [-1, 1]) { const lat = cx(0.9, 1, 0.1, '#2b2f38', s * 1.55, -0.3, -1.1); lat.rotation.y = -s * 0.9; for (let i = 0; i < 4; i++) cx(0.06, 0.14, 0.06, '#d9d9d4', s * (1.3 + i * 0.12), -0.15 - (i % 2) * 0.2, -1.0 + i * 0.09, 0.3); }
}
// desenho do mostrador de atitude (redesenhado a cada quadro)
function desenharMostrador() {
  const c = texMostrador.image, g = c.getContext('2d'), W = 512, R = 240, k = (R * 0.72) / 45;
  g.clearRect(0, 0, W, W);
  g.save(); g.translate(256, 256);
  g.beginPath(); g.arc(0, 0, R, 0, 7); g.clip();
  g.save(); g.rotate(M.a * Math.PI / 180 * 0.6); // horizonte inclina com a nave
  g.fillStyle = '#2f6fb8'; g.fillRect(-W, -W, W * 2, W); g.fillStyle = '#7a4e2a'; g.fillRect(-W, 0, W * 2, W);
  g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.moveTo(-W, 0); g.lineTo(W, 0); g.stroke();
  g.restore();
  g.save(); g.rotate(M.t * (M.fase === 'manual' || M.fase === 'alarme' ? 0.9 : 0.1)); // anel girando sozinho
  g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 4;
  for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2, r1 = i % 3 ? R - 18 : R - 34; g.beginPath(); g.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); g.lineTo(Math.cos(a) * R, Math.sin(a) * R); g.stroke(); }
  g.restore();
  // régua horizontal
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3;
  for (let v = -45; v <= 45; v += 15) { g.beginPath(); g.moveTo(v * k, -12); g.lineTo(v * k, 12); g.stroke(); }
  // alvo verde
  if (M.alvoI < ALVOS.length && M.fase === 'manual') {
    const ax = ALVOS[M.alvoI] * k, perto = Math.abs(M.a - ALVOS[M.alvoI]) < AJ.raioAlvo;
    g.strokeStyle = perto ? '#9be37a' : '#2fbf71'; g.lineWidth = 8; g.beginPath(); g.arc(ax, 0, AJ.raioAlvo * k + 14, 0, 7); g.stroke();
    if (M.hold > 0) { g.strokeStyle = '#ffffff'; g.lineWidth = 10; g.beginPath(); g.arc(ax, 0, AJ.raioAlvo * k + 28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (M.hold / AJ.segurar)); g.stroke(); }
  } else if (M.fase === 'ok' || M.fase === 'fim') { g.strokeStyle = '#2fbf71'; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, AJ.raioAlvo * k + 14, 0, 7); g.stroke(); }
  // cruz (indicador de atitude)
  const x = M.a * k;
  g.strokeStyle = '#111'; g.lineWidth = 16; g.beginPath(); g.moveTo(x - 46, 0); g.lineTo(x + 46, 0); g.moveTo(x, -46); g.lineTo(x, 46); g.stroke();
  g.strokeStyle = '#ffb21a'; g.lineWidth = 9; g.beginPath(); g.moveTo(x - 44, 0); g.lineTo(x + 44, 0); g.moveTo(x, -44); g.lineTo(x, 44); g.stroke();
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
function embarcar() {
  if (M.ativa) return;
  if (!estado.capacete) { // capacete aparece automaticamente na primeira missão
    estado.capacete = true; salvar(); definirCapacete(jogador, true);
    falarSistema(L.msg.capacete); bip(660, 0.15, 'sine', 0.06);
    setTimeout(abrirBriefing, 1400);
  } else abrirBriefing();
}
function abrirBriefing() {
  const t = LM();
  $('mb-fase').textContent = t.fase; $('mb-task').textContent = t.task; $('mb-tipo').textContent = t.tipo;
  $('mb-intro').textContent = t.intro; $('mb-como-t').textContent = t.como_titulo; $('mb-hist-t').textContent = t.historia_titulo;
  $('mb-aviso').textContent = t.aviso; $('mb-comecar').textContent = '▶ ' + t.comecar;
  const lista = (id, itens) => { const el = $(id); el.innerHTML = ''; itens.forEach(x => { const li = document.createElement('li'); li.textContent = x; el.appendChild(li); }); };
  lista('mb-como', t.como); lista('mb-fatos', t.fatos);
  const fotos = $('mb-fotos'); fotos.innerHTML = '';
  const fontes = $('mb-fontes'); fontes.innerHTML = '';
  DADOS.missao1.forEach(r => {
    const im = document.createElement('img'); im.src = r.foto; im.alt = L.ui.foto_nasa + ' ' + r.id; im.loading = 'lazy'; fotos.appendChild(im);
    const d = document.createElement('div');
    const a = document.createElement('a'); a.href = 'https://images.nasa.gov/details/' + encodeURIComponent(r.id); a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = r.id;
    d.append(`${L.ui.fonte}: ${FONTE_API} · `, a, ` · ${L.ui.credito}: ${r.credito}`); fontes.appendChild(d);
  });
  limparTeclas(); $('m-brief').showModal();
}
$('mb-comecar').onclick = () => { $('m-brief').close(); comecarMissao(); };
function comecarMissao() {
  const t = LM();
  Object.assign(M, { ativa: true, fase: 'alarme', a: 0, w: 7, tq: 0, tqT: 0, fuel: 100, alvoI: 0, hold: 0, t: 0, toques: [], avisoT: 0, fimT: 0 });
  M.look.x = M.look.y = 0;
  document.body.classList.add('em-missao'); $('missao').hidden = false;
  $('m-fase').textContent = t.fase; $('m-task').textContent = t.task; $('m-sair').textContent = '✕ ' + t.sair;
  $('m-rcs-l').textContent = t.rcs; $('m-alvos-l').textContent = t.alvos; $('m-tempo-l').textContent = t.tempo;
  $('m-alerta').textContent = t.alerta; $('m-alerta').className = 'm-alerta pisca';
  $('m-vermelho').classList.add('on');
  $('m-botao').textContent = t.botao; $('m-botao').hidden = false;
  $('m-esq').hidden = $('m-dir').hidden = true;
  dica(t.dica_alarme);
  document.querySelectorAll('#m-luzes i').forEach(i => i.classList.remove('on'));
  luzCabine.color.set('#ff3030');
  limparTeclas(); cvs.focus({ preventScroll: true });
  bip(440, 0.25, 'sawtooth', 0.04);
}
function dica(txt, aviso) { const d = $('m-dica'); d.textContent = txt; d.classList.toggle('aviso', !!aviso); }
function desligarAutopiloto() {
  if (M.fase !== 'alarme') return;
  M.fase = 'manual'; M.tqT = 0;
  $('m-botao').hidden = true; $('m-esq').hidden = $('m-dir').hidden = false;
  dica(LM().dica_manual); bip(300, 0.2, 'square', 0.05);
}
function toqueRCS(dir) {
  if (M.fase !== 'manual') return;
  M.w += dir * AJ.impulso;
  M.fuel = Math.max(0, M.fuel - AJ.custo);
  M.toques.push(M.t);
  bip(dir > 0 ? 520 : 480, 0.04, 'triangle', 0.03);
  if (M.fuel <= 0) fimMissao(false);
}
function fimMissao(ok) {
  M.fase = 'fim';
  const t = LM();
  setTimeout(() => {
    $('mf-icone').textContent = ok ? '✔' : '✕'; $('mf-icone').className = 'm-fim-icone' + (ok ? '' : ' falha');
    $('mf-titulo').textContent = ok ? t.sucesso_titulo : t.falha_titulo;
    $('mf-texto').textContent = ok ? t.sucesso_txt : t.falha_txt;
    const st = $('mf-stats'); st.innerHTML = '';
    for (const [rot, val] of [[t.restou, Math.round(M.fuel) + '%'], [t.fim_tempo, M.t.toFixed(1).replace('.', L.codigo === 'pt-BR' ? ',' : '.') + ' s']]) {
      const d = document.createElement('div'); const s = document.createElement('small'); s.textContent = rot; const b = document.createElement('b'); b.textContent = val; d.append(s, b); st.appendChild(d);
    }
    $('mf-aprendizado').textContent = ok ? t.aprendizado : '';
    $('mf-voltar').textContent = t.voltar; $('mf-tentar').textContent = '↻ ' + t.tentar;
    $('m-fim').showModal();
    if (ok) concluir('missao1');
  }, ok ? 1800 : 700);
  if (!ok) { bip(160, 0.6, 'sawtooth', 0.06); dica(t.falha_titulo, true); }
}
function sairMissao() {
  M.ativa = false; M.fase = '';
  if ($('m-fim').open) $('m-fim').close();
  document.body.classList.remove('em-missao'); $('missao').hidden = true;
  $('m-vermelho').classList.remove('on');
  teleportar('braco');
}
$('m-botao').onclick = desligarAutopiloto;
$('m-sair').onclick = sairMissao;
$('mf-voltar').onclick = sairMissao;
$('mf-tentar').onclick = () => { $('m-fim').close(); comecarMissao(); };
// fechar o card de resultado de qualquer jeito (Esc, clique fora) volta ao hangar, a não ser que tenha clicado em "tentar de novo"
$('m-fim').addEventListener('close', () => setTimeout(() => { if (M.ativa && M.fase === 'fim') sairMissao(); }, 0));
for (const [id, d] of [['m-esq', -1], ['m-dir', 1]]) $(id).addEventListener('pointerdown', e => { e.preventDefault(); toqueRCS(d); });
function atualizarMissao(dt) {
  if (Math.abs(cam2.aspect - innerWidth / innerHeight) > 0.001) { cam2.aspect = innerWidth / innerHeight; cam2.updateProjectionMatrix(); }
  const t = LM();
  if (M.fase !== 'fim' || M.fimT < 3) M.t += M.fase === 'fim' ? 0 : dt;
  let tremor = 0;
  if (M.fase === 'alarme') {
    M.a = Math.min(AJ.limite * 0.8, M.a + M.w * dt); tremor = 0.035;
  } else if (M.fase === 'manual') {
    M.tqT -= dt;
    if (M.tqT <= 0) { M.tq = (Math.random() * 2 - 1) * AJ.empurrao + (Math.random() < 0.5 ? -AJ.vies : AJ.vies); M.tqT = 1.5 + Math.random() * 1.5; }
    M.w += M.tq * dt; M.w *= 1 - AJ.amortecer * dt; M.a += M.w * dt;
    if (Math.abs(M.a) > AJ.limite) { M.a = Math.sign(M.a) * AJ.limite; M.w = 0; }
    tremor = 0.012 + Math.min(0.03, Math.abs(M.w) * 0.0012);
    // alvo atual
    if (Math.abs(M.a - ALVOS[M.alvoI]) < AJ.raioAlvo) {
      if (M.hold === 0) dica(t.segure);
      M.hold += dt;
      if (M.hold >= AJ.segurar) {
        document.querySelectorAll('#m-luzes i')[M.alvoI].classList.add('on');
        M.alvoI++; M.hold = 0; bip(990, 0.12, 'sine', 0.07); dica(t.travado);
        if (M.alvoI >= ALVOS.length) { // piloto automático volta
          M.fase = 'ok'; $('m-alerta').textContent = t.restaurado; $('m-alerta').className = 'm-alerta ok';
          $('m-vermelho').classList.remove('on'); luzCabine.color.set('#ffffff');
          $('m-esq').hidden = $('m-dir').hidden = true; dica(t.restaurado); bip(1320, 0.3, 'sine', 0.07);
          fimMissao(true);
        }
      }
    } else if (M.hold > 0) { M.hold = Math.max(0, M.hold - dt * 2); if (M.hold === 0) dica(t.dica_manual); }
    // pânico: muitos toques em pouco tempo
    M.toques = M.toques.filter(x => M.t - x < 1.2);
    if (M.toques.length >= 5 && M.avisoT <= 0) { dica(t.panico, true); M.avisoT = 1.6; }
    if (M.avisoT > 0) { M.avisoT -= dt; if (M.avisoT <= 0) dica(t.dica_manual); }
  } else { // ok / fim: estabiliza
    M.w *= 1 - Math.min(1, dt * 3); M.a += (0 - M.a) * Math.min(1, dt * (M.fase === 'ok' || M.fuel > 0 ? 1.5 : 0)); M.fimT += dt;
    if (M.fuel <= 0) { M.a += M.w * dt; tremor = 0.02; }
  }
  // HUD
  $('m-rcs-bar').style.height = M.fuel + '%'; $('m-rcs-bar').classList.toggle('baixo', M.fuel < 30);
  $('m-rcs-v').textContent = Math.round(M.fuel) + '%';
  $('m-tempo').textContent = M.t.toFixed(1).replace('.', L.codigo === 'pt-BR' ? ',' : '.') + ' s';
  // câmera em primeira pessoa: tremor + olhar com o mouse; o lado de fora gira com a nave
  const tr = reduz ? 0 : tremor;
  cam2.position.set((Math.random() - 0.5) * tr, (Math.random() - 0.5) * tr, 0);
  cam2.rotation.set(-0.12 + M.look.y * 0.18, -M.look.x * 0.35, (Math.random() - 0.5) * tr * 0.6);
  exterior.rotation.z = M.a * Math.PI / 180 * 0.6;
  exterior.userData.terra.rotation.y += dt * 0.02;
  const alarme = M.fase === 'alarme' || M.fase === 'manual' || (M.fase === 'fim' && M.fuel <= 0);
  const pisca = Math.sin(M.t * 10) > 0;
  luzesAlarme.forEach((l, i) => l.visible = alarme ? (pisca ? i % 2 === 0 : i % 2 === 1) : false);
  luzCabine.intensity = alarme ? 0.8 + (pisca ? 0.5 : 0) : 0.9;
  desenharMostrador();
}
// olhar com o mouse dentro da cabine ("guiar a visão")
addEventListener('pointermove', e => { if (!M.ativa) return; M.look.x = (e.clientX / innerWidth - 0.5) * 2; M.look.y = -(e.clientY / innerHeight - 0.5) * 2; });

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
    if (['arrowleft', 'arrowright', ' ', 'enter', 'a', 'd'].includes(k)) e.preventDefault();
    if (e.repeat) return; // segurar a tecla não dispara mais propulsores: cada toque conta
    if (k === 'arrowleft' || k === 'a') toqueRCS(-1);
    else if (k === 'arrowright' || k === 'd') toqueRCS(1);
    else if ((k === ' ' || k === 'enter') && M.fase === 'alarme') desligarAutopiloto();
    return;
  }
  if (k === 'm' && jogando()) { const d = $('map'); d.open ? d.close() : (limparTeclas(), d.showModal()); return; }
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
cvs.addEventListener('pointerdown', e => { arrasto = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY }; cvs.setPointerCapture(e.pointerId); });
cvs.addEventListener('pointermove', e => {
  if (!arrasto || arrasto.id !== e.pointerId) return;
  cam.yaw -= (e.clientX - arrasto.x) * 0.006;
  cam.pitch = Math.max(-0.25, Math.min(1.25, cam.pitch + (e.clientY - arrasto.y) * 0.005));
  arrasto.x = e.clientX; arrasto.y = e.clientY;
});
cvs.addEventListener('pointerup', e => {
  if (!arrasto || arrasto.id !== e.pointerId) return;
  const moveu = Math.hypot(e.clientX - arrasto.sx, e.clientY - arrasto.sy); arrasto = null;
  if (moveu < 6 && !pausado()) clicarMundo(e.clientX, e.clientY);
});
cvs.addEventListener('pointercancel', () => { arrasto = null; });
cvs.addEventListener('wheel', e => { e.preventDefault(); cam.alvoDist = Math.max(6, Math.min(48, cam.alvoDist + e.deltaY * 0.03)); }, { passive: false });
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
$('btn-map').onclick = () => { limparTeclas(); $('map').showModal(); };
$('btn-credits').onclick = () => { limparTeclas(); $('credits').showModal(); };
$('btn-lang').onclick = () => { // troca de idioma: salva posição e recarrega já dentro do jogo
  estado.lang = estado.lang === 'pt' ? 'en' : 'pt'; salvar();
  sessao.set('rr-abrir', 'jogo'); sessao.set('rr-pos', JSON.stringify([P.pos.x, P.pos.y, P.pos.z, cam.yaw]));
  location.reload();
};
document.querySelectorAll('[data-tp]').forEach(b => b.onclick = () => { teleportar(b.dataset.tp); $('map').close(); });
$('missions-toggle').onclick = () => { const m = $('missions'); m.classList.toggle('closed'); $('missions-toggle').setAttribute('aria-expanded', !m.classList.contains('closed')); };
if (innerWidth < 560) { $('missions').classList.add('closed'); $('missions-toggle').setAttribute('aria-expanded', 'false'); }

function jogar(retorno) {
  salvar();
  tagJogador.textContent = nomeJogador();
  desenharTelao(); renderMissoes(); aplicarTextos();
  $('start').classList.add('hide'); document.body.classList.remove('inicio');
  cvs.focus({ preventScroll: true });
  const pos = sessao.get('rr-pos'); sessao.del('rr-pos');
  if (retorno && pos) { try { const [x, y, z, yaw] = JSON.parse(pos); P.pos.set(x, y, z); cam.yaw = yaw; P.rot = yaw + Math.PI; } catch (e) {} }
  else setTimeout(() => { if (!estado.feitas.includes('falar')) falarSistema(toque ? L.msg.chamado_toque : L.msg.chamado); }, 900);
}
tagJogador.textContent = nomeJogador(); desenharTelao(); renderMissoes();

/* ================================================================
   LOOP
   ================================================================ */
let ultimo = performance.now(), tempo = 0;
function quadro(t) {
  const dt = Math.min((t - ultimo) / 1000, 0.05); ultimo = t; tempo += dt;
  if (M.ativa) { atualizarMissao(dt); renderer.render(cena2, cam2); requestAnimationFrame(quadro); return; }
  atualizarElevador(dt); atualizarJogador(dt); atualizarCamera(dt);
  if (jogando()) atualizarZona();
  const dm = P.pos.distanceTo(marcos.position);
  if (dm < 22) { let d = Math.atan2(P.pos.x - marcos.position.x, P.pos.z - marcos.position.z) - marcos.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); marcos.rotation.y += d * Math.min(1, dt * 5); }
  animarBoneco(marcos, 0, dt, false);
  if (marcos.userData.acenando) { marcos.userData.bracoD.rotation.z = 2.6 + Math.sin(tempo * 8) * 0.35; marcos.userData.bracoD.rotation.x = 0; marcos.userData.bracoE.rotation.x = 0; }
  else marcos.userData.bracoD.rotation.z = 0;
  if (fala >= 0 && dm > 26) { fala = -1; balao.style.display = 'none'; marcos.userData.acenando = false; itMarcos.rotulo = L.prompt.conversar; }
  if (!reduz) {
    globo.rotation.y += dt * 0.4; anelGlobo.rotation.z += dt * 0.6;
    const pulso = 1 + Math.sin(tempo * 3) * 0.06;
    totens.forEach(tt => tt.anel.scale.set(pulso, pulso, 1));
    luzEscotilha.visible = Math.sin(tempo * 4) > 0;
  }
  totens.forEach(tt => tt.anel.material = mat(estado.expos.includes(tt.chave) ? '#2fbf71' : VERMELHO, { neon: true }));
  renderer.render(scene, camera);
  naTela(tagJogador, P.pos, 7.4);
  naTela(tagMarcos, marcos.position, 7.6);
  exclamacao.style.display = estado.feitas.includes('falar') || fala >= 0 ? 'none' : 'block';
  if (exclamacao.style.display === 'block') naTela(exclamacao, marcos.position, 10.4 + (reduz ? 0 : Math.sin(tempo * 4) * 0.4));
  if (balao.style.display === 'block') naTela(balao, marcos.position, 8.6);
  if (balaoJog.style.display === 'block') naTela(balaoJog, P.pos, 8.8);
  const alvo = jogando() ? alvoObjetivo() : null;
  const mostraSeta = alvo && alvo.distanceTo(P.pos) >= 9 && fala < 0;
  seta.style.display = mostraSeta ? 'block' : 'none';
  if (mostraSeta) naTela(seta, alvo, reduz ? 0 : Math.sin(tempo * 4) * 0.6);
  atualizarPrompt();
  requestAnimationFrame(quadro);
}
teleportar('recepcao');
requestAnimationFrame(quadro);

// atalhos para apresentação: index.html#lang=pt&g=m&jogar&tp=museu  ·  &expo=atlantis  ·  &missao
const h = new URLSearchParams(location.hash.slice(1));
if (PONTOS[h.get('tp')]) teleportar(h.get('tp'));
if (h.has('missao')) setTimeout(() => { estado.capacete = true; definirCapacete(jogador, true); teleportar('braco'); const m = h.get('missao'); if (m === 'direto' || m === 'manual') { comecarMissao(); if (m === 'manual') desligarAutopiloto(); } else abrirBriefing(); }, 300);
if (L.expos[h.get('expo')]) abrirExpo(h.get('expo'));
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
