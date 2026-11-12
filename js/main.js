'use strict';
document.documentElement.classList.add('js');
const ICONS = {
  "react": "assets/icons/react.svg",
  "typescript": "assets/icons/typescript.svg",
  "javascript": "assets/icons/javascript.svg",
  "html5": "assets/icons/html5.svg",
  "css3": "assets/icons/css3.svg",
  "tailwindcss": "assets/icons/tailwindcss.svg",
  "nodejs": "assets/icons/nodejs.svg",
  "express": "assets/icons/express.svg",
  "mysql": "assets/icons/mysql.svg",
  "postgresql": "assets/icons/postgresql.svg",
  "mongodb": "assets/icons/mongodb.svg",
  "neo4j": "assets/icons/neo4j.svg",
  "python": "assets/icons/python.svg",
  "pandas": "assets/icons/pandas.svg",
  "numpy": "assets/icons/numpy.svg",
  "git": "assets/icons/git.svg",
  "github": "assets/icons/github.svg",
  "docker": "assets/icons/docker.svg",
  "vitejs": "assets/icons/vitejs.svg",
  "vercel": "assets/icons/vercel.svg",
  "c": "assets/icons/c.svg",
  "qt": "assets/icons/qt.svg",
  "polars": "assets/icons/polars.svg",
  "jwt": "assets/icons/jwt.svg",
  "scrum": "assets/icons/scrum.svg",
  "powerbi": "assets/icons/powerbi.svg",
  "etl": "assets/icons/etl.svg",
  "api": "assets/icons/api.svg",
  "bcrypt": "assets/icons/bcrypt.svg",
  "ws": "assets/icons/ws.svg",
  "claude": "assets/icons/claude.svg",
  "copilot": "assets/icons/copilot.svg"
};

document.querySelectorAll('img[data-icon]').forEach(i => { i.src = ICONS[i.dataset.icon]; });
/* one large, partly cropped logo behind a panel */
function addBgLogo(el, key){
  if (!ICONS[key]) return;
  const layer = document.createElement('div'); layer.className = 'bg-logos'; layer.setAttribute('aria-hidden', 'true');
  const img = document.createElement('img'); img.src = ICONS[key]; img.alt = ''; layer.append(img);
  el.prepend(layer);
}
document.querySelectorAll('[data-logo]').forEach(el => addBgLogo(el, el.dataset.logo));


/* tableau-style stacked area with three layouts. Values are invented and labeled as such. */
const VIZ = {
  years: [2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025],
  series: [
    { es:'Web', en:'Web', color:'#2F5BD8', v:[30,34,38,41,45,47,58,62,64,66,70,72] },
    { es:'App móvil', en:'Mobile app', color:'#7A3EE6', v:[4,7,12,18,26,34,52,63,72,80,90,98] },
    { es:'Tienda física', en:'In store', color:'#D9468F', v:[48,47,46,45,43,40,18,24,30,31,32,32] },
    { es:'Redes sociales', en:'Social media', color:'#F08A3C', v:[6,9,13,17,22,25,33,38,41,45,48,52] },
    { es:'Correo', en:'Email', color:'#F2C14E', v:[18,18,17,17,16,15,17,16,15,14,14,13] },
    { es:'Referidos', en:'Referrals', color:'#5AA9F0', v:[8,9,10,10,12,13,14,17,19,22,24,27] },
  ],
};
const V = { mode:'stack', cur:null, anim:null, lang:'es', W:900, H:380, L:56, R:16, T:14, B:34 };
function vizLayout(mode){
  const n = VIZ.years.length, S = VIZ.series;
  const tot = VIZ.years.map((_, i) => S.reduce((a, s) => a + s.v[i], 0));
  const maxTot = Math.max(...tot);
  return S.map((s, k) => VIZ.years.map((_, i) => {
    let base = 0; for (let j = 0; j < k; j++) base += S[j].v[i];
    if (mode === 'expand') return [base / tot[i], (base + s.v[i]) / tot[i]];
    if (mode === 'stream') { const off = (maxTot - tot[i]) / 2; return [(base + off) / maxTot, (base + s.v[i] + off) / maxTot]; }
    return [base / maxTot, (base + s.v[i]) / maxTot];
  }));
}
function smooth(pts){
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++){
    const p0 = pts[i-1] || pts[i], p1 = pts[i], p2 = pts[i+1], p3 = pts[i+2] || p2;
    const c1 = [p1[0] + (p2[0]-p0[0])/6, p1[1] + (p2[1]-p0[1])/6], c2 = [p2[0] - (p3[0]-p1[0])/6, p2[1] - (p3[1]-p1[1])/6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}
function vizDraw(lay){
  const svg = document.getElementById('viz-svg'), ns = 'http://www.w3.org/2000/svg';
  const { W, H, L, R, T, B } = V, pw = W - L - R, ph = H - T - B, n = VIZ.years.length;
  const X = i => L + (pw * i) / (n - 1), Y = f => T + ph * (1 - f);
  let g = svg.querySelector('#v-areas');
  if (!g){
    svg.innerHTML = '';
    const grid = document.createElementNS(ns, 'g'); grid.id = 'v-grid'; svg.append(grid);
    g = document.createElementNS(ns, 'g'); g.id = 'v-areas'; svg.append(g);
    VIZ.series.forEach((s, k) => {
      const path = document.createElementNS(ns, 'path'); path.setAttribute('class', 'series'); path.setAttribute('fill', s.color); path.dataset.k = k;
      path.addEventListener('mouseenter', () => vizFocus(k)); path.addEventListener('mouseleave', () => vizFocus(null));
      path.addEventListener('mousemove', e => vizTip(e, k)); g.append(path);
    });
    const xa = document.createElementNS(ns, 'g'); xa.id = 'v-x'; svg.append(xa);
    VIZ.years.forEach((yr, i) => { if (i % 2 && i !== n - 1) return; const t = document.createElementNS(ns, 'text'); t.setAttribute('class', 'axl'); t.setAttribute('x', X(i)); t.setAttribute('y', H - 10); t.setAttribute('text-anchor', i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'); t.textContent = yr; xa.append(t); });
  }
  lay.forEach((band, k) => {
    const top = band.map((b, i) => [X(i), Y(b[1])]), bot = band.map((b, i) => [X(i), Y(b[0])]).reverse();
    const d = smooth(top) + ' L' + smooth(bot).slice(1) + ' Z';
    g.children[k].setAttribute('d', d);
  });
}
function vizGrid(mode){
  if (!document.getElementById('v-grid')) vizDraw(vizLayout(mode));
  const grid = document.getElementById('v-grid'), ns = 'http://www.w3.org/2000/svg'; grid.innerHTML = '';
  const { W, H, L, R, T, B } = V, ph = H - T - B;
  const maxTot = Math.max(...VIZ.years.map((_, i) => VIZ.series.reduce((a, s) => a + s.v[i], 0)));
  if (mode === 'stream') return;
  [0, .25, .5, .75, 1].forEach(f => {
    const y = T + ph * (1 - f);
    const ln = document.createElementNS(ns, 'line'); ln.setAttribute('class', 'gridl'); ln.setAttribute('x1', L); ln.setAttribute('x2', W - R); ln.setAttribute('y1', y); ln.setAttribute('y2', y); grid.append(ln);
    const t = document.createElementNS(ns, 'text'); t.setAttribute('class', 'axl'); t.setAttribute('x', L - 8); t.setAttribute('y', y + 4); t.setAttribute('text-anchor', 'end');
    t.textContent = mode === 'expand' ? Math.round(f * 100) + '%' : Math.round(f * maxTot) + 'k'; grid.append(t);
  });
}
function vizSet(mode, animate){
  const target = vizLayout(mode), from = V.cur || target.map(b => b.map(() => [0, 0]));
  V.mode = mode; vizGrid(mode);
  document.querySelectorAll('.viz-modes button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === mode));
  cancelAnimationFrame(V.anim);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!animate || reduce){ V.cur = target; vizDraw(target); return; }
  const t0 = performance.now(), dur = 900, ease = t => 1 - Math.pow(1 - t, 3);
  const step = now => {
    const t = ease(Math.min(1, (now - t0) / dur));
    V.cur = target.map((band, k) => band.map((b, i) => [from[k][i][0] + (b[0] - from[k][i][0]) * t, from[k][i][1] + (b[1] - from[k][i][1]) * t]));
    vizDraw(V.cur);
    if (t < 1) V.anim = requestAnimationFrame(step);
  };
  V.anim = requestAnimationFrame(step);
}
function vizFocus(k){
  const viz = document.getElementById('viz');
  viz.classList.toggle('focus', k !== null);
  viz.querySelectorAll('.series').forEach((p, i) => p.classList.toggle('on', i === k));
  viz.querySelectorAll('.viz-legend button').forEach((b, i) => b.classList.toggle('on', i === k));
  if (k === null) document.getElementById('viz-tip').hidden = true;
}
function vizTip(e, k){
  const tip = document.getElementById('viz-tip'), plot = tip.parentElement.getBoundingClientRect();
  const svg = document.getElementById('viz-svg').getBoundingClientRect();
  const n = VIZ.years.length, rel = (e.clientX - svg.left) / svg.width * V.W;
  const i = Math.max(0, Math.min(n - 1, Math.round((rel - V.L) / (V.W - V.L - V.R) * (n - 1))));
  const s = VIZ.series[k];
  tip.textContent = `${s[V.lang]} · ${VIZ.years[i]} · ${s.v[i]}k`;
  tip.style.left = (e.clientX - plot.left) + 'px'; tip.style.top = (e.clientY - plot.top) + 'px'; tip.hidden = false;
}
function vizLegend(lang){
  V.lang = lang;
  const box = document.getElementById('viz-legend'); box.innerHTML = '';
  VIZ.series.forEach((s, k) => {
    const b = document.createElement('button'); b.type = 'button';
    const i = document.createElement('i'); i.style.background = s.color;
    b.append(i, document.createTextNode(s[lang]));
    b.addEventListener('mouseenter', () => vizFocus(k)); b.addEventListener('mouseleave', () => vizFocus(null));
    b.addEventListener('focus', () => vizFocus(k)); b.addEventListener('blur', () => vizFocus(null));
    box.append(b);
  });
}
document.querySelectorAll('.viz-modes button').forEach(b => b.addEventListener('click', () => vizSet(b.dataset.mode, true)));
vizSet('stack', false);

const GROUPS = [
  { id:'g-front', logo:'react', es:['Frontend','Lo que el usuario ve y usa en pantalla'], en:['Frontend','What users see and use on screen'], items:[
    ['react','React','Biblioteca para construir interfaces','Library for building user interfaces'],
    ['typescript','TypeScript','JavaScript con tipos, ayuda a evitar errores','JavaScript with types, helps prevent bugs'],
    ['javascript','JavaScript','Lenguaje base de la web','The core language of the web'],
    ['html5','HTML5','Estructura de las páginas','Page structure'],
    ['css3','CSS3','Diseño y estilos','Layout and styling'],
    ['tailwindcss','Tailwind CSS','Estilos rápidos y consistentes','Fast, consistent styling'],
    ['vitejs','Vite','Herramienta para compilar y servir el proyecto','Build tool and dev server'],
  ]},
  { id:'g-back', logo:'nodejs', es:['Backend','La lógica del servidor: usuarios, permisos y datos'], en:['Backend','Server logic: users, permissions and data'], items:[
    ['nodejs','Node.js','JavaScript del lado del servidor','JavaScript on the server'],
    ['express','Express','Framework para crear APIs','Framework for building APIs'],
    ['api','APIs REST','Comunicación entre la aplicación y el servidor','How the app talks to the server'],
    ['jwt','JWT','Inicio de sesión seguro','Secure login'],
    ['bcrypt','bcrypt','Cifrado de contraseñas','Password hashing'],
    ['ws','WebSockets','Funciones en tiempo real (multijugador)','Real-time features (multiplayer)'],
  ]},
  { id:'g-db', logo:'postgresql', wide:true, es:['Bases de datos','Dónde se guarda y se consulta la información'], en:['Databases','Where information is stored and queried'], items:[
    ['mysql','MySQL','Base de datos relacional (SQL)','Relational database (SQL)'],
    ['postgresql','PostgreSQL','Base de datos relacional (SQL)','Relational database (SQL)'],
    ['mongodb','MongoDB','Base de datos de documentos (NoSQL)','Document database (NoSQL)'],
    ['neo4j','Neo4j','Base de datos de grafos','Graph database'],
  ]},
  { id:'g-data', logo:'python', es:['Datos y BI','Análisis de información y reportes'], en:['Data & BI','Data analysis and reporting'], items:[
    ['python','Python','Lenguaje para análisis y automatización','Language for analysis and automation'],
    ['pandas','Pandas','Limpieza y análisis de tablas','Cleaning and analyzing tables'],
    ['numpy','NumPy','Cálculo numérico','Numerical computing'],
    ['polars','Polars','Análisis de datos rápido','Fast data analysis'],
    ['powerbi','Power BI','Tableros y reportes','Dashboards and reports'],
    ['etl','Data Warehouse y ETL','Unir datos de varias fuentes para hacer reportes','Combining data from several sources for reporting'],
    ['qt','PyQt6','Aplicaciones de escritorio con Python','Desktop apps with Python'],
  ]},
  { id:'g-tools', logo:'git', es:['Herramientas y forma de trabajo','Cómo organizo y publico el código'], en:['Tools & workflow','How I organize and ship code'], items:[
    ['git','Git','Control de versiones (capacité al equipo en su uso)','Version control (I trained the team on it)'],
    ['github','GitHub','Repositorios y revisión de código','Repositories and code review'],
    ['docker','Docker','Entornos de desarrollo','Development environments'],
    ['vercel','Vercel','Publicación de aplicaciones web','Hosting web apps'],
    ['scrum','Scrum','Trabajo organizado por sprints','Work organized in sprints'],
    ['c','C','Lenguaje de programación','Programming language'],
  ]},
];

function renderTech(lang){
  const root = document.getElementById('tech-groups'), jump = document.getElementById('jump');
  root.innerHTML = ''; jump.innerHTML = '';
  GROUPS.forEach(g => {
    const [title, sub] = g[lang];
    const a = document.createElement('a'); a.href = '#' + g.id; const ic = document.createElement('img'); ic.src = ICONS[g.logo]; ic.alt = ''; a.append(ic, document.createTextNode(title)); jump.append(a);
    const box = document.createElement('div'); box.className = 'cat' + (g.wide ? ' wide' : ''); box.id = g.id;
    const head = document.createElement('div'); head.className = 'group-head';
    const gi = document.createElement('span'); gi.className = 'gi'; const gimg = document.createElement('img'); gimg.src = ICONS[g.logo]; gimg.alt = ''; gi.append(gimg);
    const tw = document.createElement('div');
    const h = document.createElement('h3'); h.textContent = title;
    const s = document.createElement('span'); s.textContent = sub;
    tw.append(h, s); head.append(gi, tw);
    const ul = document.createElement('ul'); ul.className = 'tech';
    g.items.forEach(([key, name, es, en]) => {
      const li = document.createElement('li');
      const logo = document.createElement('span'); logo.className = 'logo';
      const img = document.createElement('img'); img.src = ICONS[key]; img.alt = ''; logo.append(img);
      const txt = document.createElement('div');
      const n = document.createElement('span'); n.className = 'name'; n.textContent = name;
      const w = document.createElement('span'); w.className = 'what'; w.textContent = lang === 'en' ? en : es;
      txt.append(n, w);
      li.append(logo, txt); ul.append(li);
    });
    box.append(head, ul); addBgLogo(box, g.logo); root.append(box);
  });
}

const EN = {
  nav_home:"Home", nav_projects:"Projects", nav_exp:"Experience", nav_about:"About", nav_skills:"Technologies", nav_contact:"Contact",
  t_light:"Light", t_dark:"Dark",
  headline:"Full Stack Developer · Data Science student",
  lede:"For two years I built a web platform that is now in production. I worked on every part of it: the interface, the API, login, real-time features and the database. I'm currently studying Data Science at ESCOM, where I work with ETL, Python and Power BI.",
  cta_projects:"See projects",
  f1:"years as a Full Stack developer at DENKO", f2:"people on the Logus team, where I was the lead developer", f3:"English level. Native Spanish", f4:"was my age when I started programming, with Java",
  h_projects:"Projects", l_projects:"Live and working",
  logus_kind:"DENKO · 2023–2025", tag_prod:"In production",
  logus_desc:"A game-based brain-training web app. It has four areas (memory, logic, reading and analysis), several game modes, a store and user profiles. I was the lead developer.",
  logus_1:"Built the interface with React 18, TypeScript and Tailwind: navigation, modals, settings, a carousel and audio.",
  logus_2:"Built the API with Node.js and Express, with JWT login, bcrypt password hashing and protected routes.",
  logus_3:"Implemented real-time multiplayer with WebSockets so several users can play at the same time.",
  logus_4:"Used MySQL and PostgreSQL for data, Docker for environments and Render to host the backend.",
  see_code:"View the code on GitHub", see_demo:"Try the demo", see_repos:"View repositories",
  dana_kind:"Personal project", tag_demo:"Demo available",
  dana_desc:"A tool for cleaning Excel and CSV files. Users upload a file with errors and get it back in order. Everything runs in the browser, so the file is never sent to a server.",
  dana_1:"Finds empty cells, duplicate rows, extra spaces, and numbers or dates stored as text.",
  dana_2:"When a date is ambiguous or a value looks out of range, it flags it without changing it. The user decides what to fix.",
  dana_3:"Processes files in the background with Web Workers so the page doesn't freeze on large files. Exports to CSV or Excel with a change log.",
  dana_4:"Free and Pro plans with Stripe payments, Vercel functions and automated tests with Vitest.",
  dana_private:"The code is private. I'm happy to walk through it in an interview.",
  data_title:"Data & BI", data_kind:"IPN-ESCOM · 2025 to date", tag_school:"Academic",
  data_desc:"Projects from my Data Science degree.",
  data_1:"Data warehouse design with dimensional models and ETL processes for reporting.",
  data_2:"NoSQL databases: MongoDB for documents and Neo4j for graphs.",
  data_3:"Data analysis with Python (Pandas, NumPy, Polars) and SQL, plus Power BI dashboards.",
  vz_title:"Sample dashboard: users by channel", vz_note:"Made-up data, for illustration only", vm_stack:"Stacked", vm_stream:"Stream", vm_expand:"Proportional", fab:"Contact",
  h_exp:"Experience", job_title:"Full Stack Developer",
  job_1:"Lead developer of Logus.",
  job_2:"Coordinated project planning with Scrum for two years: backlog, sprints, reviews and KPI tracking.",
  job_3:"Trained the team on Git and GitHub: branches, pull requests and code review before merging.",
  job_4:"Worked on every layer of the product: interface, API, real-time features and database.",
  h_about:"About me",
  about_1:"I started programming at 15 with Java. I still learn the same way: I pick a language and build a real project with it.",
  about_2:"I like working with a team and keeping processes organized. When a task keeps repeating, I look for a way to automate it.",
  d_edu:"Education", d_edu_v:"B.S. in Data Science, IPN-ESCOM (in progress)",
  d_lang:"Languages", d_lang_v:"Native Spanish · English C1",
  d_loc:"Location", d_loc_v:"Mexico City", d_mode:"Work mode", d_mode_v:"On-site, hybrid or remote",
  h_skills:"Technologies",
  ai_badge:"Exploring", ai_title:"Building with Artificial Intelligence", ai_lede:"I'm exploring new ways to build software with AI. I already use it every day in my work, and now I want to take it further by building it into the applications I make.", ai_have:"What I already do", ai_h1:"I code with AI assistants to write, review and debug code faster.", ai_h2:"I generate tests and documentation with AI support and review every result.", ai_h3:"I use AI to analyze data and prepare reports with Python and SQL.", ai_next:"What I'm exploring", ai_n1:"Integrating language models into web apps through APIs.", ai_n2:"Automating repetitive tasks with AI agents.", ai_n3:"Combining data science and AI to find patterns and make predictions.",
  h_soft:"Soft skills", nav_soft:"Skills", sk_team:"Teamwork", sk_team_p:"Two years collaborating on a six-person team at DENKO.", sk_lead:"Technical leadership", sk_lead_p:"Lead developer of Logus, guiding product decisions.", sk_teach:"Training others", sk_teach_p:"Taught the team Git and GitHub and standardized our workflow.", sk_plan:"Organization & planning", sk_plan_p:"Ran sprints, backlog and KPI tracking with Scrum.", sk_comm:"Bilingual communication", sk_comm_p:"English C1 and native Spanish, comfortable on remote teams.", sk_learn:"Self-driven learning", sk_learn_p:"Coding since 15, and I learn by building real projects.", sk_solve:"Problem solving", sk_solve_p:"When a task keeps repeating, I find a way to automate it.", sk_adapt:"Adaptability", sk_adapt_p:"I move between frontend, backend and data as the project needs.",
  c_eyebrow:"Contact", c_title:"Have a project or an opening?", c_title2:"Let's talk.",
  c_sub:"I reply quickly. Email is best, but you can also call me or message me on WhatsApp.",
  c_phone:"Phone", copy:"Copy"
};
const ES = {};
document.querySelectorAll('[data-i18n]').forEach(el => { ES[el.dataset.i18n] = el.textContent; });
const store = { get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }, set(k,v){ try { localStorage.setItem(k,v); } catch(e){} } };

function setLang(lang){
  const dict = lang === 'en' ? EN : ES;
  document.querySelectorAll('[data-i18n]').forEach(el => { const t = dict[el.dataset.i18n]; if (t) el.textContent = t; });
  document.documentElement.lang = lang;
  document.getElementById('btn-es').setAttribute('aria-pressed', lang === 'es');
  document.getElementById('btn-en').setAttribute('aria-pressed', lang === 'en');
  renderTech(lang); vizLegend(lang); markReveal();
  store.set('lang', lang);
  requestAnimationFrame(moveIndicator);
}
function currentTheme(){
  const t = document.documentElement.getAttribute('data-theme');
  if (t === 'light' || t === 'dark') return t;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function paintThemeButtons(){
  const t = currentTheme();
  document.getElementById('th-light').setAttribute('aria-pressed', t === 'light');
  document.getElementById('th-dark').setAttribute('aria-pressed', t === 'dark');
}
function setTheme(t, btn){
  if (t === currentTheme() && document.documentElement.getAttribute('data-theme')) return;
  const apply = () => { document.documentElement.setAttribute('data-theme', t); store.set('theme', t); paintThemeButtons(); };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { apply(); return; }
  if (document.startViewTransition && btn) {
    const r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    try {
      const vt = document.startViewTransition(apply);
      vt.ready.then(() => document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 750, easing: 'cubic-bezier(.2,.7,.2,1)', pseudoElement: '::view-transition-new(root)' }
      )).catch(() => {});
      return;
    } catch (e) {}
  }
  document.documentElement.classList.add('theme-fade');
  apply();
  setTimeout(() => document.documentElement.classList.remove('theme-fade'), 650);
}

document.getElementById('btn-es').addEventListener('click', () => setLang('es'));
document.getElementById('btn-en').addEventListener('click', () => setLang('en'));
document.getElementById('th-light').addEventListener('click', e => setTheme('light', e.currentTarget));
document.getElementById('th-dark').addEventListener('click', e => setTheme('dark', e.currentTarget));
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintThemeButtons);

/* navbar: sliding pill on the current section, scroll progress, shadow, back-to-top */
const nav = document.getElementById('nav'), ind = document.getElementById('ind');
const links = [...nav.querySelectorAll('a')];
const targets = links.map(a => document.querySelector(a.getAttribute('href')));
let current = links[0];
function moveIndicator(){
  if (!current) return;
  ind.style.width = current.offsetWidth + 'px';
  ind.style.transform = `translateX(${current.offsetLeft}px)`;
  ind.style.opacity = 1;
}
function setActive(a){
  if (current === a) return;
  links.forEach(l => { l.classList.toggle('active', l === a); if (l === a) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); });
  current = a; moveIndicator();
  [...document.getElementById('mlinks').children].forEach((m, i) => m.classList.toggle('active', links[i] === a));
  if (nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
}
links[0].classList.add('active');
function onScroll(){
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  document.getElementById('progress').style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  document.getElementById('topbar').classList.toggle('scrolled', y > 8);
  document.getElementById('to-top').hidden = y < 600;
  const probe = y + innerHeight * 0.35;
  let idx = 0;
  targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top + y <= probe) idx = i; });
  if (y + innerHeight >= document.documentElement.scrollHeight - 4) idx = targets.length - 1;
  setActive(links[idx]);
  document.getElementById('fab').classList.toggle('here', idx === targets.length - 1);
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', moveIndicator);
links.forEach(a => a.addEventListener('click', () => setActive(a)));

/* hamburger menu for narrow screens */
const mbtn = document.getElementById('menu-btn'), mnav = document.getElementById('mnav'), mlinks = document.getElementById('mlinks');
function buildMenu(){
  mlinks.innerHTML = '';
  links.forEach((a, i) => {
    const m = document.createElement('a'); m.href = a.getAttribute('href'); m.textContent = a.textContent;
    m.style.animationDelay = (i * 35) + 'ms';
    m.classList.toggle('active', a === current);
    m.addEventListener('click', () => { setActive(a); toggleMenu(false); });
    mlinks.append(m);
  });
}
function toggleMenu(open){
  if (open === undefined) open = mbtn.getAttribute('aria-expanded') !== 'true';
  if (open) buildMenu();
  mbtn.setAttribute('aria-expanded', open);
  mbtn.setAttribute('aria-label', open ? (document.documentElement.lang === 'en' ? 'Close menu' : 'Cerrar menú') : (document.documentElement.lang === 'en' ? 'Open menu' : 'Abrir menú'));
  mnav.classList.toggle('open', open);
}
mbtn.addEventListener('click', () => toggleMenu());
addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });
document.addEventListener('click', e => { if (mnav.classList.contains('open') && !mnav.contains(e.target) && !mbtn.contains(e.target)) toggleMenu(false); });
/* on phones, theme and language controls live inside the menu */
const tools = document.querySelector('.top .tools'), toolsHome = tools.parentElement, mtools = document.getElementById('mtools');
const small = matchMedia('(max-width:560px)');
function placeTools(){ if (small.matches) { if (tools.parentElement !== mtools) mtools.append(tools); } else if (tools.parentElement !== toolsHome) toolsHome.insertBefore(tools, mbtn); }
small.addEventListener('change', placeTools); placeTools();
matchMedia('(min-width:1061px)').addEventListener('change', e => { if (e.matches) toggleMenu(false); });
const hind = document.getElementById('hind');
links.forEach(a => a.addEventListener('mouseenter', () => {
  hind.style.width = a.offsetWidth + 'px'; hind.style.transform = `translateX(${a.offsetLeft}px)`;
  hind.classList.toggle('on', a !== current);
}));
nav.addEventListener('mouseleave', () => hind.classList.remove('on'));
document.getElementById('to-top').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

/* fade text blocks in as they scroll into view */
const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }) : null;
const REVEAL = '.hero h1, .hero .role, .lede, .cta, .facts, .sec-head, .project h3, .project .kind, .project .tag, .project p.desc, .project li, .stack, .plinks, .viz, .job .when, .job h3, .job .org, .job li, .about p, .about dl, .jump, .group-head, .tech li, .soft-card, .ai-head, .ai-lede, .ai-cols > div, .ai-tools, .contact .label, .contact h2, .contact .sub, .row';
function markReveal(){
  document.querySelectorAll(REVEAL).forEach(el => {
    if (el.classList.contains('reveal')) return;
    el.classList.add('reveal');
    const sib = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
    el.style.transitionDelay = Math.min(sib, 6) * 60 + 'ms';
    if (!io || el.getBoundingClientRect().top < innerHeight) requestAnimationFrame(() => el.classList.add('in'));
    else io.observe(el);
  });
}
const savedTheme = store.get('theme'); if (savedTheme === 'light' || savedTheme === 'dark') document.documentElement.setAttribute('data-theme', savedTheme);
paintThemeButtons();
setLang(store.get('lang') === 'en' ? 'en' : 'es');
onScroll();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);

document.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', () => {
    const done = () => { const old = btn.textContent; btn.textContent = document.documentElement.lang === 'en' ? 'Copied' : 'Copiado'; setTimeout(() => btn.textContent = old, 1400); };
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(btn.previousElementSibling); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    if (navigator.clipboard) navigator.clipboard.writeText(btn.dataset.copy).then(done, fallback); else fallback();
  });
});
