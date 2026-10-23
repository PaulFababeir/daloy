/* =============================================================
   DALOY · UI prototype logic (vanilla JS, no build step)

   ⚠️  EVERYTHING IN `CONFIG` AND `buildSyntheticHistory()` IS A
   PLACEHOLDER. Replace the coefficients with the trained models'
   output and load the real monthly panels before the demo:
     - dengue: data/processed/dengue_qc_monthly.csv  (YR,MN,DC_QC,RF_NASA,n_weeks)
     - lepto:  data/processed/lepto_manila_monthly.csv (month,lepto,rain_total_mm,n_weeks)
   (file names are suggestions; the team decides the final paths)
   ============================================================= */
'use strict';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON3 = MONTHS.map((m) => m.slice(0, 3));

// Rough monthly rainfall shape used ONLY to make the synthetic history look seasonal.
const RAIN_SHAPE = [20, 14, 18, 28, 120, 260, 400, 430, 360, 210, 130, 70];

const CONFIG = {
  dengue: {
    disease: 'Dengue',
    city: 'Quezon City',
    years: [2010, 2025],
    seed: 11,
    // PLACEHOLDER: log E[cases] = b0 + b1 * z,  z = (log1p(rain) - mu) / sd
    coef: { b0: Math.log(170), b1: 0.42 },
    inputs: [
      "This month's rainfall (mm), as log(1 + rain), standardized",
    ],
  },
  lepto: {
    disease: 'Leptospirosis',
    city: 'Manila',
    years: [2001, 2012],
    seed: 29,
    // PLACEHOLDER stand-in for the gradient-boosting model:
    // weekly rate = exp(a + bc*zc + bp*zp + bs*sin + bcs*cos), cases = rate * n_weeks
    coef: { a: 0.35, bc: 0.38, bp: 0.30, bs: -0.28, bcs: -0.12 },
    inputs: [
      "This month's rainfall (mm), as log(1 + rain)",
      "Last month's rainfall (mm), as log(1 + rain)",
      'Calendar month, as sin(2πm/12) and cos(2πm/12)',
      'Case weeks in the month (4 or 5), to turn the weekly rate into monthly cases',
    ],
  },
};

/* ---------------- Utilities ---------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const fmt = (n) => Math.round(n).toLocaleString('en-PH');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mean = (a) => a.reduce((s, v) => s + v, 0) / (a.length || 1);
const sd = (a) => { const m = mean(a); return Math.sqrt(mean(a.map((v) => (v - m) ** 2))) || 1; };

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(r) {
  const u = Math.max(r(), 1e-9), v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* ---------------- Synthetic history (PLACEHOLDER) ---------------- */
function buildSyntheticHistory(key) {
  const cfg = CONFIG[key];
  const r = mulberry32(cfg.seed);
  const rows = [];
  for (let y = cfg.years[0]; y <= cfg.years[1]; y++) {
    for (let m = 1; m <= 12; m++) {
      const rain = Math.max(0, RAIN_SHAPE[m - 1] * Math.exp(gauss(r) * 0.55));
      rows.push({ year: y, month: m, rain: Math.round(rain * 10) / 10, nWeeks: [5, 4, 4, 4, 5, 4, 5, 4, 4, 5, 4, 5][m - 1] });
    }
  }
  rows.forEach((row, i) => { row.prev = i > 0 ? rows[i - 1].rain : null; });
  const logs = rows.map((d) => Math.log1p(d.rain));
  cfg.mu = mean(logs);
  cfg.sdv = sd(logs);
  const usable = key === 'lepto' ? rows.filter((d) => d.prev !== null) : rows; // first lepto month has no previous rain
  usable.forEach((d) => {
    const expected = predictRaw(key, { rain: d.rain, prev: d.prev, month: d.month, nWeeks: d.nWeeks });
    d.cases = Math.max(0, Math.round(expected * Math.exp(gauss(r) * 0.3)));
  });
  return usable;
}

/* ---------------- Model (PLACEHOLDER math) ---------------- */
function predictRaw(key, inp) {
  const cfg = CONFIG[key];
  const z = (v) => (Math.log1p(Math.max(0, v)) - cfg.mu) / cfg.sdv;
  if (key === 'dengue') {
    return Math.exp(cfg.coef.b0 + cfg.coef.b1 * z(inp.rain));
  }
  const ang = (2 * Math.PI * inp.month) / 12;
  const c = cfg.coef;
  const rate = Math.exp(c.a + c.bc * z(inp.rain) + c.bp * z(inp.prev ?? inp.rain) + c.bs * Math.sin(ang) + c.bcs * Math.cos(ang));
  return Math.max(0, rate * (inp.nWeeks || 4));
}

const HISTORY = { dengue: buildSyntheticHistory('dengue'), lepto: buildSyntheticHistory('lepto') };

/* ---------------- State ---------------- */
const state = {
  disease: 'dengue',
  month: 8,
  rain: 430,
  prev: 400,
  nWeeks: 4,
};

/* ---------------- Derived values ---------------- */
function baselineFor(key, month) {
  // Methodology baseline: average of past years for this calendar month
  return mean(HISTORY[key].filter((d) => d.month === month).map((d) => d.cases));
}
function typicalRain(key, month) {
  const vals = HISTORY[key].filter((d) => d.month === month).map((d) => d.rain).sort((a, b) => a - b);
  return vals[Math.floor(vals.length / 2)] || 0;
}
function levelFor(ratio) {
  if (ratio < 0.8) return { id: 'low', label: 'Below typical' };
  if (ratio <= 1.2) return { id: 'typ', label: 'Typical' };
  if (ratio <= 1.6) return { id: 'up', label: 'Above typical' };
  return { id: 'high', label: 'Well above typical' };
}

/* Most similar past month: nearest neighbour on the model inputs (one proposal for the TBD method) */
function similarMonths(key, inp, k = 4) {
  const cfg = CONFIG[key];
  const z = (v) => (Math.log1p(v) - cfg.mu) / cfg.sdv;
  const feat = (d) => {
    const f = [z(d.rain)];
    if (key === 'lepto') {
      const a = (2 * Math.PI * d.month) / 12;
      f.push(z(d.prev ?? d.rain), Math.sin(a) * 0.8, Math.cos(a) * 0.8);
    }
    return f;
  };
  const q = feat({ rain: inp.rain, prev: inp.prev, month: inp.month });
  return HISTORY[key]
    .map((d) => {
      const f = feat(d);
      const dist = Math.sqrt(f.reduce((s, v, i) => s + (v - q[i]) ** 2, 0));
      return { ...d, dist, sim: Math.round(100 * Math.exp(-dist * 1.2)) };
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, k);
}

/* ---------------- Rendering: predict view ---------------- */
function renderPredict() {
  const key = state.disease;
  const cfg = CONFIG[key];
  document.body.dataset.disease = key;
  $$('.lepto-only').forEach((el) => { el.hidden = key !== 'lepto'; });

  const inp = { rain: state.rain, prev: state.prev, month: state.month, nWeeks: state.nWeeks };
  const pred = predictRaw(key, inp);
  const base = baselineFor(key, state.month);
  const ratio = base > 0 ? pred / base : 1;
  const level = levelFor(ratio);
  const lo = Math.max(0, pred - 1.96 * Math.sqrt(pred));
  const hi = pred + 1.96 * Math.sqrt(pred);
  const mName = MONTHS[state.month - 1];

  $('#kpiKicker').textContent = `Estimated ${cfg.disease.toLowerCase()} cases this month`;
  $('#kpiTitle').textContent = `${cfg.city} · ${mName}`;
  animateNumber($('#kpiValue'), pred);
  $('#kpiRange').textContent = `${fmt(lo)}–${fmt(hi)}`;

  const pill = $('#levelPill');
  pill.textContent = level.label;
  pill.dataset.level = level.id;

  const maxV = Math.max(pred, base) * 1.1 || 1;
  $('#barEst').style.width = `${(pred / maxV) * 100}%`;
  $('#barBase').style.width = `${(base / maxV) * 100}%`;
  $('#valEst').textContent = fmt(pred);
  $('#valBase').textContent = fmt(base);
  $('#baseMonthLbl').textContent = MON3[state.month - 1];

  const pct = Math.round((ratio - 1) * 100);
  const dp = $('#deltaPill');
  dp.textContent = `${pct >= 0 ? '+' : ''}${pct}%`;
  dp.className = `delta-pill ${pct > 20 ? 'up' : pct < -20 ? 'down' : ''}`;
  $('#deltaText').textContent = `vs. the average ${mName} in ${cfg.years[0]}–${cfg.years[1]}`;

  const tRain = typicalRain(key, state.month);
  const rainCmp = state.rain > tRain * 1.15 ? 'more' : state.rain < tRain * 0.85 ? 'less' : 'about the same';
  if (key === 'dengue') {
    $('#whyText').textContent = `${fmt(state.rain)} mm is ${rainCmp === 'about the same' ? 'about the usual' : rainCmp + ' than the usual'} ${mName} rainfall in ${cfg.city} (median ${fmt(tRain)} mm). In the model, more rain in a month goes with more dengue cases that month.`;
    const up = predictRaw(key, { ...inp, rain: state.rain + 100 });
    const eff = Math.round((up / pred - 1) * 100);
    $('#effectText').innerHTML = `At this rainfall level, <strong>each extra 100 mm</strong> adds about <strong>${eff}%</strong> more cases (≈ ${fmt(up - pred)} cases). <em>Demo value; replace with the unpenalized model's exp(β).</em>`;
  } else {
    const tPrev = typicalRain(key, state.month === 1 ? 12 : state.month - 1);
    $('#whyText').textContent = `This month: ${fmt(state.rain)} mm (usual ${fmt(tRain)} mm). Last month: ${fmt(state.prev)} mm (usual ${fmt(tPrev)} mm). Leptospirosis follows heavy rain and flooding by about 2 weeks, so both months count, along with the season.`;
    $('#effectText').innerHTML = `Estimate = predicted weekly rate × <strong>${state.nWeeks}</strong> case weeks.`;
  }

  renderSimilar(key, inp);
  renderScatter(key, inp, pred);
  renderFlood(key);
  renderActions(key, level);
  updateModelInputs(key);
}

function renderSimilar(key, inp) {
  const sims = similarMonths(key, inp);
  const top = sims[0];
  $('#simTitle').textContent = `${MONTHS[top.month - 1]} ${top.year}`;
  $('#simScore').textContent = `${top.sim}%`;
  $('#simRing').style.strokeDashoffset = String(97.4 * (1 - top.sim / 100));
  $('#simRain').textContent = `${fmt(top.rain)} mm`;
  $('#simPrev').textContent = top.prev != null ? `${fmt(top.prev)} mm` : '–';
  $('#simCases').textContent = `${fmt(top.cases)} cases`;
  const sameMonth = top.month === inp.month;
  $('#simNote').textContent = key === 'dengue'
    ? `Closest rainfall in ${CONFIG[key].city}'s record${sameMonth ? ', and the same calendar month' : ''}. What happened then is a real-world check on today's estimate.`
    : `Closest match on this month's rain, last month's rain and season. What happened then is a real-world check on today's estimate.`;
  $('#simOthers').innerHTML = sims.slice(1)
    .map((s) => `<li><span>${MON3[s.month - 1]} ${s.year} · ${fmt(s.rain)} mm</span><span>${fmt(s.cases)} cases</span></li>`)
    .join('');
}

/* ---------------- Charts (hand-rolled SVG) ---------------- */
function niceMax(v) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

function scatterSVG({ points, xMax, yMax, curve, you, sim, xLabel, yLabel, sameMonth }) {
  const W = 720, H = 300, m = { l: 52, r: 18, t: 14, b: 42 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const X = (v) => m.l + (v / xMax) * iw;
  const Y = (v) => m.t + ih - (v / yMax) * ih;
  const ticks = 5;
  let g = '';
  for (let i = 0; i <= ticks; i++) {
    const yv = (yMax / ticks) * i, xv = (xMax / ticks) * i;
    g += `<g class="grid"><line x1="${m.l}" x2="${W - m.r}" y1="${Y(yv)}" y2="${Y(yv)}"/></g>`;
    g += `<g class="axis"><text x="${m.l - 8}" y="${Y(yv) + 4}" text-anchor="end">${fmt(yv)}</text>`;
    g += `<text x="${X(xv)}" y="${H - m.b + 18}" text-anchor="middle">${fmt(xv)}</text></g>`;
  }
  g += `<g class="axis"><line x1="${m.l}" x2="${W - m.r}" y1="${Y(0)}" y2="${Y(0)}"/></g>`;
  g += `<text class="axis-title" x="${m.l + iw / 2}" y="${H - 4}" text-anchor="middle">${esc(xLabel)}</text>`;
  g += `<text class="axis-title" transform="translate(13 ${m.t + ih / 2}) rotate(-90)" text-anchor="middle">${esc(yLabel)}</text>`;

  points.forEach((p) => {
    const cls = sameMonth && sameMonth(p) ? 'pt-same' : 'pt';
    g += `<circle class="${cls}" cx="${X(Math.min(p.x, xMax))}" cy="${Y(Math.min(p.y, yMax))}" r="${cls === 'pt-same' ? 4.5 : 3.5}"><title>${esc(p.label || '')}</title></circle>`;
  });
  if (curve && curve.length) {
    const d = curve.map((c, i) => `${i ? 'L' : 'M'}${X(c.x).toFixed(1)},${Y(Math.min(c.y, yMax)).toFixed(1)}`).join('');
    g += `<path class="curve" d="${d}"/>`;
  }
  if (sim) g += `<circle class="sim-mark" cx="${X(Math.min(sim.x, xMax))}" cy="${Y(Math.min(sim.y, yMax))}" r="9"><title>Most similar past month</title></circle>`;
  if (you) {
    const yx = X(Math.min(you.x, xMax)), yy = Y(Math.min(you.y, yMax));
    g += `<line class="you-line" x1="${yx}" x2="${yx}" y1="${Y(0)}" y2="${yy}"/>`;
    g += `<circle class="you-dot" cx="${yx}" cy="${yy}" r="8"/>`;
    const anchor = yx > W - 150 ? 'end' : 'start';
    g += `<text class="you-label" x="${yx + (anchor === 'end' ? -14 : 14)}" y="${yy - 10}" text-anchor="${anchor}">${esc(you.label)}</text>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${g}</svg>`;
}

function renderScatter(key, inp, pred) {
  const cfg = CONFIG[key];
  const hist = HISTORY[key];
  $('#chartTitle').textContent = `Rainfall vs. ${cfg.disease.toLowerCase()} cases in ${cfg.city}, ${hist[0].year}–${cfg.years[1]}`;
  const xMax = niceMax(Math.max(state.rain, ...hist.map((d) => d.rain)) * 1.02);
  const yMax = niceMax(Math.max(pred, ...hist.map((d) => d.cases)) * 1.05);
  const curve = [];
  for (let x = 0; x <= xMax; x += xMax / 80) curve.push({ x, y: predictRaw(key, { ...inp, rain: x }) });
  const top = similarMonths(key, inp, 1)[0];
  $('#scatterWrap').innerHTML = scatterSVG({
    points: hist.map((d) => ({ x: d.rain, y: d.cases, month: d.month, label: `${MON3[d.month - 1]} ${d.year}: ${fmt(d.rain)} mm, ${d.cases} cases` })),
    sameMonth: (p) => p.month === state.month,
    xMax, yMax, curve,
    you: { x: state.rain, y: pred, label: `You: ${fmt(pred)} cases` },
    sim: { x: top.rain, y: top.cases },
    xLabel: 'Monthly rainfall (mm)',
    yLabel: 'Monthly cases',
  });
}

/* ---------------- Flood map placeholder ---------------- */
function renderFlood(key) {
  const cfg = CONFIG[key];
  $('#floodTitle').textContent = `Flood-vulnerable areas · ${cfg.city}`;
  const r = mulberry32(key === 'dengue' ? 101 : 202);
  const W = 420, H = 300, s = 15, hw = Math.sqrt(3) * s;
  const cx = W / 2, cy = H / 2;
  const river = key === 'dengue'
    ? [[30, 70], [140, 110], [220, 170], [320, 200], [400, 260]]
    : [[20, 150], [120, 140], [210, 160], [300, 130], [400, 150]];
  const distToRiver = (x, y) => Math.min(...river.slice(1).map((p, i) => segDist(x, y, river[i], p)));
  let hexes = '';
  for (let row = 0; row * s * 1.5 < H + s; row++) {
    for (let col = 0; col * hw < W + hw; col++) {
      const x = col * hw + (row % 2 ? hw / 2 : 0);
      const y = row * s * 1.5;
      // irregular city outline
      const ang = Math.atan2(y - cy, x - cx);
      const rad = (key === 'dengue' ? 125 : 115) + 22 * Math.sin(3 * ang + 1) + 12 * Math.cos(5 * ang);
      if (Math.hypot((x - cx) * 0.78, y - cy) > rad) continue;
      const d = distToRiver(x, y);
      const lvl = d < 22 ? 3 : d < 48 ? 2 : d < 80 && r() > 0.35 ? 1 : 0;
      hexes += `<polygon class="hex" fill="var(--hz-${lvl})" points="${hexPts(x, y, s - 0.5)}"/>`;
    }
  }
  const riverPath = river.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join('');
  $('#floodMap').innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${hexes}<path class="river" d="${riverPath}"/></svg><span class="watermark">Illustrative layout · not real flood data</span>`;

  const levels = [['High', 3], ['High', 3], ['Medium', 2], ['Medium', 2], ['Low', 1]];
  $('#areaList').innerHTML = levels.map(([lbl, lvl], i) => `
    <li>
      <span class="area-name">Barangay ${String.fromCharCode(65 + i)}<small>Name and level from chosen flood dataset</small></span>
      <span class="badge" style="background:var(--hz-${lvl});color:${lvl >= 2 ? '#fff' : 'var(--ink)'}">${lbl}</span>
    </li>`).join('');
}
function hexPts(x, y, s) {
  const pts = [];
  for (let i = 0; i < 6; i++) { const a = (Math.PI / 180) * (60 * i - 30); pts.push(`${(x + s * Math.cos(a)).toFixed(1)},${(y + s * Math.sin(a)).toFixed(1)}`); }
  return pts.join(' ');
}
function segDist(px, py, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = clamp(((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy), 0, 1);
  return Math.hypot(px - (a[0] + t * dx), py - (a[1] + t * dy));
}

/* ---------------- Suggested actions (pending confirmation) ---------------- */
const ACTIONS = {
  dengue: {
    base: [
      { i: '4S', t: 'Search and destroy breeding sites', d: 'Run barangay clean-ups of containers, gutters and tires that hold water.', w: 'Barangay health workers' },
      { i: 'Rx', t: 'Check clinic supplies', d: 'Confirm stocks of NS1 rapid tests, oral rehydration salts and paracetamol.', w: 'City health office' },
    ],
    up: [
      { i: 'IV', t: 'Prepare hospital fast lanes', d: 'Pre-position IV fluids and alert hospitals to open dengue fast lanes.', w: 'Hospitals' },
      { i: '!', t: 'Issue a public advisory', d: 'Remind residents of warning signs and when to go to a health center.', w: 'Public information office' },
    ],
  },
  lepto: {
    base: [
      { i: '!', t: 'Warn against wading', d: 'Advise residents to avoid floodwater and wear boots if exposure is unavoidable.', w: 'Public information office' },
      { i: 'Rx', t: 'Check doxycycline stocks', d: 'Confirm health centers can give doxycycline prophylaxis after flood exposure.', w: 'City health office' },
    ],
    up: [
      { i: 'Dx', t: 'Distribute prophylaxis', d: 'Give doxycycline to residents and responders exposed to floodwater, per DOH guidance.', w: 'Health centers' },
      { i: 'H', t: 'Ready kidney care', d: 'Alert hospitals to expect admissions in about 2 weeks and to prepare dialysis capacity.', w: 'Hospitals' },
    ],
  },
};
function renderActions(key, level) {
  const set = ACTIONS[key];
  const items = level.id === 'up' || level.id === 'high' ? [...set.base, ...set.up] : set.base;
  $('#actionsTitle').textContent = level.id === 'up' || level.id === 'high'
    ? `Estimate is ${level.label.toLowerCase()}: what to do now`
    : 'Routine steps for this month';
  $('#actionGrid').innerHTML = items.map((a) => `
    <div class="action">
      <span class="action-ico" aria-hidden="true">${esc(a.i)}</span>
      <div><h3>${esc(a.t)}</h3><p>${esc(a.d)}</p><span class="action-who">${esc(a.w)}</span></div>
    </div>`).join('');
}

function updateModelInputs(key) {
  $('#modelInputsList').innerHTML = CONFIG[key].inputs.map((t) => `<li>${esc(t)}</li>`).join('');
}

function animateNumber(el, to) {
  const from = Number(el.dataset.v || 0);
  el.dataset.v = String(to);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(to); return; }
  const t0 = performance.now(), dur = 380;
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur);
    el.textContent = fmt(from + (to - from) * (1 - (1 - k) ** 3));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------------- Wire up predict controls ---------------- */
function syncRange(rangeEl, numEl, value) {
  const v = clamp(Math.round(Number(value) || 0), 0, 1500);
  rangeEl.value = v; numEl.value = v;
  rangeEl.style.setProperty('--fill', `${(v / 1500) * 100}%`);
  return v;
}

function initPredict() {
  const monthSel = $('#monthSelect');
  monthSel.innerHTML = MONTHS.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('');
  monthSel.value = String(state.month);

  const rainR = $('#rainRange'), rainN = $('#rainNumber');
  const prevR = $('#prevRange'), prevN = $('#prevNumber');
  syncRange(rainR, rainN, state.rain);
  syncRange(prevR, prevN, state.prev);

  $$('input[name="disease"]').forEach((el) => el.addEventListener('change', (e) => { state.disease = e.target.value; renderPredict(); }));
  monthSel.addEventListener('change', (e) => { state.month = Number(e.target.value); renderPredict(); });
  rainR.addEventListener('input', (e) => { state.rain = syncRange(rainR, rainN, e.target.value); renderPredict(); });
  rainN.addEventListener('change', (e) => { state.rain = syncRange(rainR, rainN, e.target.value); renderPredict(); });
  prevR.addEventListener('input', (e) => { state.prev = syncRange(prevR, prevN, e.target.value); renderPredict(); });
  prevN.addEventListener('change', (e) => { state.prev = syncRange(prevR, prevN, e.target.value); renderPredict(); });
  $('#weeksSelect').addEventListener('change', (e) => { state.nWeeks = Number(e.target.value); renderPredict(); });

  $$('.chip[data-preset]').forEach((btn) => btn.addEventListener('click', () => {
    const t = typicalRain(state.disease, state.month);
    const map = { dry: t * 0.3, typical: t, wet: t * 1.8, storm: Math.max(t * 2.6, 700) };
    state.rain = syncRange(rainR, rainN, map[btn.dataset.preset]);
    renderPredict();
  }));

  renderPredict();
}

/* =============================================================
   UPLOAD VIEW (experimental feature)
   ============================================================= */
const FORMATS = {
  dengue: {
    title: 'Dengue CSV',
    cols: ['YR', 'MN', 'DC_QC', 'RF_NASA', 'n_weeks'],
    rows: [
      ['YR', 'Year', '2010'],
      ['MN', 'Month number, 1–12', '1'],
      ['DC_QC', 'Dengue cases in the month (keep this name for any city)', '110'],
      ['RF_NASA', 'Total rainfall in the month, mm', '39.53'],
      ['n_weeks', 'Number of case weeks assigned to the month', '4'],
    ],
    example: '2010,1,110,39.53,4',
    rainCol: 'RF_NASA', caseCol: 'DC_QC',
    yearOf: (r) => Number(r.YR),
  },
  lepto: {
    title: 'Leptospirosis CSV',
    cols: ['month', 'lepto', 'rain_total_mm', 'n_weeks'],
    rows: [
      ['month', 'First day of the month, YYYY-MM-DD', '2001-01-01'],
      ['lepto', 'Leptospirosis cases in the month', '6'],
      ['rain_total_mm', 'Total rainfall in the month, mm', '79.67'],
      ['n_weeks', 'Number of case weeks assigned to the month (4 or 5)', '5'],
    ],
    example: '2001-01-01,6,79.67,5',
    rainCol: 'rain_total_mm', caseCol: 'lepto',
    yearOf: (r) => Number(String(r.month).slice(0, 4)),
  },
};
const up = { disease: 'dengue', parsed: null, valid: false };

function renderFormat() {
  const f = FORMATS[up.disease];
  $('#fmtTitle').textContent = f.title;
  $('#fmtBody').innerHTML = f.rows.map((r) => `<tr><td>${r[0]}</td><td>${esc(r[1])}</td><td>${r[2]}</td></tr>`).join('');
  $('#fmtCode').textContent = `${f.cols.join(',')}\n${f.example}`;
}

function setStep(n) {
  $$('.step').forEach((el) => {
    const s = Number(el.dataset.step);
    el.classList.toggle('is-done', s < n);
    el.classList.toggle('is-current', s === n);
  });
}

function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '');
  const split = (l) => l.split(',').map((c) => c.trim().replace(/^"(.*)"$/, '$1'));
  const header = split(lines[0] || '');
  const rows = lines.slice(1).map((l) => {
    const cells = split(l);
    const o = {};
    header.forEach((h, i) => { o[h] = cells[i] ?? ''; });
    return o;
  });
  return { header, rows };
}

function validate(parsed) {
  const f = FORMATS[up.disease];
  const checks = [];
  const missing = f.cols.filter((c) => !parsed.header.includes(c));
  checks.push({ ok: missing.length === 0, t: 'Required columns present', d: missing.length ? `Missing: ${missing.join(', ')}` : f.cols.join(', ') });
  const extra = parsed.header.filter((c) => !f.cols.includes(c));
  if (extra.length) checks.push({ warn: true, t: 'Extra columns will be ignored', d: extra.join(', ') });

  let blanks = 0, nonNum = 0, badDate = 0, badMonth = 0;
  parsed.rows.forEach((r) => {
    f.cols.forEach((c) => { if (r[c] === undefined || r[c] === '') blanks++; });
    [f.caseCol, f.rainCol, 'n_weeks'].forEach((c) => { if (r[c] !== '' && r[c] !== undefined && !Number.isFinite(Number(r[c]))) nonNum++; });
    if (up.disease === 'lepto' && r.month && !/^\d{4}-\d{2}-01$/.test(r.month)) badDate++;
    if (up.disease === 'dengue' && r.MN && !(Number(r.MN) >= 1 && Number(r.MN) <= 12)) badMonth++;
  });
  checks.push({ ok: parsed.rows.length > 0 && blanks === 0, t: 'No missing values', d: blanks ? `${blanks} empty cell(s)` : `${parsed.rows.length} rows` });
  checks.push({ ok: nonNum === 0, t: 'Cases, rainfall and n_weeks are numbers', d: nonNum ? `${nonNum} non-numeric value(s)` : 'OK' });
  if (up.disease === 'lepto') checks.push({ ok: badDate === 0, t: 'month is the first day, YYYY-MM-DD', d: badDate ? `${badDate} row(s) in another format` : 'OK' });
  if (up.disease === 'dengue') checks.push({ ok: badMonth === 0, t: 'MN is between 1 and 12', d: badMonth ? `${badMonth} row(s) out of range` : 'OK' });

  const years = new Set(parsed.rows.map(f.yearOf).filter(Number.isFinite));
  const yearsOk = years.size >= 2;
  checks.push({ ok: yearsOk, warn: yearsOk && years.size < 5, t: 'At least 2 years of data', d: `${years.size} year(s) found${yearsOk && years.size < 5 ? ', 5+ recommended for a meaningful check' : ''}` });

  const valid = checks.every((c) => c.ok !== false || c.warn);
  return { checks, valid: checks.filter((c) => !c.warn).every((c) => c.ok) && valid, years };
}

function renderCheck(parsed, fileName) {
  const res = validate(parsed);
  up.valid = res.valid;
  $('#checkCard').hidden = false;
  $('#resultCard').hidden = true;
  $('#checkTitle').textContent = fileName;
  const badge = $('#checkBadge');
  badge.textContent = res.valid ? 'Ready' : 'Needs fixes';
  badge.className = `badge ${res.valid ? 'badge-ok' : 'badge-bad'}`;
  $('#checklist').innerHTML = res.checks.map((c) => {
    const cls = c.ok === false ? 'ck-bad' : c.warn ? 'ck-warn' : 'ck-ok';
    const sym = c.ok === false ? '✕' : c.warn ? '!' : '✓';
    return `<li><span class="ck ${cls}" aria-hidden="true">${sym}</span><span>${esc(c.t)}<small>${esc(c.d)}</small></span></li>`;
  }).join('');
  const cols = parsed.header.slice(0, 8);
  $('#previewTable').innerHTML = `<thead><tr>${cols.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
    <tbody>${parsed.rows.slice(0, 5).map((r) => `<tr>${cols.map((c) => `<td>${esc(r[c] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody>`;
  $('#runUpload').disabled = !res.valid;
  setStep(3);
}

function rank(arr) {
  const idx = arr.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
  const r = new Array(arr.length);
  for (let i = 0; i < idx.length;) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
    i = j + 1;
  }
  return r;
}
function spearman(x, y) {
  const rx = rank(x), ry = rank(y);
  const mx = mean(rx), my = mean(ry);
  let num = 0, dx = 0, dy = 0;
  rx.forEach((v, i) => { num += (v - mx) * (ry[i] - my); dx += (v - mx) ** 2; dy += (ry[i] - my) ** 2; });
  return num / Math.sqrt(dx * dy || 1);
}

function runUpload() {
  const f = FORMATS[up.disease];
  const rows = up.parsed.rows;
  const rain = rows.map((r) => Number(r[f.rainCol]));
  const cases = rows.map((r) => Number(r[f.caseCol]));
  const years = new Set(rows.map(f.yearOf));
  const rho = spearman(rain, cases);
  const city = $('#cityName').value.trim() || 'your city';
  const mode = $('input[name="upMode"]:checked').value;
  const strength = Math.abs(rho) >= 0.5 ? 'strong' : Math.abs(rho) >= 0.3 ? 'moderate' : 'weak';

  $('#resultCard').hidden = false;
  $('#resultTitle').textContent = `${CONFIG[up.disease].disease} and rainfall in ${city}`;
  $('#statRow').innerHTML = [
    ['Months', fmt(rows.length)],
    ['Years', fmt(years.size)],
    ['Total cases', fmt(cases.reduce((a, b) => a + b, 0))],
    ['Spearman ρ', rho.toFixed(2)],
  ].map(([k, v]) => `<div class="stat"><div class="stat-k">${k}</div><div class="stat-v">${v}</div></div>`).join('');

  const xMax = niceMax(Math.max(...rain) * 1.02);
  const yMax = niceMax(Math.max(...cases) * 1.05);
  $('#uploadScatter').innerHTML = scatterSVG({
    points: rows.map((r, i) => ({ x: rain[i], y: cases[i], label: `${rain[i]} mm, ${cases[i]} cases` })),
    xMax, yMax, xLabel: 'Monthly rainfall (mm)', yLabel: 'Monthly cases',
  });
  $('#resultNote').innerHTML = `Rank correlation between monthly rainfall and cases is <strong>${strength}</strong> (ρ = ${rho.toFixed(2)}). `
    + (mode === 'retrain'
      ? 'Next step: retrain the model on this file with leave-one-year-out CV. <em>This runs in the Python backend, which is not connected in the prototype.</em>'
      : `Next step: apply the ${CONFIG[up.disease].city} model to this file. <em>Not connected in the prototype; expect the rain–case link to differ by city.</em>`);
  setStep(4);
}

function handleFile(file) {
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { alert('Please upload a CSV under 2 MB.'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    up.parsed = parseCSV(String(reader.result));
    $('#dzSub').textContent = `${file.name} · ${(file.size / 1024).toFixed(1)} KB`;
    renderCheck(up.parsed, file.name);
  };
  reader.readAsText(file);
}

function sampleCSV(key) {
  const f = FORMATS[key];
  const r = mulberry32(key === 'dengue' ? 7 : 8);
  const lines = [f.cols.join(',')];
  for (let y = 2015; y <= 2020; y++) {
    for (let m = 1; m <= 12; m++) {
      const rain = (RAIN_SHAPE[m - 1] * Math.exp(gauss(r) * 0.5)).toFixed(2);
      const nW = [5, 4, 4, 4, 5, 4, 5, 4, 4, 5, 4, 5][m - 1];
      const c = Math.round((key === 'dengue' ? 40 : 1.5) * Math.pow(1 + Number(rain) / 150, 0.6) * Math.exp(gauss(r) * 0.35));
      lines.push(key === 'dengue' ? `${y},${m},${c},${rain},${nW}` : `${y}-${String(m).padStart(2, '0')}-01,${c},${rain},${nW}`);
    }
  }
  return lines.join('\n');
}

function initUpload() {
  renderFormat();
  $$('input[name="upDisease"]').forEach((el) => el.addEventListener('change', (e) => {
    up.disease = e.target.value;
    renderFormat();
    if (up.parsed) renderCheck(up.parsed, $('#checkTitle').textContent);
    setStep(up.parsed ? 3 : 2);
  }));
  const dz = $('#dropzone');
  ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('is-over'); }));
  dz.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]));
  $('#fileInput').addEventListener('change', (e) => handleFile(e.target.files[0]));

  $('#downloadTemplate').addEventListener('click', () => {
    const f = FORMATS[up.disease];
    const blob = new Blob([`${f.cols.join(',')}\n${f.example}\n`], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `daloy_${up.disease}_template.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('#loadSample').addEventListener('click', () => {
    up.parsed = parseCSV(sampleCSV(up.disease));
    $('#dzSub').textContent = 'Synthetic sample · 2015–2020';
    renderCheck(up.parsed, `Sample ${CONFIG[up.disease].disease.toLowerCase()} data (synthetic)`);
  });
  $('#copyHeader').addEventListener('click', async (e) => {
    try { await navigator.clipboard.writeText(FORMATS[up.disease].cols.join(',')); e.target.textContent = 'Copied'; }
    catch { e.target.textContent = 'Copy failed'; }
    setTimeout(() => { e.target.textContent = 'Copy header'; }, 1400);
  });
  $('#runUpload').addEventListener('click', runUpload);
  setStep(1);
  $$('input[name="upDisease"]').forEach((el) => el.addEventListener('focus', () => setStep(up.parsed ? 3 : 1)));
  $('#dropzone').addEventListener('click', () => { if (!up.parsed) setStep(2); });
}

/* =============================================================
   TABS + THEME
   ============================================================= */
function initTabs() {
  const tabs = $$('.tab');
  const activate = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $(`#view-${t.dataset.view}`).hidden = !on;
    });
    tab.focus();
    history.replaceState(null, '', `#${tab.dataset.view}`);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activate(t));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') activate(tabs[(i + 1) % tabs.length]);
      if (e.key === 'ArrowLeft') activate(tabs[(i - 1 + tabs.length) % tabs.length]);
    });
  });
  const fromHash = tabs.find((t) => `#${t.dataset.view}` === location.hash);
  if (fromHash) activate(fromHash);
}

function initTheme() {
  const root = document.documentElement;
  const btn = $('#themeToggle');
  const saved = localStorage.getItem('daloy-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const apply = (t) => {
    root.dataset.theme = t;
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  };
  apply(saved || (prefersDark ? 'dark' : 'light'));
  btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
    localStorage.setItem('daloy-theme', next);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTabs();
  initPredict();
  initUpload();
});
