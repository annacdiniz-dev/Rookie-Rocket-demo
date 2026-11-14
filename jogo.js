/* =====================================================================
   ROOKIE ROCKET · demo local em 3D (three.js r128, sem servidor)
   Visual inspirado em jogos de blocos: peças com "studs", personagens
   R6 de blocos, balões de fala, ProximityPrompts e conquistas.

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
const SAVE = 'rookie-rocket-v2';
const estado = { nome: '', feitas: [], expos: [] };
try {
  const s = JSON.parse(localStorage.getItem(SAVE) || '{}');
  if (typeof s.nome === 'string') estado.nome = s.nome.slice(0, 20);
  if (Array.isArray(s.feitas)) estado.feitas = s.feitas.filter(x => typeof x === 'string');
  if (Array.isArray(s.expos)) estado.expos = s.expos.filter(x => typeof x === 'string' && DADOS.exposicoes[x]);
} catch (e) { /* segue sem salvar */ }
function salvar() { try { localStorage.setItem(SAVE, JSON.stringify(estado)); } catch (e) {} }
const nomeJogador = () => estado.nome || 'Estagiário';

/* ---------------- render ---------------- */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('game').appendChild(renderer.domElement);
renderer.domElement.tabIndex = 0;

const scene = new THREE.Scene();
const CEU = new THREE.Color('#8fcdfc');
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

function redimensionar() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', redimensionar);
redimensionar();

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
  const k = cor + (o.neon ? 'N' : '') + (o.vidro ? 'V' : '') + (o.stud ? 'S' : '');
  if (cacheMat.has(k)) return cacheMat.get(k);
  let m;
  if (o.neon) m = new THREE.MeshBasicMaterial({ color: cor });
  else if (o.vidro) m = new THREE.MeshLambertMaterial({ color: cor, transparent: true, opacity: 0.25, depthWrite: false });
  else if (o.stud) m = new THREE.MeshLambertMaterial({ color: cor, map: texStud });
  else m = new THREE.MeshLambertMaterial({ color: cor });
  cacheMat.set(k, m);
  return m;
}

/* ---------------- mundo físico ---------------- */
const solidos = [];      // caixas de colisão {min, max, off}
const bloqueiaCam = [];  // malhas que a câmera não atravessa
const clicaveis = [];    // malhas que respondem a clique

function colisor(x0, x1, y0, y1, z0, z1) {
  const s = { min: new THREE.Vector3(x0, y0, z0), max: new THREE.Vector3(x1, y1, z1), off: false };
  solidos.push(s);
  return s;
}

// Bloco alinhado aos eixos: cria malha + colisão (padrão)
function bloco(x0, x1, y0, y1, z0, z1, cor, o = {}) {
  const w = x1 - x0, h = y1 - y0, d = z1 - z0;
  const geo = new THREE.BoxGeometry(w, h, d);
  let material;
  if (o.stud) {
    const uv = geo.attributes.uv;               // face +y = vértices 8..11
    for (let i = 8; i < 12; i++) uv.setXY(i, uv.getX(i) * w / 2, uv.getY(i) * d / 2);
    const lado = mat(o.lado || cor);
    material = [lado, lado, mat(cor, { stud: true }), lado, lado, lado];
  } else material = mat(cor, o);
  const m = new THREE.Mesh(geo, material);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = o.sombra === true || (o.sombra !== false && !o.neon && !o.vidro && h < 30 && w < 40 && d < 40);
  m.receiveShadow = !o.neon;
  scene.add(m);
  if (o.solido !== false) {
    m.userData.solido = colisor(x0, x1, y0, y1, z0, z1);
    if (o.cam !== false) bloqueiaCam.push(m);
  }
  return m;
}

function cil(rTopo, rBase, h, cor, x, y, z, o = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTopo, rBase, h, o.seg || 28), o.material || mat(cor, o));
  m.position.set(x, y + h / 2, z);
  m.castShadow = !o.neon; m.receiveShadow = true;
  (o.pai || scene).add(m);
  return m;
}

/* ---------------- placas com texto ---------------- */
function quebrar(g, texto, larg) {
  const palavras = String(texto).split(' '); const linhas = []; let atual = '';
  for (const p of palavras) {
    const t = atual ? atual + ' ' + p : p;
    if (g.measureText(t).width > larg && atual) { linhas.push(atual); atual = p; } else atual = t;
  }
  if (atual) linhas.push(atual);
  return linhas;
}
function canvasPlaca(w, h, desenhar) {
  const ch = 256, cw = Math.min(2048, Math.round(ch * w / h));
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  desenhar(c.getContext('2d'), cw, ch);
  return c;
}
// texto: [{t, cor, tam, peso}] centralizado
function placa(linhas, w, h, o = {}) {
  const c = canvasPlaca(w, h, (g, cw, ch) => {
    g.fillStyle = o.fundo || '#0b3d91'; g.fillRect(0, 0, cw, ch);
    if (o.faixa) { g.fillStyle = o.faixa; g.fillRect(0, ch - 18, cw, 18); }
    if (o.borda) { g.strokeStyle = o.borda; g.lineWidth = 10; g.strokeRect(5, 5, cw - 10, ch - 10); }
    const tot = linhas.reduce((a, l) => a + (l.tam || 60) * 1.15, 0);
    let y = (ch - tot) / 2;
    g.textAlign = 'center'; g.textBaseline = 'top';
    for (const l of linhas) {
      let tam = l.tam || 60;
      g.font = `${l.peso || 900} ${tam}px "Segoe UI", system-ui, sans-serif`;
      while (g.measureText(l.t).width > cw * 0.92 && tam > 10) { tam -= 2; g.font = `${l.peso || 900} ${tam}px "Segoe UI", system-ui, sans-serif`; }
      g.fillStyle = l.cor || '#fff';
      g.fillText(l.t, cw / 2, y + ((l.tam || 60) - tam) / 2);
      y += (l.tam || 60) * 1.15;
    }
  });
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: o.dupla ? THREE.DoubleSide : THREE.FrontSide }));
  if (o.pos) m.position.set(...o.pos);
  if (o.rot) m.rotation.y = o.rot;
  scene.add(m);
  m.userData.canvas = c; m.userData.tex = tex;
  return m;
}

/* ---------------- personagens R6 ---------------- */
function rosto(pele) {
  const c = document.createElement('canvas'); c.width = 384; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = pele; g.fillRect(0, 0, 384, 128);
  g.fillStyle = '#1b1b1b';
  g.beginPath(); g.ellipse(176, 54, 7, 12, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(208, 54, 7, 12, 0, 0, 7); g.fill();
  g.strokeStyle = '#1b1b1b'; g.lineWidth = 6; g.lineCap = 'round';
  g.beginPath(); g.arc(192, 66, 22, 0.22 * Math.PI, 0.78 * Math.PI); g.stroke();
  const t = new THREE.CanvasTexture(c);
  return t;
}
function bandeiraBR() {
  const c = document.createElement('canvas'); c.width = 70; c.height = 50;
  const g = c.getContext('2d');
  g.fillStyle = '#009c3b'; g.fillRect(0, 0, 70, 50);
  g.fillStyle = '#ffdf00'; g.beginPath(); g.moveTo(35, 5); g.lineTo(65, 25); g.lineTo(35, 45); g.lineTo(5, 25); g.fill();
  g.fillStyle = '#002776'; g.beginPath(); g.arc(35, 25, 11, 0, 7); g.fill();
  return new THREE.CanvasTexture(c);
}
const TEX_BR = bandeiraBR();

function boneco(cfg) {
  const g = new THREE.Group();
  const caixa = (w, h, d, cor, pai, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof cor === 'string' ? mat(cor) : cor);
    m.position.set(x, y, z); m.castShadow = true; pai.add(m); return m;
  };
  const membro = (x, y, cor, corPonta) => {
    const piv = new THREE.Group(); piv.position.set(x, y, 0); g.add(piv);
    caixa(1, 2, 1, cor, piv, 0, -1, 0);
    if (corPonta) caixa(1.02, 0.5, 1.02, corPonta, piv, 0, -1.76, 0);
    return piv;
  };
  const torso = caixa(2, 2, 1, cfg.torso, g, 0, 3, 0);
  const pernaE = membro(-0.5, 2, cfg.calca, cfg.bota);
  const pernaD = membro(0.5, 2, cfg.calca, cfg.bota);
  const bracoE = membro(-1.5, 4, cfg.braco || cfg.torso, cfg.luva);
  const bracoD = membro(1.5, 4, cfg.braco || cfg.torso, cfg.luva);
  const pele = cfg.pele || '#e0ad85';
  const cabeca = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.2, 24, 1, false, Math.PI, Math.PI * 2),
    cfg.estatua ? mat(cfg.torso) : [new THREE.MeshLambertMaterial({ map: rosto(pele) }), mat(pele), mat(pele)]);
  cabeca.position.set(0, 4.62, 0); cabeca.castShadow = true; g.add(cabeca);
  if (cfg.cabelo) {
    caixa(1.32, 0.34, 1.32, cfg.cabelo, g, 0, 5.3, -0.02);
    caixa(1.32, 0.8, 0.3, cfg.cabelo, g, 0, 4.95, -0.52);
  }
  if (cfg.mochila) caixa(1.6, 1.6, 0.6, cfg.mochila, g, 0, 3.1, -0.8);
  if (cfg.patch) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), mat(cfg.patch));
    p.position.set(-0.5, 3.5, 0.51); g.add(p);
  }
  if (cfg.bandeira) {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.53), new THREE.MeshBasicMaterial({ map: TEX_BR }));
    b.position.set(-2.01, 3.4, 0); b.rotation.y = -Math.PI / 2; bracoE.attach(b);
  }
  g.userData = { pernaE, pernaD, bracoE, bracoD, torso, fase: 0 };
  scene.add(g);
  return g;
}
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
  o.raio = o.raio || 8;
  interativos.push(o);
  (o.alvos || []).forEach(m => m.traverse(n => { n.userData.inter = o; clicaveis.push(n); }));
  return o;
}

/* ================================================================
   CONSTRUÇÃO DO MUNDO
   ================================================================ */
const PAREDE_ESP = 1;
// Sala retangular com portas (vãos) nas paredes sul (+z) e norte (-z)
function sala(c) {
  const { x0, x1, z0, z1, h } = c;
  bloco(x0 - 1, x1 + 1, -1, 0, z0 - 1, z1 + 1, c.chao, { stud: true, lado: c.chaoLado || c.chao });
  bloco(x0, x1, h, h + 1, z0, z1, c.teto, { sombra: false });
  bloco(x0 - PAREDE_ESP, x0, 0, h, z0, z1, c.parede, { sombra: false });
  bloco(x1, x1 + PAREDE_ESP, 0, h, z0, z1, c.parede, { sombra: false });
  for (const [lado, z] of [['sul', z1], ['norte', z0 - PAREDE_ESP]]) {
    const vao = c[lado];
    if (c.vidroSul && lado === 'sul') continue;
    if (!vao) { bloco(x0 - 1, x1 + 1, 0, h, z, z + PAREDE_ESP, c.parede, { sombra: false }); continue; }
    bloco(x0 - 1, vao[0], 0, h, z, z + PAREDE_ESP, c.parede, { sombra: false });
    bloco(vao[1], x1 + 1, 0, h, z, z + PAREDE_ESP, c.parede, { sombra: false });
    bloco(vao[0], vao[1], c.portaAlt || 12, h, z, z + PAREDE_ESP, c.parede, { sombra: false });
    // moldura em neon da porta
    const zf = lado === 'sul' ? z - 0.05 : z + PAREDE_ESP + 0.05;
    const zt = lado === 'sul' ? z + PAREDE_ESP + 0.05 : z - 0.05;
    for (const zz of [zf, zt]) {
      bloco(vao[0] - 0.5, vao[0], 0, c.portaAlt || 12, zz - 0.05, zz + 0.05, c.neon || '#5fd4ff', { neon: true, solido: false });
      bloco(vao[1], vao[1] + 0.5, 0, c.portaAlt || 12, zz - 0.05, zz + 0.05, c.neon || '#5fd4ff', { neon: true, solido: false });
      bloco(vao[0] - 0.5, vao[1] + 0.5, (c.portaAlt || 12), (c.portaAlt || 12) + 0.5, zz - 0.05, zz + 0.05, c.neon || '#5fd4ff', { neon: true, solido: false });
    }
  }
  // faixas de parede (rodapé colorido)
  if (c.faixa) {
    bloco(x0 + 0.02, x0 + 0.1, 0, 3, z0, z1, c.faixa, { solido: false, sombra: false });
    bloco(x1 - 0.1, x1 - 0.02, 0, 3, z0, z1, c.faixa, { solido: false, sombra: false });
    if (c.faixa2) {
      bloco(x0 + 0.02, x0 + 0.12, 3, 3.5, z0, z1, c.faixa2, { solido: false, sombra: false, neon: true });
      bloco(x1 - 0.12, x1 - 0.02, 3, 3.5, z0, z1, c.faixa2, { solido: false, sombra: false, neon: true });
    }
  }
  // luminárias de teto
  if (c.luzes) for (let z = z1 - 8; z > z0 + 4; z -= c.luzes)
    bloco(x0 + 6, x1 - 6, h - 0.15, h, z - 0.6, z + 0.6, '#f4fbff', { neon: true, solido: false });
}

function setaChao(x, z, cor, rot = 0) {
  const s = new THREE.Shape();
  s.moveTo(0, 2.2); s.lineTo(-1.8, 0); s.lineTo(-0.7, 0); s.lineTo(-0.7, -2); s.lineTo(0.7, -2); s.lineTo(0.7, 0); s.lineTo(1.8, 0); s.closePath();
  const m = new THREE.Mesh(new THREE.ShapeGeometry(s), mat(cor, { neon: true }));
  m.rotation.x = -Math.PI / 2; m.rotation.z = rot; m.position.set(x, 0.03, z);
  scene.add(m); return m;
}

function anelChao(x, y, z, r, cor) {
  const m = new THREE.Mesh(new THREE.RingGeometry(r - 0.35, r, 40), mat(cor, { neon: true }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.04, z); scene.add(m); return m;
}

// Totem de exposição: tela inclinada + anel no chão + prompt
const totens = [];
function totem(x, z, rot, chave, y = 0) {
  const expo = DADOS.exposicoes[chave];
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rot; scene.add(g);
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.2, 1.3), mat('#16233b')); base.position.y = 1.6; base.castShadow = true; g.add(base);
  const faixa = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.25, 1.32), mat('#ffd23f', { neon: true })); faixa.position.y = 0.5; g.add(faixa);
  const c = canvasPlaca(3.2, 2, (gg, cw, ch) => {
    gg.fillStyle = '#0b3d91'; gg.fillRect(0, 0, cw, ch);
    gg.fillStyle = '#fc3d21'; gg.fillRect(0, 0, cw, 46);
    gg.fillStyle = '#fff'; gg.font = '900 30px "Segoe UI",sans-serif'; gg.textAlign = 'center'; gg.fillText('★ EXPOSIÇÃO ★', cw / 2, 34);
    gg.font = '900 40px "Segoe UI",sans-serif';
    quebrar(gg, expo.titulo, cw - 40).slice(0, 3).forEach((l, i) => gg.fillText(l, cw / 2, 110 + i * 48));
    gg.font = '700 24px "Segoe UI",sans-serif'; gg.fillStyle = '#ffd23f'; gg.fillText('Aperte E para ver', cw / 2, ch - 20);
  });
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }));
  tela.position.set(0, 3.55, 0.25); tela.rotation.x = -0.45; g.add(tela);
  const moldura = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 0.2), mat('#0d1526')); moldura.position.set(0, 3.5, 0.13); moldura.rotation.x = -0.45; g.add(moldura);
  const anel = anelChao(x, y, z, 3, '#ffd23f');
  colisor(x - 1.5, x + 1.5, y, y + 3.2, z - 1.5, z + 1.5);
  const it = interativo({ pos: new THREE.Vector3(x, y + 4.8, z), raio: 8, rotulo: 'Ver exposição', objeto: expo.titulo, acao: () => abrirExpo(chave), alvos: [g], chave });
  totens.push({ g, anel, chave, it });
  return it;
}

/* ---------- RECEPÇÃO ---------- */
const NEON = '#5fd4ff';
sala({ x0: -30, x1: 30, z0: -25, z1: 25, h: 22, chao: '#e9eef5', parede: '#f4f6fa', teto: '#dfe6ef', norte: [-7, 7], vidroSul: true, faixa: '#0b3d91', faixa2: '#fc3d21', luzes: 9, neon: NEON });
// parede sul de vidro com vista para fora
bloco(-31, 31, 0, 22, 25, 25.6, '#bfe6ff', { vidro: true, sombra: false });
for (let x = -30; x <= 30; x += 10) bloco(x - 0.4, x + 0.4, 0, 22, 24.9, 25.7, '#c9d2de', { cam: false });
bloco(-31, 31, 0, 1, 24.9, 25.7, '#c9d2de');
bloco(-31, 31, 21, 22, 24.9, 25.7, '#c9d2de');
// emblema do programa no piso (desenho original)
{
  const c = canvasPlaca(1, 1, (g, cw, ch) => {
    g.clearRect(0, 0, cw, ch);
    g.fillStyle = '#0b3d91'; g.beginPath(); g.arc(cw / 2, ch / 2, ch / 2 - 4, 0, 7); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 8; g.stroke();
    g.fillStyle = '#fff'; for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 40 + (i * 37) % 70; g.fillRect(cw / 2 + Math.cos(a) * r, ch / 2 + Math.sin(a) * r, 5, 5); }
    g.strokeStyle = '#fc3d21'; g.lineWidth = 14; g.beginPath(); g.ellipse(cw / 2, ch / 2, 112, 36, -0.5, 0, 7); g.stroke();
    g.fillStyle = '#ff8a2a'; g.beginPath(); g.moveTo(cw / 2, 52); g.lineTo(cw / 2 + 22, 120); g.lineTo(cw / 2 - 22, 120); g.fill();
    g.fillRect(cw / 2 - 22, 120, 44, 66);
    g.fillStyle = '#fff'; g.font = '900 30px "Segoe UI",sans-serif'; g.textAlign = 'center'; g.fillText('ROOKIE ROCKET', cw / 2, 222);
  });
  const t = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.CircleGeometry(9, 48), new THREE.MeshLambertMaterial({ map: t, transparent: true }));
  m.rotation.x = -Math.PI / 2; m.position.set(0, 0.03, 8); m.receiveShadow = true; scene.add(m);
}
// balcão da recepção
bloco(-11, 11, 0, 3.4, -12, -9, '#ffffff');
bloco(-11.05, 11.05, 1, 1.6, -9.05, -8.95, '#0b3d91', { solido: false });
bloco(-11.05, 11.05, 1.6, 1.85, -9.08, -8.92, '#fc3d21', { solido: false, neon: true });
bloco(-11.3, 11.3, 3.4, 3.8, -12.3, -8.7, '#c8d3e2');
placa([{ t: 'RECEPÇÃO', tam: 70 }, { t: 'PROGRAMA ESTAGIÁRIO ASTRONAUTA', tam: 36, cor: '#ffd23f', peso: 800 }], 12, 2.6, { pos: [0, 2.2, -8.9], fundo: '#0b3d91' });
// globo holográfico
const globo = new THREE.Mesh(new THREE.SphereGeometry(2.2, 24, 16), new THREE.MeshLambertMaterial({ color: '#3d8de0', emissive: '#0b3d91', emissiveIntensity: 0.35 }));
globo.position.set(-7, 6.8, -10.5); globo.castShadow = true; scene.add(globo);
const continente = new THREE.Mesh(new THREE.SphereGeometry(2.25, 12, 8, 0, 2, 0.6, 1.6), mat('#3ad07a'));
globo.add(continente);
const anelGlobo = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.12, 8, 48), mat('#ffd23f', { neon: true }));
anelGlobo.position.copy(globo.position); anelGlobo.rotation.x = 1.2; scene.add(anelGlobo);
cil(0.8, 1.1, 2.3, '#c8d3e2', -7, 3.8, -10.5);
// telão com o nome do jogador
const telao = placa([{ t: 'BEM-VINDO(A) A BORDO', tam: 50 }], 26, 7.5, { pos: [0, 16.4, -24.4] });
function desenharTelao() {
  const c = telao.userData.canvas, g = c.getContext('2d'), cw = c.width, ch = c.height;
  const grad = g.createLinearGradient(0, 0, cw, ch); grad.addColorStop(0, '#0b3d91'); grad.addColorStop(1, '#1556c6');
  g.fillStyle = grad; g.fillRect(0, 0, cw, ch);
  g.fillStyle = '#fc3d21'; g.fillRect(0, ch - 20, cw, 20);
  g.fillStyle = '#ffd23f'; g.font = '800 30px "Segoe UI",sans-serif'; g.textAlign = 'center';
  g.fillText('PRIMEIRO DIA · PROGRAMA ESTAGIÁRIO ASTRONAUTA', cw / 2, 58);
  let tam = 92; const txt = 'BEM-VINDO(A), ' + nomeJogador().toUpperCase() + '!';
  do { g.font = `900 ${tam}px "Segoe UI",sans-serif`; tam -= 4; } while (g.measureText(txt).width > cw * 0.9);
  g.fillStyle = '#fff'; g.fillText(txt, cw / 2, 158);
  g.font = '700 28px "Segoe UI",sans-serif'; g.fillStyle = '#bcd6ff'; g.fillText('↓ Corredor para o museu do Kennedy Space Center', cw / 2, 212);
  telao.userData.tex.needsUpdate = true;
}
bloco(-13.6, 13.6, 12.4, 20.4, -24.95, -24.55, '#0d1526', { solido: false });
// decoração: plantas, bancos, foguete-modelo
function planta(x, z) { bloco(x - 1, x + 1, 0, 1.6, z - 1, z + 1, '#f4f6fa'); bloco(x - 0.9, x + 0.9, 1.6, 4, z - 0.9, z + 0.9, '#3ab35e', { solido: false }); bloco(x - 0.6, x + 0.6, 4, 5.2, z - 0.6, z + 0.6, '#4fd27a', { solido: false }); }
planta(-27, -22); planta(27, -22); planta(-27, 21); planta(27, 21);
function banco(x, z, rot) { const w = rot ? 1.6 : 6, d = rot ? 6 : 1.6; bloco(x - w / 2, x + w / 2, 0, 1.5, z - d / 2, z + d / 2, '#1556c6', { stud: true }); }
banco(-22, 6, true); banco(22, 6, true); banco(-22, 15, true); banco(22, 15, true);
// pôsteres
placa([{ t: 'SEU PRIMEIRO', tam: 44 }, { t: 'DIA NO ESPAÇO', tam: 56, cor: '#ff8a2a' }], 10, 6, { pos: [-29.4, 10, -6], rot: Math.PI / 2, fundo: '#101a30', borda: '#fff' });
placa([{ t: 'CURIOSIDADE', tam: 50 }, { t: 'É COMBUSTÍVEL', tam: 50, cor: '#5fd4ff' }], 10, 6, { pos: [29.4, 10, -6], rot: -Math.PI / 2, fundo: '#101a30', borda: '#fff' });
totem(-18, -4, Math.PI / 4, 'pontes');
totem(18, -4, -Math.PI / 4, 'recepcao');

/* ---------- área externa (vista pela janela) ---------- */
bloco(-400, 400, -2, -1.02, 26, 420, '#68c06e', { stud: true, cam: false, solido: false, sombra: false });
bloco(-6, 6, -1.01, -0.98, 26, 420, '#6c7686', { solido: false, sombra: false });
{ // torre e foguete distantes
  const X = 70, Z = 210;
  bloco(X - 12, X + 12, -1, 2, Z - 12, Z + 12, '#9aa5b5', { solido: false });
  bloco(X + 7, X + 11, 2, 70, Z - 2, Z + 2, '#d64532', { solido: false, sombra: false });
  for (let y = 8; y < 70; y += 8) bloco(X + 1, X + 7, y, y + 1, Z - 1, Z + 1, '#d64532', { solido: false, sombra: false });
  cil(3.5, 3.5, 48, '#f2f2f2', X - 2, 2, Z); cil(1.4, 3.5, 9, '#f2f2f2', X - 2, 50, Z);
  cil(1.4, 1.4, 34, '#f4f4f4', X - 7, 2, Z); cil(1.4, 1.4, 34, '#f4f4f4', X + 3, 2, Z);
}

/* ---------- CORREDOR 1 → MUSEU ---------- */
function corredor(z0, z1, cor, textoA, textoB) {
  bloco(-8, 8, -1, 0, z0, z1, '#cfd8e4', { stud: true });
  bloco(-7, 7, 14, 15, z0, z1, '#1a2742', { sombra: false });
  bloco(-8, -7, 0, 14, z0, z1, '#22314f', { sombra: false });
  bloco(7, 8, 0, 14, z0, z1, '#22314f', { sombra: false });
  bloco(-6.95, -6.85, 0.6, 1, z0, z1, cor, { neon: true, solido: false });
  bloco(6.85, 6.95, 0.6, 1, z0, z1, cor, { neon: true, solido: false });
  bloco(-6.95, -6.85, 12.5, 12.9, z0, z1, cor, { neon: true, solido: false });
  bloco(6.85, 6.95, 12.5, 12.9, z0, z1, cor, { neon: true, solido: false });
  for (let z = z1 - 4; z > z0 + 2; z -= 7) setaChao(0, z, cor);
  placa(textoA, 9, 5, { pos: [-6.8, 7, (z0 + z1) / 2], rot: Math.PI / 2, fundo: '#0b3d91', borda: cor });
  placa(textoB, 9, 5, { pos: [6.8, 7, (z0 + z1) / 2], rot: -Math.PI / 2, fundo: '#0b3d91', borda: cor });
}
corredor(-55, -25, '#5fd4ff',
  [{ t: 'PRÓXIMA PARADA', tam: 36, cor: '#ffd23f' }, { t: 'MUSEU KSC', tam: 70 }, { t: 'Kennedy Space Center · Flórida', tam: 30, peso: 700 }],
  [{ t: 'VISITOR', tam: 54 }, { t: 'COMPLEX', tam: 54 }, { t: '→ siga as setas', tam: 34, cor: '#5fd4ff', peso: 700 }]);

/* ---------- MUSEU: KENNEDY SPACE CENTER VISITOR COMPLEX ---------- */
sala({ x0: -50, x1: 50, z0: -145, z1: -55, h: 45, chao: '#d9dee6', parede: '#1d2a44', teto: '#141e33', sul: [-7, 7], norte: [-7, 7], faixa: '#0b3d91', faixa2: '#ffd23f', luzes: 12, neon: '#ffd23f' });
bloco(-6, 6, 0, 0.06, -145, -55, '#0b3d91', { solido: false, sombra: false }); // tapete central
for (let z = -62; z > -142; z -= 10) setaChao(0, z, '#ffd23f');
placa([{ t: 'KENNEDY SPACE CENTER', tam: 64 }, { t: 'VISITOR COMPLEX · FLÓRIDA', tam: 40, cor: '#ffd23f' }, { t: 'museu representado no jogo · explore as 6 exposições ★', tam: 24, cor: '#bcd6ff', peso: 600 }], 24, 7, { pos: [0, 21, -62], fundo: '#0b3d91', faixa: '#fc3d21', dupla: true });
for (const x of [-11, 11]) bloco(x - 0.12, x + 0.12, 24.5, 45, -62.12, -61.88, '#30384a', { solido: false });
placa([{ t: '↩ RECEPÇÃO', tam: 70 }], 10, 2.4, { pos: [0, 13.6, -55.6], rot: Math.PI, fundo: '#0b3d91' });
placa([{ t: '→ HANGAR DA NAVE', tam: 70 }, { t: 'Corredor de embarque', tam: 32, cor: '#ffd23f', peso: 700 }], 20, 5, { pos: [0, 15.5, -144.4], fundo: '#fc3d21' });
// faixas temáticas
placa([{ t: 'HEROES AND LEGENDS', tam: 60 }, { t: 'Mercury · Gemini · Apollo', tam: 34, cor: '#ffd23f', peso: 700 }], 26, 5.5, { pos: [-49.4, 30, -100], rot: Math.PI / 2, fundo: '#7a1d14', borda: '#ffd23f' });
placa([{ t: 'SPACE SHUTTLE', tam: 60 }, { t: 'ATLANTIS', tam: 70, cor: '#5fd4ff' }], 24, 7, { pos: [49.4, 30, -110], rot: -Math.PI / 2, fundo: '#0e1424', borda: '#5fd4ff' });
placa([{ t: 'APOLLO / SATURN V CENTER', tam: 56 }], 30, 3.2, { pos: [0, 38, -144.4], fundo: '#101a30', borda: '#fff' });

// 1) Rocket Garden
bloco(-47, -26, 0, 0.6, -84, -60, '#4cb860', { stud: true, lado: '#3d8f4d' });
function fogueteSimples(x, z, alt, r, corpo, faixa, nariz) {
  bloco(x - r * 1.6, x + r * 1.6, 0.6, 1.4, z - r * 1.6, z + r * 1.6, '#8a94a6');
  cil(r, r, alt, corpo, x, 1.4, z);
  for (let y = 4; y < alt - 2; y += 7) cil(r + 0.05, r + 0.05, 1.2, faixa, x, 1.4 + y, z);
  cil(0.1, r, r * 3, nariz, x, 1.4 + alt, z);
  aletas(x, z, r, 1.4, 4.4, faixa);
  colisor(x - r - 0.3, x + r + 0.3, 0, alt, z - r - 0.3, z + r + 0.3);
}
// 4 aletas em cruz ao redor de um cilindro
function aletas(x, z, r, y0, y1, cor) {
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const cx = x + dx * (r + 0.6), cz = z + dz * (r + 0.6);
    const w = dx ? 1.4 : 0.3, d = dz ? 1.4 : 0.3;
    bloco(cx - w / 2, cx + w / 2, y0, y1, cz - d / 2, cz + d / 2, cor, { solido: false });
  }
}
fogueteSimples(-42, -66, 24, 1.6, '#e9edf2', '#20242c', '#20242c');
fogueteSimples(-34, -64, 18, 1.2, '#f4f4f4', '#d64532', '#d64532');
fogueteSimples(-42, -78, 30, 1.9, '#c7ccd4', '#3a4a66', '#e9edf2');
fogueteSimples(-31, -76, 21, 1.4, '#f2f2f2', '#1556c6', '#f2f2f2');
// réplica de cápsula para entrar
cil(0.9, 2.1, 2.6, '#2b3140', -36.5, 0.6, -71.5);
colisor(-38.3, -34.7, 0, 3.2, -73.3, -69.7);
placa([{ t: 'ROCKET GARDEN', tam: 70 }], 12, 2.2, { pos: [-36.5, 2.2, -59.6], fundo: '#2d6b3b' });
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
placa([{ t: 'SIGMA 7', tam: 80 }, { t: 'Mercury · 1962', tam: 40, cor: '#ffd23f', peso: 700 }], 7, 2.4, { pos: [-36, 2.6, -94.9], fundo: '#7a1d14' });
totem(-27, -98, Math.PI / 2, 'sigma7');

// 3) Controle de Missão Mercury: consoles + mapa-múndi estilizado
{
  const c = canvasPlaca(26, 10, (g, cw, ch) => {
    g.fillStyle = '#0a2a4a'; g.fillRect(0, 0, cw, ch);
    g.strokeStyle = 'rgba(120,200,255,.25)'; g.lineWidth = 1;
    for (let x = 0; x < cw; x += cw / 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, ch); g.stroke(); }
    for (let y = 0; y < ch; y += ch / 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(cw, y); g.stroke(); }
    g.fillStyle = '#2f7d55'; // continentes muito simplificados
    const blob = pts => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x * cw, y * ch) : g.moveTo(x * cw, y * ch)); g.fill(); };
    blob([[.05, .2], [.2, .12], [.3, .25], [.25, .45], [.18, .5], [.1, .38]]);
    blob([[.22, .52], [.3, .55], [.33, .7], [.27, .92], [.23, .7]]);
    blob([[.45, .15], [.58, .12], [.62, .3], [.52, .35], [.46, .28]]);
    blob([[.47, .38], [.58, .38], [.6, .6], [.53, .8], [.48, .6]]);
    blob([[.6, .14], [.88, .12], [.92, .35], [.75, .45], [.62, .32]]);
    blob([[.8, .65], [.9, .63], [.92, .78], [.82, .8]]);
    g.strokeStyle = '#ffd23f'; g.lineWidth = 4;
    for (let k = 0; k < 3; k++) { g.beginPath(); for (let x = 0; x <= cw; x += 8) { const y = ch / 2 + Math.sin(x / cw * Math.PI * 2 + k * 1.1) * ch * 0.3; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    g.fillStyle = '#fc3d21'; for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(((i * 0.083) + 0.04) * cw, ch / 2 + Math.sin(i * 0.52 * 2) * ch * 0.3, 7, 0, 7); g.fill(); }
    g.fillStyle = '#fff'; g.font = '900 34px "Segoe UI",sans-serif'; g.fillText('MERCURY CONTROL · MAPA DE RASTREAMENTO (estilizado)', 20, 42);
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

// 4) Hall da Fama: parede de placas + estátua
{
  const c = canvasPlaca(22, 9, (g, cw, ch) => {
    g.fillStyle = '#2a1d10'; g.fillRect(0, 0, cw, ch);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 12; k++) {
      const x = 30 + k * (cw - 60) / 12, y = 40 + r * 52;
      g.fillStyle = '#c9a246'; g.fillRect(x, y, (cw - 60) / 12 - 14, 40);
      g.fillStyle = '#7a5a1c'; g.fillRect(x + 8, y + 10, (cw - 60) / 12 - 30, 6); g.fillRect(x + 8, y + 22, (cw - 60) / 12 - 40, 5);
    }
    g.fillStyle = '#ffd23f'; g.font = '900 30px "Segoe UI",sans-serif'; g.textAlign = 'center'; g.fillText('U.S. ASTRONAUT HALL OF FAME', cw / 2, 28);
  });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(22, 9), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(c) }));
  p.position.set(49.4, 8, -70); p.rotation.y = -Math.PI / 2; scene.add(p);
  bloco(34, 40, 0, 1.6, -73, -67, '#b9bec8', { stud: true });
  const est = boneco({ torso: '#9aa1ad', calca: '#9aa1ad', estatua: true });
  est.position.set(37, 1.6, -70); est.rotation.y = -Math.PI / 2; est.scale.setScalar(1.35);
  est.userData.bracoD.rotation.x = -0.4;
  placa([{ t: 'ESTÁTUA DE ALAN SHEPARD', tam: 46 }, { t: 'representação', tam: 30, cor: '#ffd23f', peso: 600 }], 6, 1.4, { pos: [33.9, 0.9, -70], rot: -Math.PI / 2, fundo: '#2a1d10', dupla: true });
}
totem(26, -70, -Math.PI / 2, 'halldafama');

// 5) Atlantis: erguido e inclinado 43,21° para bombordo, portas abertas
const atlantis = new THREE.Group();
{
  const branco = mat('#f3f4f6'), preto = mat('#1f2329');
  const brancoD = new THREE.MeshLambertMaterial({ color: '#f3f4f6', side: THREE.DoubleSide });
  const pretoD = new THREE.MeshLambertMaterial({ color: '#1f2329', side: THREE.DoubleSide });
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; atlantis.add(o); return o; };
  add(new THREE.BoxGeometry(4.2, 3.6, 22), branco, 0, 0, 0);
  add(new THREE.BoxGeometry(4.25, 0.5, 22.4), preto, 0, -1.9, 0);
  const nariz = add(new THREE.SphereGeometry(2.1, 18, 12), branco, 0, -0.2, -11); nariz.scale.set(1, 0.9, 2);
  add(new THREE.BoxGeometry(3, 0.8, 1.6), preto, 0, 1.5, -10.6);
  add(new THREE.BoxGeometry(3.6, 0.3, 15), mat('#cfd6dd'), 0, 1.72, 0.5); // compartimento de carga
  const asa = lado => {
    const s = new THREE.Shape();
    s.moveTo(2, -7); s.lineTo(3.6, -3); s.lineTo(11, 7.6); s.lineTo(11, 10.6); s.lineTo(2, 10.6); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: false });
    g.rotateX(Math.PI / 2); if (lado < 0) g.scale(-1, 1, 1);
    const w = new THREE.Mesh(g, brancoD); w.position.set(0, -1.3, 0); w.castShadow = true; atlantis.add(w);
    const wb = new THREE.Mesh(g, pretoD); wb.position.set(0, -1.85, 0); atlantis.add(wb);
  };
  asa(1); asa(-1);
  const leme = new THREE.Shape(); leme.moveTo(6, 0); leme.lineTo(11, 0); leme.lineTo(11.5, 8); leme.lineTo(10, 8); leme.closePath();
  const lg = new THREE.ExtrudeGeometry(leme, { depth: 0.5, bevelEnabled: false }); lg.rotateY(-Math.PI / 2);
  const lm = new THREE.Mesh(lg, brancoD); lm.position.set(0.25, 1.8, 0); lm.castShadow = true; atlantis.add(lm);
  for (const [x, y] of [[0, 0.8], [-1.1, -0.6], [1.1, -0.6]]) { const e = add(new THREE.CylinderGeometry(0.45, 0.8, 1.6, 14), preto, x, y, 11.8); e.rotation.x = Math.PI / 2; }
  add(new THREE.BoxGeometry(1.4, 1.2, 4), branco, -1.9, 2.1, 9); add(new THREE.BoxGeometry(1.4, 1.2, 4), branco, 1.9, 2.1, 9);
  for (const lado of [1, -1]) { // portas do compartimento abertas
    const piv = new THREE.Group(); piv.position.set(lado * 2.1, 1.8, 0.5); atlantis.add(piv);
    const porta = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.22, 15), mat('#e4ecf3')); porta.position.x = -lado * 1.05; porta.castShadow = true; piv.add(porta);
    const rad = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 14), mat('#a9d3ee')); rad.position.set(-lado * 1.05, 0.14, 0); piv.add(rad);
    piv.rotation.z = -lado * (150 * Math.PI / 180);
  }
  atlantis.rotation.z = 43.21 * Math.PI / 180; // inclinação real citada pela NASA
  atlantis.position.set(30, 14, -112);
  scene.add(atlantis);
  cil(1.4, 2, 10.5, '#4a5568', 30.5, 0, -112);
  bloco(26, 35, 0, 0.8, -117, -107, '#2a3550', { stud: true });
  colisor(28.5, 32.5, 0, 12, -114, -110);
  for (const [x0, x1, z0, z1] of [[16, 46, -128.5, -128], [16, 46, -94, -93.5], [16, 16.5, -128, -94]]) bloco(x0, x1, 0, 2.6, z0, z1, '#ffd23f', { cam: false });
  placa([{ t: 'ATLANTIS', tam: 90 }, { t: 'inclinado 43,21° · portas abertas', tam: 34, cor: '#5fd4ff', peso: 700 }], 9, 2.4, { pos: [16.7, 4, -104], rot: -Math.PI / 2, fundo: '#0e1424', dupla: true });
}
atlantis.traverse(n => { if (n.isMesh) clicaveis.push(n); });
totem(13, -102, -Math.PI / 2, 'atlantis');

// 6) Saturn V suspenso na horizontal
const saturno = new THREE.Group();
{
  const pecas = [ // [rTopo, rBase, alt, cor]
    [4.6, 4.6, 22, '#f4f4f4'], [4.6, 4.6, 2, '#dcdcdc'], [4.6, 4.6, 18, '#f4f4f4'], [3.4, 4.6, 4, '#f4f4f4'],
    [3.4, 3.4, 11, '#f4f4f4'], [3.4, 3.4, 1, '#8a8f99'], [2.0, 3.4, 6, '#e9e9e9'], [2.0, 2.0, 4, '#b8bfc9'], [0.6, 2.0, 3, '#d9dde2']
  ];
  let y = 3;
  for (let i = 0; i < 5; i++) { const a = (i / 4) * Math.PI * 2; const e = cil(0.6, 1.5, 3, '#2a2d33', i === 4 ? 0 : Math.cos(a) * 2.4, 0, i === 4 ? 0 : Math.sin(a) * 2.4, { pai: saturno, seg: 14 }); }
  for (const [rt, rb, h, cor] of pecas) { cil(rt, rb, h, cor, 0, y, 0, { pai: saturno }); y += h; }
  for (const yy of [4, 22, 31]) cil(4.68, 4.68, 1.5, '#1d1d1d', 0, yy, 0, { pai: saturno });
  cil(4.68, 4.68, 1, '#1d1d1d', 0, 49, 0, { pai: saturno });
  cil(0.15, 0.15, 5, '#d64532', 0, y, 0, { pai: saturno }); cil(0.05, 0.5, 1.2, '#d64532', 0, y + 5, 0, { pai: saturno });
  saturno.rotation.z = Math.PI / 2;
  saturno.position.set(42, 27, -134);
  scene.add(saturno);
  for (const x of [-26, 0, 26]) { bloco(x - 0.15, x + 0.15, 32, 45, -134.15, -133.85, '#30384a', { solido: false }); bloco(x - 1, x + 1, 31.4, 32.2, -136, -132, '#30384a', { solido: false }); }
}
saturno.traverse(n => { if (n.isMesh) clicaveis.push(n); });
totem(10, -126, 0, 'saturnv');
// cliques nos objetos grandes também abrem as exposições
interativos.push({ pos: new THREE.Vector3(30, 14, -112), raio: 0, rotulo: '', acao: () => abrirExpo('atlantis'), soClique: true });
atlantis.traverse(n => n.userData.inter = interativos[interativos.length - 1]);
interativos.push({ pos: new THREE.Vector3(0, 27, -134), raio: 0, rotulo: '', acao: () => abrirExpo('saturnv'), soClique: true });
saturno.traverse(n => n.userData.inter = interativos[interativos.length - 1]);

/* ---------- CORREDOR 2 → HANGAR (parede oposta) ---------- */
corredor(-175, -145, '#ff8a2a',
  [{ t: 'CORREDOR DE EMBARQUE', tam: 40, cor: '#ffd23f' }, { t: 'HANGAR 01', tam: 76 }],
  [{ t: 'NAVE RR-01', tam: 64 }, { t: '→ escada e elevador', tam: 34, cor: '#ff8a2a', peso: 700 }]);

/* ---------- HANGAR ---------- */
sala({ x0: -40, x1: 40, z0: -235, z1: -175, h: 60, chao: '#596273', chaoLado: '#3b4250', parede: '#2b3344', teto: '#1c2230', sul: [-7, 7], faixa: '#ffd23f', luzes: 14, neon: '#ff8a2a' });
// portão listrado no fundo
{
  const c = canvasPlaca(40, 30, (g, cw, ch) => {
    g.fillStyle = '#3e4757'; g.fillRect(0, 0, cw, ch);
    for (let x = 0; x < cw; x += 24) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, 0, 4, ch); }
    for (let x = -ch; x < cw; x += 60) { g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(x, ch); g.lineTo(x + 30, ch); g.lineTo(x + 60, ch - 30); g.lineTo(x + 30, ch - 30); g.fill(); }
    g.fillStyle = '#fff'; g.font = '900 60px "Segoe UI",sans-serif'; g.textAlign = 'center'; g.fillText('HANGAR 01', cw / 2, 90);
  });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(c) }));
  p.position.set(0, 15, -234.4); scene.add(p);
}
// faixas de segurança no piso
for (const [x0, x1, z0, z1] of [[-22, 6, -229, -228.4], [-22, 6, -192, -191.4], [-22, -21.4, -229, -191.4], [5.4, 6, -229, -191.4]])
  bloco(x0, x1, 0, 0.05, z0, z1, '#ffd23f', { solido: false, neon: true });
// ponte rolante
bloco(-40, 40, 56, 58, -186, -184, '#d64532', { solido: false });
bloco(-14, -8, 53, 56, -187, -183, '#ffd23f', { solido: false });
// caixotes
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
  const rot = placa([{ t: 'RR-01', tam: 120 }], 5, 2.2, { pos: [x + 0.1, 20, z + 4.05], fundo: '#ff8a2a' });
  nave.attach(rot);
  colisor(x - 8.5, x + 8.5, 1, 35, z - 4.5, z + 4.5);   // foguete + propulsores
  colisor(x - 4.5, x + 4.5, 35, 56, z - 4.5, z + 4.5);  // módulo de serviço + cápsula
}
nave.traverse(n => { if (n.isMesh) clicaveis.push(n); });
interativos.push({ pos: new THREE.Vector3(NAVE.x, 20, NAVE.z), raio: 0, rotulo: '', acao: () => abrirExpo('artemis'), soClique: true });
nave.traverse(n => n.userData.inter = interativos[interativos.length - 1]);
totem(-24, -190, Math.PI / 4, 'artemis');
placa([{ t: 'NAVE DE TREINAMENTO RR-01', tam: 54 }, { t: 'modelo original do jogo · inspirado no SLS + Orion', tam: 30, cor: '#ffd23f', peso: 700 }], 14, 2.6, { pos: [-8, 2.6, -197.9], fundo: '#101a30' });

// Escada (à direita da nave) → plataforma inferior (y=14)
const ESC = { x0: 10, x1: 18, zIni: -182, passo: 2, n: 14 };
for (let i = 0; i < ESC.n; i++) {
  const zA = ESC.zIni - ESC.passo * (i + 1), zB = ESC.zIni - ESC.passo * i;
  bloco(ESC.x0, ESC.x1, i, i + 1, zA, zB, i % 2 ? '#8792a3' : '#9aa5b5', { stud: true, cam: false });
  bloco(ESC.x0, ESC.x1, 0, i, zA, zB, '#3b4250', { solido: false });
}
for (const x of [ESC.x0 - 0.4, ESC.x1]) { // corrimãos
  for (let i = 0; i < ESC.n; i += 2) bloco(x, x + 0.4, i + 1, i + 4, ESC.zIni - ESC.passo * (i + 1) - 0.2, ESC.zIni - ESC.passo * (i + 1) + 0.2, '#ffd23f', { solido: false });
  const corr = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, Math.hypot(ESC.n * ESC.passo, ESC.n)), mat('#ffd23f'));
  corr.position.set(x + 0.2, ESC.n / 2 + 3.6, ESC.zIni - ESC.n * ESC.passo / 2); corr.rotation.x = Math.atan2(ESC.n, ESC.n * ESC.passo); scene.add(corr);
  colisor(x, x + 0.4, 0, ESC.n + 4, ESC.zIni - ESC.n * ESC.passo, ESC.zIni);
}
placa([{ t: 'ESCADA ↑', tam: 80 }, { t: 'plataforma do elevador', tam: 36, cor: '#ffd23f', peso: 700 }], 8, 2.6, { pos: [14, 3.6, -181.7], fundo: '#d64532' });

// Plataforma inferior
bloco(6, 24, 13, 14, -232, -210, '#7e8899', { stud: true });
for (const [x, z] of [[7, -231], [23, -231], [7, -211], [23, -211]]) bloco(x - 0.5, x + 0.5, 0, 13, z - 0.5, z + 0.5, '#3b4250');
bloco(6, 6.4, 14, 17, -232, -210, '#ffd23f');
bloco(18, 24, 14, 17, -210.4, -210, '#ffd23f');
bloco(6, 10, 14, 17, -210.4, -210, '#ffd23f');
bloco(6, 24, 14, 17, -232.4, -232, '#ffd23f');
bloco(23.6, 24, 14, 17, -221, -210, '#ffd23f');
bloco(23.6, 24, 14, 17, -232, -230, '#ffd23f');
// Plataforma superior + braço de acesso à nave
bloco(6, 24, 40, 41, -232, -206, '#7e8899', { stud: true });
for (const [x, z] of [[7, -231], [7, -207], [23, -207]]) bloco(x - 0.5, x + 0.5, x === 7 && z === -231 ? 14 : 0, 40, z - 0.5, z + 0.5, '#3b4250');
bloco(6, 24, 41, 44, -206.4, -206, '#ffd23f');
bloco(6, 24, 41, 44, -232.4, -232, '#ffd23f');
bloco(6, 6.4, 41, 44, -232, -213, '#ffd23f');
bloco(23.6, 24, 41, 44, -221, -206, '#ffd23f');
bloco(23.6, 24, 41, 44, -232, -230, '#ffd23f');
bloco(-3.5, 6, 40, 41, -213, -207, '#a3adbb', { stud: true });
bloco(-3.5, 6, 41, 44, -213.4, -213, '#ffd23f');
bloco(-3.5, 6, 41, 44, -207, -206.6, '#ffd23f');
bloco(-3.5, 6, 46, 46.4, -213.4, -213, '#8792a3', { solido: false });
bloco(-3.5, 6, 46, 46.4, -207, -206.6, '#8792a3', { solido: false });
for (const x of [-3, 5.6]) for (const z of [-213.2, -206.8]) bloco(x - 0.2, x + 0.2, 44, 46, z - 0.2, z + 0.2, '#8792a3', { solido: false });
placa([{ t: 'BRAÇO DE ACESSO', tam: 50 }, { t: 'EMBARQUE · EM BREVE', tam: 40, cor: '#ffd23f' }], 6, 1.8, { pos: [1.2, 45.1, -206.5], fundo: '#d64532', dupla: true });
// escotilha
const escotilha = bloco(-3.9, -3.6, 41, 45, -212, -208, '#2a2d33', { solido: false });
const luzEscotilha = bloco(-3.6, -3.5, 44.4, 44.8, -211.5, -208.5, '#3ad07a', { neon: true, solido: false });
colisor(-4.5, -3.5, 41, 46, -213, -207);
interativo({ pos: new THREE.Vector3(-2.5, 43, -210), raio: 6, rotulo: 'Embarcar', objeto: 'Escotilha da RR-01', acao: () => avisar('🚧 Embarque na nave: disponível na próxima versão do jogo no Roblox!'), alvos: [escotilha] });

// Elevador
const ELEV = { x0: 24, x1: 32, z0: -230, z1: -222, baixo: 14, cima: 41, h: 14, alvo: 14, mov: false };
bloco(24, 33, 14, 50, -231, -230, '#3b4250', { sombra: false });
bloco(24, 33, 14, 50, -222, -221, '#3b4250', { sombra: false });
bloco(32, 33, 14, 50, -230, -222, '#bfe6ff', { vidro: true });
bloco(24, 33, 50, 51, -231, -221, '#ffd23f');
for (const z of [-230.6, -221.4]) bloco(23.5, 24, 14, 50, z - 0.4, z + 0.4, '#ffd23f', { solido: false });
const cabine = new THREE.Group(); scene.add(cabine);
{
  const piso = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, 8), [mat('#c9d2de'), mat('#c9d2de'), mat('#e9eef5', { stud: true }), mat('#c9d2de'), mat('#c9d2de'), mat('#c9d2de')]);
  const uv = piso.geometry.attributes.uv; for (let i = 8; i < 12; i++) uv.setXY(i, uv.getX(i) * 4, uv.getY(i) * 4);
  piso.position.y = -0.3; piso.receiveShadow = true; cabine.add(piso);
  const teto = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 8), mat('#ffd23f')); teto.position.y = 8; cabine.add(teto);
  const fundo = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, 8), mat('#2b3344')); fundo.position.set(3.85, 4, 0); cabine.add(fundo);
  const painel = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2, 1.4), mat('#16233b')); painel.position.set(3.6, 4, -2.6); cabine.add(painel);
  for (const [y, c] of [[4.5, '#3ad07a'], [3.6, '#fc3d21']]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.5), mat(c, { neon: true })); b.position.set(3.45, y, -2.6); cabine.add(b); }
  const luz = new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 1), mat('#f4fbff', { neon: true })); luz.position.y = 7.75; cabine.add(luz);
  cabine.position.set(28, ELEV.h, -226);
}
const elevPiso = colisor(ELEV.x0, ELEV.x1, ELEV.h - 0.6, ELEV.h, ELEV.z0, ELEV.z1);
const elevGrade = colisor(23.4, 24, ELEV.h, ELEV.h + 8, ELEV.z0, ELEV.z1);
const portaBaixo = colisor(23.4, 24, 14, 22, ELEV.z0, ELEV.z1);
const portaCima = colisor(23.4, 24, 41, 49, ELEV.z0, ELEV.z1);
const portaBaixoM = bloco(23.5, 23.9, 14, 22, -230, -222, '#ffd23f', { solido: false });
const portaCimaM = bloco(23.5, 23.9, 41, 49, -230, -222, '#ffd23f', { solido: false });
placa([{ t: 'ELEVADOR', tam: 80 }], 6, 1.4, { pos: [23.3, 23.2, -226], rot: -Math.PI / 2, fundo: '#0b3d91' });
const dentroElev = () => P.pos.x > ELEV.x0 && P.pos.x < ELEV.x1 && P.pos.z > ELEV.z0 && P.pos.z < ELEV.z1 && Math.abs(P.pos.y - ELEV.h) < 1.2;
const itElev = interativo({ pos: new THREE.Vector3(28, 17, -226), raio: 7.5, rotulo: 'Chamar elevador', objeto: 'Elevador', acao: acionarElevador, alvos: [cabine] });
function acionarElevador() {
  if (ELEV.mov) return;
  if (dentroElev()) ELEV.alvo = ELEV.h < 27 ? ELEV.cima : ELEV.baixo;
  else ELEV.alvo = P.pos.y > 30 ? ELEV.cima : ELEV.baixo;
  if (ELEV.alvo === ELEV.h) return;
  ELEV.mov = true;
  falarSistema(ELEV.alvo === ELEV.cima ? '⬆️ Subindo para o braço de acesso…' : '⬇️ Descendo para a plataforma…');
}
function atualizarElevador(dt) {
  if (ELEV.mov) {
    const ant = ELEV.h, v = reduz ? 60 : 6;
    const passo = Math.sign(ELEV.alvo - ELEV.h) * v * dt;
    ELEV.h = Math.abs(ELEV.alvo - ELEV.h) <= Math.abs(passo) ? ELEV.alvo : ELEV.h + passo;
    if (P.noChao && P.chaoSol === elevPiso) P.pos.y += ELEV.h - ant; // carrega o jogador
    if (ELEV.h === ELEV.alvo) ELEV.mov = false;
  }
  elevPiso.min.y = ELEV.h - 0.6; elevPiso.max.y = ELEV.h;
  elevGrade.min.y = ELEV.h; elevGrade.max.y = ELEV.h + 8; elevGrade.off = !ELEV.mov;
  portaBaixo.off = !(ELEV.h !== ELEV.baixo || ELEV.mov) ; portaBaixoM.visible = !portaBaixo.off;
  portaCima.off = !(ELEV.h !== ELEV.cima || ELEV.mov); portaCimaM.visible = !portaCima.off;
  cabine.position.y = ELEV.h;
  itElev.pos.set(28, ELEV.h + 3, -226);
  itElev.rotulo = dentroElev() ? (ELEV.h < 27 ? 'Subir' : 'Descer') : 'Chamar elevador';
  itElev.objeto = ELEV.mov ? 'Em movimento…' : 'Elevador';
}

/* ================================================================
   PERSONAGENS
   ================================================================ */
const jogador = boneco({ torso: '#ff8a2a', calca: '#ff8a2a', bota: '#f4f4f4', luva: '#f4f4f4', pele: '#c98e66', cabelo: '#3b2618', mochila: '#f4f4f4', patch: '#0b3d91' });
const marcos = boneco({ torso: '#1f4fa8', calca: '#1f4fa8', bota: '#1b1b1b', pele: '#d9a37c', cabelo: '#2a2a2a', bandeira: true, patch: '#fc3d21' });
marcos.position.set(0, 0, -4.5);
const visitantes = [
  { b: boneco({ torso: '#3ad07a', calca: '#2b3344', pele: '#8d5a3b', cabelo: '#1b1b1b' }), a: [-12, -66], c: [-12, -118] },
  { b: boneco({ torso: '#c94bd6', calca: '#3a4a66', pele: '#f0c8a0', cabelo: '#d9a441' }), a: [10, -80], c: [-10, -86] },
  { b: boneco({ torso: '#ffd23f', calca: '#1b1b1b', pele: '#b07a55', cabelo: '#4a2c1a' }), a: [12, 14], c: [12, -3] }
];
visitantes.forEach((v, i) => { v.t = i * 2; v.b.position.set(v.a[0], 0, v.a[1]); });

const itMarcos = interativo({ pos: new THREE.Vector3(0, 6.4, -4.5), raio: 10, rotulo: 'Conversar', objeto: 'Marcos Pontes · Guia', acao: conversar, alvos: [marcos] });

/* ---------------- jogador: física estilo blocos ---------------- */
const P = { pos: new THREE.Vector3(0, 0, 16), vy: 0, noChao: true, chaoSol: null, rot: Math.PI, vel: 0 };
const RAIO = 0.9, ALT = 5.2, DEGRAU = 2.2, VEL = 16, PULO = 50, GRAV = 196.2;

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

const teclas = {};
const joy = { x: 0, y: 0 };
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
  if (n > 0.05) {
    const alvo = Math.atan2(dx, dz);
    let d = alvo - P.rot; d = Math.atan2(Math.sin(d), Math.cos(d));
    P.rot += d * Math.min(1, dt * 14);
  }
  const passos = 3;
  for (let i = 0; i < passos; i++) {
    const sx = dx * VEL * dt / passos, sz = dz * VEL * dt / passos;
    if (!bate(P.pos.x + sx, P.pos.z, P.pos.y)) P.pos.x += sx;
    if (!bate(P.pos.x, P.pos.z + sz, P.pos.y)) P.pos.z += sz;
  }
  if (pularPedido && P.noChao && !pausado()) { P.vy = PULO; P.noChao = false; }
  pularPedido = false;
  P.vy -= GRAV * dt;
  const ref = P.pos.y;
  P.pos.y += P.vy * dt;
  const ch = chaoEm(P.pos.x, P.pos.z, ref);
  if (P.pos.y <= ch.h) { P.pos.y = ch.h; P.vy = 0; P.noChao = true; P.chaoSol = ch.sol; }
  else { P.noChao = false; P.chaoSol = null; }
  if (P.pos.y < -40) teleportar('recepcao');
  jogador.position.copy(P.pos);
  jogador.rotation.y = P.rot;
  animarBoneco(jogador, P.vel, dt, !P.noChao);
}

/* ---------------- câmera ---------------- */
const ray = new THREE.Raycaster();
const alvoCam = new THREE.Vector3();
function atualizarCamera(dt) {
  cam.dist += (cam.alvoDist - cam.dist) * Math.min(1, dt * 10);
  alvoCam.set(P.pos.x, P.pos.y + 4.6, P.pos.z);
  const dir = new THREE.Vector3(Math.sin(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), Math.cos(cam.yaw) * Math.cos(cam.pitch));
  ray.set(alvoCam, dir); ray.far = cam.dist;
  const hit = ray.intersectObjects(bloqueiaCam, false)[0];
  const d = hit ? Math.max(1.5, hit.distance - 0.8) : cam.dist;
  camera.position.copy(alvoCam).addScaledVector(dir, d);
  camera.lookAt(alvoCam);
  jogador.visible = d > 2.2;
  sol.position.set(P.pos.x + 40, P.pos.y + 100, P.pos.z + 30);
  sol.target.position.copy(P.pos);
}

/* ================================================================
   INTERFACE DO MUNDO (nomes, balões, prompt, marcador de objetivo)
   ================================================================ */
const ui = $('world-ui');
const el = (cls, html) => { const e = document.createElement('div'); e.className = cls; if (html) e.innerHTML = html; ui.appendChild(e); return e; };
const tagJogador = el('nametag');
const tagMarcos = el('nametag'); tagMarcos.innerHTML = 'Marcos Pontes<small>GUIA DE MISSÃO</small>';
const exclamacao = el('nametag'); exclamacao.style.cssText = 'font-size:40px;color:#ffd23f;text-shadow:0 0 4px #000,0 3px 0 #a07a00';
exclamacao.textContent = '!';
const balao = el('bubble'); balao.style.display = 'none';
const balaoJog = el('bubble'); balaoJog.style.display = 'none';
const prompt = document.createElement('button'); prompt.className = 'prompt'; prompt.style.display = 'none'; ui.appendChild(prompt);
const seta = el('nametag'); seta.style.cssText = 'font-size:34px;color:#ffd23f;text-shadow:0 0 6px #000';
seta.textContent = '▼';

const v3 = new THREE.Vector3();
function naTela(el, pos, dy = 0) {
  v3.copy(pos); v3.y += dy; v3.project(camera);
  if (v3.z > 1 || v3.x < -1.2 || v3.x > 1.2 || v3.y < -1.2 || v3.y > 1.2) { el.style.visibility = 'hidden'; return false; }
  el.style.visibility = 'visible';
  let px = (v3.x + 1) / 2 * innerWidth;
  if (el.classList.contains('bubble')) { const m = el.offsetWidth / 2 + 8; px = Math.max(m, Math.min(innerWidth - m, px)); }
  el.style.left = px + 'px';
  el.style.top = ((1 - v3.y) / 2 * innerHeight) + 'px';
  return true;
}

let fala = -1; // índice da fala do Marcos
function conversar() {
  fala++;
  if (fala >= DADOS.marcos.length) { fala = -1; balao.style.display = 'none'; marcos.userData.acenando = false; return; }
  if (fala === DADOS.marcos.length - 1) concluir('falar');
  balao.innerHTML = '';
  const who = document.createElement('span'); who.className = 'who'; who.textContent = 'MARCOS PONTES';
  const txt = document.createElement('span'); txt.textContent = DADOS.marcos[fala].split('{nome}').join(nomeJogador());
  const nx = document.createElement('span'); nx.className = 'next';
  nx.textContent = fala < DADOS.marcos.length - 1 ? `${fala + 1}/${DADOS.marcos.length} · clique ou E ▶` : 'fala fictícia criada para o jogo · fechar ✕';
  balao.append(who, txt, nx);
  balao.style.display = 'block';
  balao.style.animation = 'none'; void balao.offsetWidth; balao.style.animation = '';
  marcos.userData.acenando = true;
  $('sr').textContent = 'Marcos Pontes diz: ' + txt.textContent;
}
balao.addEventListener('click', conversar);

let tmrSis = 0;
function falarSistema(t) {
  balaoJog.textContent = t; balaoJog.style.display = 'block';
  clearTimeout(tmrSis); tmrSis = setTimeout(() => balaoJog.style.display = 'none', 3200);
  $('sr').textContent = t;
}
const avisar = falarSistema;

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
    prompt.dataset.k = chave;
    prompt.innerHTML = '';
    const kk = document.createElement('span'); kk.className = 'key'; kk.textContent = k;
    const tx = document.createElement('span'); const b = document.createElement('b'); b.textContent = maisPerto.rotulo; const s = document.createElement('small'); s.textContent = maisPerto.objeto || '';
    tx.append(b, s); prompt.append(kk, tx);
  }
  prompt.style.display = 'flex';
  naTela(prompt, maisPerto.pos, 0.8);
}
prompt.addEventListener('click', () => { if (maisPerto) maisPerto.acao(); });

/* ---------------- objetivo atual ---------------- */
const EXPOS_MUSEU = ['jardim', 'sigma7', 'controle', 'halldafama', 'atlantis', 'saturnv'];
function alvoObjetivo() {
  const falta = DADOS.missoes.find(m => !estado.feitas.includes(m.id));
  if (!falta) return null;
  switch (falta.id) {
    case 'falar': return new THREE.Vector3(0, 9.5, -4.5);
    case 'museu': return new THREE.Vector3(0, 6, -40);
    case 'expo': {
      let best = null, bd = Infinity;
      for (const t of totens) if (EXPOS_MUSEU.includes(t.chave) && !estado.expos.includes(t.chave)) {
        const d = t.it.pos.distanceTo(P.pos); if (d < bd) { bd = d; best = t.it.pos; }
      }
      return best && best.clone().setY(best.y + 3);
    }
    case 'hangar': return new THREE.Vector3(0, 6, -160);
    case 'escada': return new THREE.Vector3(14, 6, -183);
    case 'elevador': return new THREE.Vector3(28, ELEV.h + 10, -226);
  }
  return null;
}

/* ================================================================
   MISSÕES, CONQUISTAS E HUD
   ================================================================ */
function renderMissoes() {
  const ol = $('mission-list'); ol.innerHTML = '';
  let marcouAtual = false;
  for (const m of DADOS.missoes) {
    const li = document.createElement('li');
    const ok = estado.feitas.includes(m.id);
    if (ok) li.className = 'ok'; else if (!marcouAtual) { li.className = 'now'; marcouAtual = true; }
    const i = document.createElement('i'); i.textContent = ok ? '✓' : '';
    const t = document.createElement('span'); t.textContent = m.texto;
    if (m.meta) { const s = document.createElement('small'); s.textContent = `${Math.min(contExpos(), m.meta)}/${m.meta} exposições`; t.appendChild(s); }
    li.append(i, t); ol.appendChild(li);
  }
  $('ls-name').textContent = nomeJogador();
  $('ls-expo').textContent = `${contExpos()}/6`;
  $('ls-badges').textContent = estado.feitas.length;
}
const contExpos = () => estado.expos.filter(e => EXPOS_MUSEU.includes(e)).length;
const filaBadge = []; let badgeAtivo = false;
function concluir(id) {
  if (estado.feitas.includes(id)) return;
  estado.feitas.push(id); salvar(); renderMissoes();
  filaBadge.push(DADOS.conquistas[id]); mostrarBadge();
}
function mostrarBadge() {
  if (badgeAtivo || !filaBadge.length) return;
  badgeAtivo = true;
  $('badge-name').textContent = filaBadge.shift();
  $('badge-toast').classList.add('show');
  setTimeout(() => { $('badge-toast').classList.remove('show'); setTimeout(() => { badgeAtivo = false; mostrarBadge(); }, 500); }, 2800);
}

const ZONAS = [
  { id: 'recepcao', teste: z => z > -25, sub: 'AGÊNCIA ROOKIE ROCKET', nome: 'Recepção' },
  { id: 'c1', teste: z => z > -55, sub: 'EM TRÂNSITO', nome: 'Corredor para o museu' },
  { id: 'museu', teste: z => z > -145, sub: 'KENNEDY SPACE CENTER VISITOR COMPLEX', nome: 'Museu' },
  { id: 'c2', teste: z => z > -175, sub: 'EM TRÂNSITO', nome: 'Corredor de embarque' },
  { id: 'hangar', teste: () => true, sub: 'SETOR DE LANÇAMENTO', nome: 'Hangar da nave' }
];
let zonaAtual = null, tmrZona = 0;
function atualizarZona() {
  const z = ZONAS.find(zz => zz.teste(P.pos.z));
  if (z !== zonaAtual) {
    zonaAtual = z;
    $('zone-sub').textContent = z.sub; $('zone-title').textContent = z.nome;
    $('zone-banner').classList.add('show');
    clearTimeout(tmrZona); tmrZona = setTimeout(() => $('zone-banner').classList.remove('show'), 2400);
    $('sr').textContent = z.nome;
    if (z.id === 'museu') concluir('museu');
    if (z.id === 'hangar') concluir('hangar');
  }
  if (z.id === 'hangar' && P.pos.y >= 13.5 && P.noChao) concluir('escada');
  if (P.pos.y >= 40 && P.noChao) concluir('elevador');
}

/* ---------------- card de exposição ---------------- */
function abrirExpo(chave) {
  const e = DADOS.exposicoes[chave];
  if (!estado.expos.includes(chave)) { estado.expos.push(chave); salvar(); }
  if (contExpos() >= 6) concluir('expo');
  renderMissoes();
  $('info-room').textContent = e.sala.toUpperCase();
  $('info-title').textContent = e.titulo;
  const ul = $('info-facts'); ul.innerHTML = '';
  e.fatos.forEach(f => { const li = document.createElement('li'); li.textContent = f; ul.appendChild(li); });
  const th = $('info-thumbs'); th.innerHTML = '';
  const src = $('info-source'); src.innerHTML = '';
  const mostrar = (r, btn) => {
    $('info-img').src = r.foto; $('info-img').alt = e.titulo + ' · foto NASA ' + r.id;
    th.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
  };
  e.registros.forEach((r, i) => {
    if (e.registros.length > 1) {
      const b = document.createElement('button'); b.setAttribute('aria-label', 'Foto ' + (i + 1));
      const im = document.createElement('img'); im.src = r.foto; im.alt = ''; b.appendChild(im);
      b.onclick = () => mostrar(r, b); th.appendChild(b);
    }
    const linha = document.createElement('div');
    const a = document.createElement('a'); a.href = 'https://images.nasa.gov/details/' + encodeURIComponent(r.id); a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = r.id;
    linha.append('Fonte: ' + FONTE_API + ' · ', a, ` · ${r.data.split('-').reverse().join('/')} · Crédito: ${r.credito}`);
    src.appendChild(linha);
  });
  mostrar(e.registros[0], th.querySelector('button'));
  limparTeclas();
  $('info').showModal();
}

/* ---------------- teleporte ---------------- */
const PONTOS = { recepcao: [0, 0, 16, 0], museu: [0, 0, -84, 0], hangar: [2, 0, -192, 0.35], elevador: [16, 14, -220, -Math.PI / 2] };
function teleportar(k) {
  const [x, y, z, yaw] = PONTOS[k];
  P.pos.set(x, y, z); P.vy = 0; cam.yaw = yaw; P.rot = yaw + Math.PI;
}

/* ================================================================
   ENTRADA
   ================================================================ */
const pausado = () => !$('start').classList.contains('hide') || document.querySelector('dialog[open]');
function limparTeclas() { for (const k in teclas) delete teclas[k]; joy.x = joy.y = 0; }

addEventListener('keydown', e => {
  if (e.target.matches('input,textarea')) return;
  const k = e.key.toLowerCase();
  if (k === 'm' && $('start').classList.contains('hide')) { const d = $('map'); d.open ? d.close() : (limparTeclas(), d.showModal()); return; }
  if (pausado()) return;
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  if (k === ' ') pularPedido = true;
  else if (k === 'e' && !e.repeat) { if (fala >= 0 && maisPerto !== itMarcos && P.pos.distanceTo(marcos.position) < 14) conversar(); else if (maisPerto) maisPerto.acao(); }
  else teclas[k] = true;
});
addEventListener('keyup', e => { delete teclas[e.key.toLowerCase()]; });
addEventListener('blur', limparTeclas);

// arrastar para girar a câmera; clique simples interage
const cv = renderer.domElement;
let arrasto = null;
cv.addEventListener('pointerdown', e => {
  arrasto = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY };
  cv.setPointerCapture(e.pointerId);
});
cv.addEventListener('pointermove', e => {
  if (!arrasto || arrasto.id !== e.pointerId) return;
  cam.yaw -= (e.clientX - arrasto.x) * 0.006;
  cam.pitch = Math.max(-0.25, Math.min(1.25, cam.pitch + (e.clientY - arrasto.y) * 0.005));
  arrasto.x = e.clientX; arrasto.y = e.clientY;
});
cv.addEventListener('pointerup', e => {
  if (!arrasto || arrasto.id !== e.pointerId) return;
  const moveu = Math.hypot(e.clientX - arrasto.sx, e.clientY - arrasto.sy);
  arrasto = null;
  if (moveu < 6 && !pausado()) clicarMundo(e.clientX, e.clientY);
});
cv.addEventListener('pointercancel', () => { arrasto = null; });
cv.addEventListener('wheel', e => { e.preventDefault(); cam.alvoDist = Math.max(6, Math.min(48, cam.alvoDist + e.deltaY * 0.03)); }, { passive: false });
cv.addEventListener('contextmenu', e => e.preventDefault());

const mouse = new THREE.Vector2();
function clicarMundo(x, y) {
  mouse.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1);
  ray.setFromCamera(mouse, camera); ray.far = 200;
  const hits = ray.intersectObjects(clicaveis, false);
  for (const h of hits) {
    const it = h.object.userData.inter;
    if (!it) continue;
    if (P.pos.distanceTo(it.pos) > 70) { falarSistema('Chegue mais perto para interagir! 🚶'); return; }
    it.acao(); return;
  }
}

// joystick de toque
{
  const base = $('joystick'), stick = $('stick'); let id = null, cx = 0, cy = 0;
  base.addEventListener('pointerdown', e => { id = e.pointerId; base.setPointerCapture(id); const r = base.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; mover(e); });
  const mover = e => {
    if (e.pointerId !== id) return;
    let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy), max = 50;
    if (d > max) { dx = dx / d * max; dy = dy / d * max; }
    stick.style.transform = `translate(${dx}px,${dy}px)`;
    joy.x = dx / max; joy.y = dy / max;
  };
  base.addEventListener('pointermove', mover);
  const soltar = () => { id = null; joy.x = joy.y = 0; stick.style.transform = ''; };
  base.addEventListener('pointerup', soltar); base.addEventListener('pointercancel', soltar);
  $('jump-btn').addEventListener('pointerdown', e => { e.preventDefault(); pularPedido = true; });
}

// botões / diálogos
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(d => {
  d.addEventListener('click', e => { if (e.target === d) d.close(); });
  d.addEventListener('close', () => { limparTeclas(); cv.focus({ preventScroll: true }); });
});
$('btn-map').onclick = () => { limparTeclas(); $('map').showModal(); };
$('btn-credits').onclick = () => { limparTeclas(); $('credits').showModal(); };
document.querySelectorAll('[data-tp]').forEach(b => b.onclick = () => { teleportar(b.dataset.tp); $('map').close(); });
$('missions-toggle').onclick = () => { const m = $('missions'); m.classList.toggle('closed'); $('missions-toggle').setAttribute('aria-expanded', !m.classList.contains('closed')); };
if (innerWidth < 520) { $('missions').classList.add('closed'); $('missions-toggle').setAttribute('aria-expanded', 'false'); }

// créditos: lista de registros usados
{
  $('cr-challenge').textContent = DADOS.desafio.nome;
  const box = $('cr-list');
  const a0 = document.createElement('a'); a0.href = DADOS.desafio.url; a0.target = '_blank'; a0.rel = 'noopener noreferrer'; a0.textContent = 'Página do desafio';
  const d0 = document.createElement('div'); d0.append(a0); box.appendChild(d0);
  const vistos = new Set();
  Object.values(DADOS.exposicoes).forEach(e => e.registros.forEach(r => {
    if (vistos.has(r.id)) return; vistos.add(r.id);
    const d = document.createElement('div');
    const a = document.createElement('a'); a.href = 'https://images.nasa.gov/details/' + encodeURIComponent(r.id); a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = r.id;
    d.append(a, ` · ${r.credito} · ${e.titulo}`); box.appendChild(d);
  }));
}

// tela inicial
$('name-input').value = estado.nome;
function jogar() {
  estado.nome = $('name-input').value.trim().slice(0, 20); salvar();
  tagJogador.textContent = nomeJogador();
  desenharTelao(); renderMissoes();
  $('start').classList.add('hide');
  cv.focus({ preventScroll: true });
  setTimeout(() => { if (!estado.feitas.includes('falar')) falarSistema('👋 Marcos Pontes quer falar com você! Vá até ele e aperte E.'); }, 900);
}
$('play-btn').onclick = jogar;
$('name-input').addEventListener('keydown', e => { if (e.key === 'Enter') jogar(); });
tagJogador.textContent = nomeJogador();
desenharTelao(); renderMissoes();
setTimeout(() => $('name-input').focus(), 50);

/* ================================================================
   LOOP
   ================================================================ */
let ultimo = performance.now(), tempo = 0;
function quadro(t) {
  const dt = Math.min((t - ultimo) / 1000, 0.05); ultimo = t; tempo += dt;
  atualizarElevador(dt);
  atualizarJogador(dt);
  atualizarCamera(dt);
  if ($('start').classList.contains('hide')) atualizarZona();

  // Marcos olha para o jogador e acena enquanto fala
  const dm = P.pos.distanceTo(marcos.position);
  if (dm < 22) { const alvo = Math.atan2(P.pos.x - marcos.position.x, P.pos.z - marcos.position.z); let d = alvo - marcos.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); marcos.rotation.y += d * Math.min(1, dt * 5); }
  animarBoneco(marcos, 0, dt, false);
  if (marcos.userData.acenando) { marcos.userData.bracoD.rotation.z = 2.6 + Math.sin(tempo * 8) * 0.35; marcos.userData.bracoD.rotation.x = 0; marcos.userData.bracoE.rotation.x = 0; }
  else marcos.userData.bracoD.rotation.z = 0;
  if (fala >= 0 && dm > 26) { fala = -1; balao.style.display = 'none'; marcos.userData.acenando = false; }

  // visitantes passeando
  for (const v of visitantes) {
    v.t += dt * 0.12;
    const f = (Math.sin(v.t) + 1) / 2, vel = Math.abs(Math.cos(v.t));
    const x = v.a[0] + (v.c[0] - v.a[0]) * f, z = v.a[1] + (v.c[1] - v.a[1]) * f;
    const dirZ = Math.cos(v.t) >= 0 ? 1 : -1;
    v.b.rotation.y = Math.atan2((v.c[0] - v.a[0]) * dirZ, (v.c[1] - v.a[1]) * dirZ);
    v.b.position.set(x, 0, z);
    animarBoneco(v.b, vel > 0.2 ? 1 : 0, dt * vel, false);
  }

  if (!reduz) {
    globo.rotation.y += dt * 0.4; anelGlobo.rotation.z += dt * 0.6;
    const pulso = 1 + Math.sin(tempo * 3) * 0.06;
    totens.forEach(tt => tt.anel.scale.set(pulso, pulso, 1));
    luzEscotilha.visible = Math.sin(tempo * 4) > 0;
  }
  totens.forEach(tt => tt.anel.material = mat(estado.expos.includes(tt.chave) ? '#3ad07a' : '#ffd23f', { neon: true }));

  renderer.render(scene, camera);

  // HUD do mundo
  naTela(tagJogador, P.pos, 7.2);
  naTela(tagMarcos, marcos.position, 7.4);
  exclamacao.style.display = estado.feitas.includes('falar') || fala >= 0 ? 'none' : 'block';
  if (exclamacao.style.display === 'block') naTela(exclamacao, marcos.position, 10 + (reduz ? 0 : Math.sin(tempo * 4) * 0.4));
  if (balao.style.display === 'block') naTela(balao, marcos.position, 8.4);
  if (balaoJog.style.display === 'block') naTela(balaoJog, P.pos, 8.6);
  const alvo = $('start').classList.contains('hide') ? alvoObjetivo() : null;
  const mostraSeta = alvo && !(alvo.distanceTo(P.pos) < 9) && !(fala >= 0);
  seta.style.display = mostraSeta ? 'block' : 'none';
  if (mostraSeta) naTela(seta, alvo, reduz ? 0 : Math.sin(tempo * 4) * 0.6);
  atualizarPrompt();

  requestAnimationFrame(quadro);
}
teleportar('recepcao');
// atalhos para apresentação: index.html#jogar&tp=museu  ·  #jogar&expo=atlantis
{
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.has('jogar')) jogar();
  if (PONTOS[h.get('tp')]) teleportar(h.get('tp'));
  if (DADOS.exposicoes[h.get('expo')]) abrirExpo(h.get('expo'));
}
requestAnimationFrame(quadro);
})();
