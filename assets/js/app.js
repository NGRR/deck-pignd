import { deck } from "./slides.js";

const STORAGE_KEY = "deck_uikit_state_v1";
const ui = window.UIkit;
const REMOTE_TIMEOUT_MS = 10000;

let remoteConfig = null;
let remoteEnabled = false;
let remoteBaseUrl = "";
let remoteApiKey = "";
let remoteRowId = "main";

function hasUikitModal(){
  return Boolean(ui && typeof ui.modal === "function");
}

function openModal(modalEl){
  if (!modalEl) return;
  if (hasUikitModal()) {
    ui.modal(modalEl).show();
    return;
  }

  modalEl.classList.add("manual-modal-open");
}

function closeModal(modalEl){
  if (!modalEl) return;
  if (hasUikitModal()) {
    ui.modal(modalEl).hide();
    return;
  }

  modalEl.classList.remove("manual-modal-open");
}

function deepClone(value){
  return JSON.parse(JSON.stringify(value));
}

const defaultDeck = deepClone(deck);

function readStoredDeck(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isValidDeck(candidate){
  return Boolean(
    candidate &&
    typeof candidate === "object" &&
    typeof candidate.title === "string" &&
    Array.isArray(candidate.slides)
  );
}

let currentDeck = defaultDeck;
const storedDeck = readStoredDeck();
if (isValidDeck(storedDeck)) {
  currentDeck = storedDeck;
}

const elTOC = document.getElementById("toc");
const elStage = document.getElementById("stage");
const elMeta = document.getElementById("slideMeta");
const elTitle = document.getElementById("deckTitle");
const elProgress = document.getElementById("progress");

const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnEditText = document.getElementById("btnEditText");
const btnEditDeck = document.getElementById("btnEditDeck");
const btnSaveDeck = document.getElementById("btnSaveDeck");
const btnRestoreDeck = document.getElementById("btnRestoreDeck");
const btnExportDeck = document.getElementById("btnExportDeck");
const btnImportDeck = document.getElementById("btnImportDeck");
const btnApplyDeckChanges = document.getElementById("btnApplyDeckChanges");
const btnApplySlideChanges = document.getElementById("btnApplySlideChanges");
const deckEditorTextarea = document.getElementById("deckEditorTextarea");
const deckEditorModal = document.getElementById("deckEditorModal");
const slideEditorModal = document.getElementById("slideEditorModal");
const slideEditorForm = document.getElementById("slideEditorForm");
const fileImportDeck = document.getElementById("fileImportDeck");
const syncStatus = document.getElementById("syncStatus");

elTitle.textContent = currentDeck.title;

let idx = 0;

function esc(s=""){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function escAttr(s = ""){
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function arrayToLines(value){
  return Array.isArray(value) ? value.join("\n") : "";
}

function linesToArray(value){
  return String(value || "")
    .split("\n")
    .map(x => x.trim())
    .filter(Boolean);
}

function textField(label, key, value){
  return `
    <div class="uk-margin-small">
      <div class="form-label">${esc(label)}</div>
      <input class="form-input" data-kind="text" data-key="${escAttr(key)}" value="${escAttr(value || "")}" />
    </div>
  `;
}

function textAreaField(label, key, value){
  return `
    <div class="uk-margin-small">
      <div class="form-label">${esc(label)}</div>
      <textarea class="form-textarea" data-kind="text" data-key="${escAttr(key)}">${esc(value || "")}</textarea>
    </div>
  `;
}

function linesField(label, key, value){
  return `
    <div class="uk-margin-small">
      <div class="form-label">${esc(label)} (una linea por item)</div>
      <textarea class="form-textarea" data-kind="lines" data-key="${escAttr(key)}">${esc(arrayToLines(value))}</textarea>
    </div>
  `;
}

function setSyncStatus(message, tone = "local"){
  if (!syncStatus) return;
  syncStatus.textContent = message;
  syncStatus.classList.remove("sync-local", "sync-remote", "sync-error");
  syncStatus.classList.add(`sync-${tone}`);
}

async function loadRemoteConfig(){
  if (window.DECK_REMOTE_CONFIG) {
    remoteConfig = window.DECK_REMOTE_CONFIG;
  }

  if (!remoteConfig) {
    try {
      const mod = await import("./remote-config.js");
      remoteConfig = mod.remoteConfig || mod.default || null;
    } catch {
      remoteConfig = null;
    }
  }

  if (!remoteConfig) return;

  const url = String(remoteConfig.supabaseUrl || "").trim();
  const key = String(remoteConfig.supabaseAnonKey || "").trim();
  const rowId = String(remoteConfig.rowId || "main").trim();

  if (!url || !key) return;

  remoteEnabled = true;
  remoteBaseUrl = url.replace(/\/$/, "");
  remoteApiKey = key;
  remoteRowId = rowId || "main";
}

function remoteHeaders(extra = {}){
  return {
    apikey: remoteApiKey,
    Authorization: `Bearer ${remoteApiKey}`,
    ...extra
  };
}

async function fetchWithTimeout(url, options){
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REMOTE_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchRemoteDeck(){
  if (!remoteEnabled) return null;

  const rowFilter = encodeURIComponent(remoteRowId);
  const url = `${remoteBaseUrl}/rest/v1/deck_state?id=eq.${rowFilter}&select=deck,updated_at&limit=1`;
  const res = await fetchWithTimeout(url, {
    method: "GET",
    headers: remoteHeaders()
  });

  if (!res.ok) {
    throw new Error(`GET deck_state failed (${res.status})`);
  }

  const rows = await res.json();
  if (!Array.isArray(rows) || !rows.length) return null;

  const candidate = rows[0]?.deck;
  if (isValidDeck(candidate)) return candidate;
  return null;
}

async function saveRemoteDeckState(deckToSave){
  if (!remoteEnabled) return false;

  const url = `${remoteBaseUrl}/rest/v1/deck_state?on_conflict=id`;
  const payload = [{ id: remoteRowId, deck: deckToSave }];
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: remoteHeaders({
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation"
    }),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`POST deck_state failed (${res.status})`);
  }

  return true;
}

async function syncSave({ notify = false } = {}){
  persistDeck();

  if (!remoteEnabled) {
    setSyncStatus("Local", "local");
    if (notify) {
      alert("Guardado local. Configura Supabase para compartir con todos.");
    }
    return;
  }

  try {
    await saveRemoteDeckState(currentDeck);
    setSyncStatus("Compartido", "remote");
    if (notify) {
      alert("Cambios guardados y compartidos.");
    }
  } catch {
    setSyncStatus("Error remoto (local OK)", "error");
    if (notify) {
      alert("No se pudo guardar en remoto. Se mantuvo guardado local.");
    }
  }
}

function iconForLayout(layout=""){
  const map = {
    cover: "fa-solid fa-book-open",
    list: "fa-solid fa-list-check",
    twoCards: "fa-solid fa-table-columns",
    threeCards: "fa-solid fa-table-cells-large",
    quadrants: "fa-solid fa-border-all",
    pipeline: "fa-solid fa-arrow-right-arrow-left",
    tiers: "fa-solid fa-layer-group",
    dashboard: "fa-solid fa-chart-column",
    threePillars: "fa-solid fa-landmark",
    split: "fa-solid fa-code-compare",
    quote: "fa-solid fa-quote-left",
    ranking: "fa-solid fa-ranking-star",
    tiles6: "fa-solid fa-grip",
    tiles4: "fa-solid fa-grip-vertical",
    stacked: "fa-solid fa-chart-simple"
  };

  return map[layout] || "fa-regular fa-file-lines";
}

function uniqueSlideId(base = "slide"){
  const cleanBase = String(base || "slide")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "slide";

  const existing = new Set(currentDeck.slides.map(s => String(s?.id || "")));
  if (!existing.has(cleanBase)) return cleanBase;

  let n = 2;
  while (existing.has(`${cleanBase}-${n}`)) {
    n += 1;
  }
  return `${cleanBase}-${n}`;
}

function buildNewSlideFrom(sourceSlide){
  const seed = sourceSlide || {};
  return {
    id: uniqueSlideId(seed.id || seed.title || "nueva-lamina"),
    kicker: seed.kicker || "Nueva lamina",
    title: `Nueva lamina (${seed.layout || "list"})`,
    subtitle: "",
    layout: seed.layout || "list",
    bullets: ["Nuevo punto 1", "Nuevo punto 2"]
  };
}

function insertSlideAt(targetIndex, where){
  const source = currentDeck.slides[targetIndex] || null;
  const freshSlide = buildNewSlideFrom(source);
  const insertAt = where === "above" ? targetIndex : targetIndex + 1;

  currentDeck.slides.splice(insertAt, 0, freshSlide);
  idx = insertAt;
  render();
  void syncSave();
}

function duplicateSlideAt(targetIndex){
  const source = currentDeck.slides[targetIndex];
  if (!source || typeof source !== "object") return;

  const clone = deepClone(source);
  clone.id = uniqueSlideId(source.id || source.title || "lamina");
  clone.title = `${source.title || "Lamina"} (copia)`;

  const insertAt = targetIndex + 1;
  currentDeck.slides.splice(insertAt, 0, clone);
  idx = insertAt;
  render();
  void syncSave();
}

function deleteSlideAt(targetIndex){
  if (currentDeck.slides.length <= 1) {
    alert("No se puede borrar la ultima lamina.");
    return;
  }

  const target = currentDeck.slides[targetIndex];
  const ok = confirm(`¿Borrar la lamina \"${target?.title || "(sin titulo)"}\"?`);
  if (!ok) return;

  currentDeck.slides.splice(targetIndex, 1);
  if (idx >= currentDeck.slides.length) {
    idx = currentDeck.slides.length - 1;
  } else if (idx > targetIndex) {
    idx -= 1;
  }

  render();
  void syncSave();
}

function closeTocMenus(){
  elTOC.querySelectorAll(".toc-actions-menu.open").forEach(menu => {
    menu.classList.remove("open");
  });
}

function renderTOC(){
  const items = currentDeck.slides.map((s, i) => {
    const active = i === idx ? "uk-active" : "";
    const icon = iconForLayout(s.layout);
    return `
      <li class="${active} toc-item">
        <a href="#${esc(s.id)}" data-idx="${i}"><i class="${icon} toc-icon" aria-hidden="true"></i>${esc(s.title)}</a>
        <button class="toc-menu-btn" type="button" data-menu-toggle="${i}" aria-label="Menu contextual">+</button>
        <div class="toc-actions-menu" data-menu="${i}">
          <button type="button" data-action="add-above" data-idx="${i}">+ Arriba</button>
          <button type="button" data-action="add-below" data-idx="${i}">+ Abajo</button>
          <button type="button" data-action="duplicate-slide" data-idx="${i}">Duplicar</button>
          <button type="button" data-action="delete-slide" data-idx="${i}">Borrar</button>
        </div>
      </li>
    `;
  }).join("");

  elTOC.innerHTML = `<ul class="uk-nav uk-nav-default">${items}</ul>`;

  elTOC.querySelectorAll("a[data-idx]").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      idx = Number(a.dataset.idx);
      render();
    });
  });

  elTOC.querySelectorAll("[data-menu-toggle]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const menu = elTOC.querySelector(`[data-menu=\"${btn.dataset.menuToggle}\"]`);
      if (!menu) return;

      const wasOpen = menu.classList.contains("open");
      closeTocMenus();
      if (!wasOpen) {
        menu.classList.add("open");
      }
    });
  });

  elTOC.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const targetIndex = Number(btn.dataset.idx);
      const action = btn.dataset.action;
      closeTocMenus();

      if (!Number.isInteger(targetIndex)) return;
      if (action === "add-above") insertSlideAt(targetIndex, "above");
      if (action === "add-below") insertSlideAt(targetIndex, "below");
      if (action === "duplicate-slide") duplicateSlideAt(targetIndex);
      if (action === "delete-slide") deleteSlideAt(targetIndex);
    });
  });
}

function badgeRow(badges=[]){
  if (!badges?.length) return "";
  return `
    <div class="uk-flex uk-flex-wrap uk-grid-small uk-margin-small-top" uk-grid>
      ${badges.map(b => `<div><span class="badge"><span class="dot"></span>${esc(b)}</span></div>`).join("")}
    </div>
  `;
}

function headerBlock(s){
  const icon = iconForLayout(s.layout);
  return `
    <div class="slide-context">Area de estudios y capacitacion</div>
    <div class="slide-kicker"><i class="${icon}" aria-hidden="true"></i> ${esc(s.kicker || "")}</div>
    <div class="slide-title"><mark>${esc(s.title || "")}</mark></div>
    ${s.subtitle ? `<div class="slide-subtitle uk-margin-small-top">${esc(s.subtitle)}</div>` : ""}
    ${badgeRow(s.badges)}
    <div class="hr"></div>
  `;
}

function layoutCover(s){
  return `
    <div class="uk-height-1-1 uk-flex uk-flex-column uk-flex-center">
      ${headerBlock(s)}
    </div>
  `;
}

function layoutList(s){
  return `
    ${headerBlock(s)}
    <div class="card-soft uk-padding-small">
      <ul class="uk-list uk-list-bullet uk-margin-remove">
        ${(s.bullets||[]).map(b => `<li>${esc(b)}</li>`).join("")}
      </ul>
      ${s.note ? `<div class="small-note uk-margin-top">${esc(s.note)}</div>` : ""}
    </div>
  `;
}

function layoutTwoCards(s){
  return `
    ${headerBlock(s)}
    <div class="uk-child-width-1-2@m uk-grid-medium slide-grid" uk-grid>
      ${(s.cards||[]).map(c => `
        <div>
          <div class="uk-padding card-soft">
            <div class="uk-text-bold uk-margin-small-bottom">${esc(c.title)}</div>
            <div class="uk-text-muted">${esc(c.body)}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function layoutThreeCards(s){
  return `
    ${headerBlock(s)}
    <div class="uk-child-width-1-3@m uk-grid-medium slide-grid" uk-grid>
      ${(s.cards||[]).map(c => `
        <div>
          <div class="uk-padding card-soft">
            <div class="uk-text-bold">${esc(c.title)}</div>
            <div class="uk-text-muted uk-margin-small-top">${esc(c.body)}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function layoutQuadrants(s){
  return `
    ${headerBlock(s)}
    <div class="uk-child-width-1-2@m uk-grid-medium slide-grid" uk-grid>
      ${(s.cards||[]).map(c => `
        <div>
          <div class="uk-padding card-soft">
            <div class="uk-text-small uk-text-muted">${esc(c.title)}</div>
            <div class="uk-text-bold uk-margin-small-top ${esc(c.accent||"")}">${esc(c.body)}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function layoutPipeline(s){
  const steps = s.steps || [];
  return `
    ${headerBlock(s)}
    <div class="uk-padding card-soft">
      <div class="uk-grid-medium uk-child-width-1-5@m uk-text-small" uk-grid>
        ${steps.map((t,i) => `
          <div>
            <div class="uk-text-muted">Paso ${i+1}</div>
            <div class="uk-text-bold uk-margin-small-top">${esc(t)}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function layoutTiers(s){
  return `
    ${headerBlock(s)}
    <div class="uk-child-width-1-3@m uk-grid-medium slide-grid" uk-grid>
      ${(s.tiers||[]).map(t => `
        <div>
          <div class="uk-padding card-soft">
            <div class="uk-text-bold">${esc(t.title)}</div>
            <div class="uk-text-muted uk-margin-small-top">${esc(t.body)}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function layoutDashboard(s){
  return `
    ${headerBlock(s)}
    <div class="uk-child-width-1-3@m uk-grid-medium slide-grid" uk-grid>
      ${(s.kpis||[]).map(k => `
        <div>
          <div class="uk-padding card-soft">
            <div class="uk-text-muted uk-text-small">${esc(k.label)}</div>
            <div class="big-number uk-margin-small-top">${esc(k.value)}</div>
            <div class="uk-text-muted uk-text-small uk-margin-small-top">${esc(k.note||"")}</div>
          </div>
        </div>
      `).join("")}
    </div>
    ${(s.bullets?.length ? `
      <div class="uk-margin-medium-top uk-padding-small card-soft">
        <ul class="uk-list uk-list-bullet uk-margin-remove">
          ${s.bullets.map(b => `<li>${esc(b)}</li>`).join("")}
        </ul>
      </div>
    ` : "")}
  `;
}

function layoutThreePillars(s){
  return `
    ${headerBlock(s)}
    <div class="uk-child-width-1-3@m uk-grid-medium slide-grid" uk-grid>
      ${(s.cards||[]).map(c => `
        <div>
          <div class="uk-padding card-soft">
            <div class="uk-text-bold">${esc(c.title)}</div>
            <div class="uk-text-muted uk-margin-small-top">${esc(c.body)}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function layoutSplit(s){
  const left = s.left || {};
  const right = s.right || {};
  return `
    ${headerBlock(s)}
    <div class="uk-child-width-1-2@m uk-grid-medium slide-grid" uk-grid>
      <div>
        <div class="uk-padding card-soft">
          <div class="uk-text-bold">${esc(left.title || "")}</div>
          <ul class="uk-list uk-list-bullet uk-margin-small-top uk-margin-remove-bottom">
            ${(left.bullets||[]).map(b => `<li>${esc(b)}</li>`).join("")}
          </ul>
        </div>
      </div>
      <div>
        <div class="uk-padding card-soft">
          <div class="uk-text-bold">${esc(right.title || "")}</div>
          <ul class="uk-list uk-list-bullet uk-margin-small-top uk-margin-remove-bottom">
            ${(right.bullets||[]).map(b => `<li>${esc(b)}</li>`).join("")}
          </ul>
        </div>
      </div>
    </div>
    ${s.note ? `<div class="small-note uk-margin-top">${esc(s.note)}</div>` : ""}
  `;
}

function layoutQuote(s){
  return `
    ${headerBlock(s)}
    <div class="uk-padding card-soft">
      <div class="quote">${esc(s.quote || "")}</div>
      ${(s.chips?.length ? `
        <div class="uk-flex uk-flex-wrap uk-grid-small uk-margin-medium-top" uk-grid>
          ${s.chips.map(c => `<div><span class="badge"><span class="dot"></span>${esc(c)}</span></div>`).join("")}
        </div>
      ` : "")}
    </div>
  `;
}

function layoutRanking(s){
  return `
    ${headerBlock(s)}
    <div class="uk-padding card-soft">
      ${(s.rows||[]).map(r => `
        <div class="rank-row">
          <div class="rank-label">${esc(r.label)}</div>
          <div class="rank-val">${esc(r.value)}</div>
        </div>
      `).join("")}
      ${(s.noteRows?.length ? `
        <div class="small-note uk-margin-top">
          ${s.noteRows.map(x => `<div>${esc(x)}</div>`).join("")}
        </div>
      ` : "")}
    </div>
  `;
}

function layoutTiles6(s){
  return `
    ${headerBlock(s)}
    <div class="uk-child-width-1-3@m uk-grid-medium slide-grid" uk-grid>
      ${(s.tiles||[]).map(t => `
        <div>
          <div class="uk-padding card-soft">
            <div class="uk-text-bold">${esc(t)}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function layoutTiles4(s){
  return `
    ${headerBlock(s)}
    <div class="uk-child-width-1-2@m uk-grid-medium slide-grid" uk-grid>
      ${(s.tiles||[]).map(t => `
        <div>
          <div class="uk-padding card-soft">
            <div class="uk-text-muted uk-text-small">Acción</div>
            <div class="uk-text-bold uk-margin-small-top">${esc(t)}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function layoutStacked(s){
  const segments = s.segments || [];
  const total = segments.reduce((a,c)=>a + (Number(c.value)||0), 0) || 100;

  const segBar = `
    <div class="stack uk-margin-small-top">
      ${segments.map(seg => {
        const pct = Math.max(0, Math.min(100, (Number(seg.value)||0) * 100 / total));
        return `<div class="seg ${esc(seg.cls||"")}" style="width:${pct}%;"></div>`;
      }).join("")}
    </div>
  `;

  const segLegend = `
    <div class="uk-margin-medium-top">
      <div class="uk-grid-small uk-child-width-1-2@m uk-text-small" uk-grid>
        ${segments.map(seg => `
          <div>
            <div class="uk-text-muted">${esc(seg.label)}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  return `
    ${headerBlock(s)}
    <div class="uk-padding card-soft">
      ${s.kpiTop ? `<div class="uk-text-bold">${esc(s.kpiTop)}</div>` : ""}
      ${segBar}
      ${segLegend}
      ${s.kpiBottom ? `<div class="uk-margin-medium-top uk-text-muted">${esc(s.kpiBottom)}</div>` : ""}
    </div>
  `;
}

function renderSlide(s){
  switch (s.layout){
    case "cover": return layoutCover(s);
    case "list": return layoutList(s);
    case "twoCards": return layoutTwoCards(s);
    case "threeCards": return layoutThreeCards(s);
    case "quadrants": return layoutQuadrants(s);
    case "pipeline": return layoutPipeline(s);
    case "tiers": return layoutTiers(s);
    case "dashboard": return layoutDashboard(s);
    case "threePillars": return layoutThreePillars(s);
    case "split": return layoutSplit(s);
    case "quote": return layoutQuote(s);
    case "ranking": return layoutRanking(s);
    case "tiles6": return layoutTiles6(s);
    case "tiles4": return layoutTiles4(s);
    case "stacked": return layoutStacked(s);
    default: return layoutCover(s);
  }
}

/** Scale-to-fit: 1280x720 dentro de .deck-stage-wrap */
function fitStage(){
  const stage = document.getElementById("stage");
  const wrap = stage.parentElement; // .deck-stage-wrap
  if (!wrap) return;

  const maxW = wrap.clientWidth - 24;
  const maxH = wrap.clientHeight - 24;

  const scale = Math.min(maxW / 1280, maxH / 720, 1);
  stage.style.transform = `scale(${scale})`;
}

function render(){
  if (!currentDeck.slides.length) {
    elStage.innerHTML = "<article class=\"slide-shell tone-primary\"><div class=\"uk-padding card-soft\"><div class=\"uk-text-bold\">No hay laminas disponibles.</div></div></article>";
    elMeta.textContent = "Sin contenido";
    elProgress.value = 0;
    elTOC.innerHTML = "";
    return;
  }

  if (idx > currentDeck.slides.length - 1) {
    idx = currentDeck.slides.length - 1;
  }

  const s = currentDeck.slides[idx];
  const tone = idx % 2 === 0 ? "tone-primary" : "tone-secondary";
  elStage.innerHTML = `<article class="slide-shell ${tone}">${renderSlide(s)}</article>`;
  elMeta.textContent = `Lámina ${idx+1} / ${currentDeck.slides.length}`;
  elProgress.value = Math.round(((idx+1) / currentDeck.slides.length) * 100);
  elTitle.textContent = currentDeck.title || "Deck";

  renderTOC();

  history.replaceState(null, "", `#${s.id}`);
  fitStage();
}

function prev(){ if (idx > 0) { idx--; render(); } }
function next(){ if (idx < currentDeck.slides.length - 1) { idx++; render(); } }

function persistDeck(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentDeck));
}

function applyDeck(nextDeck){
  if (!isValidDeck(nextDeck)) {
    alert("El deck no tiene un formato valido. Debe incluir title y slides[].");
    return false;
  }

  currentDeck = nextDeck;
  persistDeck();
  render();
  return true;
}

function exportDeck(){
  const blob = new Blob([JSON.stringify(currentDeck, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "deck-export.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importDeckFromFile(file){
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || ""));
      const ok = applyDeck(parsed);
      if (ok) {
        alert("Deck importado correctamente.");
      }
    } catch {
      alert("No se pudo importar el archivo. Verifica que sea JSON valido.");
    }
  };
  reader.readAsText(file, "utf-8");
}

function objectArrayFactory(key, listLength){
  if (key === "slide.cards") {
    return { title: `Nueva card ${listLength + 1}`, body: "Escribe aqui el contenido" };
  }

  if (key === "slide.kpis") {
    return { label: `KPI ${listLength + 1}`, value: "0", note: "" };
  }

  if (key === "slide.tiers") {
    return { title: `Nivel ${listLength + 1}`, body: "Descripcion" };
  }

  if (key === "slide.rows") {
    return { label: `Elemento ${listLength + 1}`, value: "0" };
  }

  if (key === "slide.segments") {
    return { label: `Segmento ${listLength + 1}`, value: 0, cls: "segA" };
  }

  return { title: `Nuevo item ${listLength + 1}` };
}

function editorLabelForKey(key){
  const map = {
    "slide.cards": "card",
    "slide.kpis": "KPI",
    "slide.tiers": "tier",
    "slide.rows": "fila",
    "slide.segments": "segmento"
  };
  return map[key] || "item";
}

function renderObjectArrayEditor(label, key, items){
  const list = Array.isArray(items) ? items : [];
  const addBtn = `<button type="button" class="uk-button uk-button-default uk-button-small" data-action="add-item" data-key="${escAttr(key)}">Agregar ${esc(editorLabelForKey(key))}</button>`;

  const entries = list.map((item, i) => {
    if (!item || typeof item !== "object") return "";

    const fields = Object.keys(item)
      .filter(k => ["string", "number"].includes(typeof item[k]))
      .map(k => textField(k, `${key}.${i}.${k}`, String(item[k] ?? "")))
      .join("");

    if (!fields) return "";

    return `
      <div class="form-block">
        <div class="uk-flex uk-flex-between uk-flex-middle uk-margin-small-bottom">
          <div class="form-block-title uk-margin-remove">${esc(label)} ${i + 1}</div>
          <button type="button" class="uk-button uk-button-default uk-button-small" data-action="remove-item" data-key="${escAttr(key)}" data-index="${i}">Quitar</button>
        </div>
        ${fields}
      </div>
    `;
  }).join("");

  const emptyState = entries ? "" : `<div class="small-note uk-margin-small-top">Sin elementos. Usa \"Agregar\" para crear uno.</div>`;

  return `
    <div class="form-block">
      <div class="uk-flex uk-flex-between uk-flex-middle uk-margin-small-bottom">
        <div class="form-block-title uk-margin-remove">${esc(label)}</div>
        ${addBtn}
      </div>
      ${entries}
      ${emptyState}
    </div>
  `;
}

function bindSlideEditorActions(){
  slideEditorForm.querySelectorAll('[data-action="add-item"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key || "";
      if (!key.startsWith("slide.")) return;

      const s = currentDeck.slides[idx];
      const localPath = key.slice(6);
      if (!Array.isArray(s[localPath])) {
        s[localPath] = [];
      }

      s[localPath].push(objectArrayFactory(key, s[localPath].length));
      renderBasicSlideEditor();
    });
  });

  slideEditorForm.querySelectorAll('[data-action="remove-item"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key || "";
      const i = Number(btn.dataset.index);
      if (!key.startsWith("slide.") || !Number.isInteger(i)) return;

      const s = currentDeck.slides[idx];
      const localPath = key.slice(6);
      if (!Array.isArray(s[localPath])) return;

      s[localPath].splice(i, 1);
      renderBasicSlideEditor();
    });
  });
}

function renderBasicSlideEditor(){
  const s = currentDeck.slides[idx];
  if (!s) {
    slideEditorForm.innerHTML = "<div class=\"uk-text-muted\">No hay lamina activa para editar.</div>";
    return;
  }

  const sections = [];

  sections.push(`
    <div class="form-block">
      <div class="form-block-title">General</div>
      ${textField("Titulo del deck", "deck.title", currentDeck.title || "")}
      ${textField("Kicker", "slide.kicker", s.kicker || "")}
      ${textField("Titulo", "slide.title", s.title || "")}
      ${textAreaField("Subtitulo", "slide.subtitle", s.subtitle || "")}
      ${textAreaField("Nota", "slide.note", s.note || "")}
      ${textAreaField("Cita", "slide.quote", s.quote || "")}
      ${textField("KPI superior", "slide.kpiTop", s.kpiTop || "")}
      ${textField("KPI inferior", "slide.kpiBottom", s.kpiBottom || "")}
    </div>
  `);

  sections.push(linesField("Badges", "slide.badges", s.badges));
  sections.push(linesField("Bullets", "slide.bullets", s.bullets));
  sections.push(linesField("Pasos", "slide.steps", s.steps));
  sections.push(linesField("Chips", "slide.chips", s.chips));
  sections.push(linesField("Tiles", "slide.tiles", s.tiles));
  sections.push(linesField("Notas complementarias", "slide.noteRows", s.noteRows));

  if (s.left && typeof s.left === "object") {
    sections.push(`
      <div class="form-block">
        <div class="form-block-title">Columna izquierda</div>
        ${textField("Titulo", "slide.left.title", s.left.title || "")}
        ${linesField("Bullets", "slide.left.bullets", s.left.bullets)}
      </div>
    `);
  }

  if (s.right && typeof s.right === "object") {
    sections.push(`
      <div class="form-block">
        <div class="form-block-title">Columna derecha</div>
        ${textField("Titulo", "slide.right.title", s.right.title || "")}
        ${linesField("Bullets", "slide.right.bullets", s.right.bullets)}
      </div>
    `);
  }

  sections.push(renderObjectArrayEditor("Cards", "slide.cards", s.cards));
  sections.push(renderObjectArrayEditor("Tiers", "slide.tiers", s.tiers));
  sections.push(renderObjectArrayEditor("KPIs", "slide.kpis", s.kpis));
  sections.push(renderObjectArrayEditor("Rows", "slide.rows", s.rows));
  sections.push(renderObjectArrayEditor("Segments", "slide.segments", s.segments));

  slideEditorForm.innerHTML = sections.filter(Boolean).join("");
  bindSlideEditorActions();
}

function setPathValue(target, path, value){
  const parts = path.split(".");
  let ref = target;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const next = parts[i + 1];
    const keyNum = Number(key);
    const isIndex = Number.isInteger(keyNum) && String(keyNum) === key;

    if (isIndex) {
      if (!Array.isArray(ref)) return;
      ref = ref[keyNum];
      continue;
    }

    if (ref[key] == null) {
      ref[key] = Number.isInteger(Number(next)) ? [] : {};
    }
    ref = ref[key];
  }

  const leaf = parts[parts.length - 1];
  const leafNum = Number(leaf);
  const isLeafIndex = Number.isInteger(leafNum) && String(leafNum) === leaf;

  if (isLeafIndex) {
    if (!Array.isArray(ref)) return;
    ref[leafNum] = value;
    return;
  }

  ref[leaf] = value;
}

function applyBasicSlideChanges(){
  const s = currentDeck.slides[idx];
  if (!s) return;

  slideEditorForm.querySelectorAll("[data-key]").forEach(input => {
    const key = input.dataset.key || "";
    const kind = input.dataset.kind || "text";
    const val = input.value ?? "";

    if (key === "deck.title") {
      currentDeck.title = String(val);
      return;
    }

    if (!key.startsWith("slide.")) return;
    const path = key.slice(6);

    if (kind === "lines") {
      setPathValue(s, path, linesToArray(val));
    } else {
      setPathValue(s, path, String(val));
    }
  });

  void syncSave();
  render();
}

btnPrev.addEventListener("click", prev);
btnNext.addEventListener("click", next);

btnEditText?.addEventListener("click", () => {
  renderBasicSlideEditor();
  openModal(slideEditorModal);
});

btnEditDeck?.addEventListener("click", () => {
  deckEditorTextarea.value = JSON.stringify(currentDeck, null, 2);
  openModal(deckEditorModal);
});

btnApplyDeckChanges?.addEventListener("click", () => {
  try {
    const parsed = JSON.parse(deckEditorTextarea.value);
    const ok = applyDeck(parsed);
    if (ok) {
      void syncSave();
      closeModal(deckEditorModal);
      alert("Cambios aplicados. Guardado local y remoto (si esta activo).");
    }
  } catch {
    alert("JSON invalido. Revisa la sintaxis antes de aplicar.");
  }
});

btnApplySlideChanges?.addEventListener("click", () => {
  applyBasicSlideChanges();
  closeModal(slideEditorModal);
  alert("Cambios de texto aplicados. Guardado local y remoto (si esta activo).");
});

btnSaveDeck?.addEventListener("click", async () => {
  await syncSave({ notify: true });
});

btnRestoreDeck?.addEventListener("click", () => {
  const confirmed = confirm("Esto eliminara los cambios locales y restaurara el deck original. ¿Continuar?");
  if (!confirmed) return;

  currentDeck = deepClone(defaultDeck);
  localStorage.removeItem(STORAGE_KEY);
  idx = 0;
  render();
  void syncSave();
});

btnExportDeck?.addEventListener("click", exportDeck);

btnImportDeck?.addEventListener("click", () => {
  fileImportDeck.click();
});

fileImportDeck?.addEventListener("change", () => {
  const [file] = fileImportDeck.files || [];
  importDeckFromFile(file);
  fileImportDeck.value = "";
});

if (!hasUikitModal()) {
  document.querySelectorAll(".uk-modal-close").forEach(btn => {
    btn.addEventListener("click", () => {
      closeModal(btn.closest(".uk-modal"));
    });
  });

  [deckEditorModal, slideEditorModal].forEach(modal => {
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });
}

document.addEventListener("click", (e) => {
  if (!elTOC.contains(e.target)) {
    closeTocMenus();
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") prev();
  if (e.key === "ArrowRight") next();
});

window.addEventListener("resize", fitStage);

function initFromHash(){
  const id = location.hash?.slice(1);
  const found = currentDeck.slides.findIndex(s => s.id === id);
  if (found >= 0) idx = found;
}

async function bootstrap(){
  setSyncStatus("Local", "local");
  await loadRemoteConfig();

  if (remoteEnabled) {
    try {
      const remoteDeck = await fetchRemoteDeck();
      if (isValidDeck(remoteDeck)) {
        currentDeck = remoteDeck;
        persistDeck();
      }
      setSyncStatus("Compartido", "remote");
    } catch {
      setSyncStatus("Error remoto (local)", "error");
    }
  }

  initFromHash();
  render();
}

bootstrap();