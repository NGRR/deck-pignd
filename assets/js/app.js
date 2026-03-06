import { deck } from "./slides.js";

const STORAGE_KEY = "deck_uikit_state_v1";
const ui = window.UIkit;

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

function renderTOC(){
  const items = currentDeck.slides.map((s, i) => {
    const active = i === idx ? "uk-active" : "";
    const icon = iconForLayout(s.layout);
    return `<li class="${active}"><a href="#${esc(s.id)}" data-idx="${i}"><i class="${icon} toc-icon" aria-hidden="true"></i>${esc(s.title)}</a></li>`;
  }).join("");

  elTOC.innerHTML = `<ul class="uk-nav uk-nav-default">${items}</ul>`;

  elTOC.querySelectorAll("a[data-idx]").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      idx = Number(a.dataset.idx);
      render();
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

function renderObjectArrayEditor(label, key, items){
  if (!Array.isArray(items) || !items.length) return "";

  const entries = items.map((item, i) => {
    if (!item || typeof item !== "object") return "";

    const fields = Object.keys(item)
      .filter(k => ["string", "number"].includes(typeof item[k]))
      .map(k => textField(k, `${key}.${i}.${k}`, String(item[k] ?? "")))
      .join("");

    if (!fields) return "";

    return `
      <div class="form-block">
        <div class="form-block-title">${esc(label)} ${i + 1}</div>
        ${fields}
      </div>
    `;
  }).join("");

  if (!entries) return "";

  return `
    <div class="form-block">
      <div class="form-block-title">${esc(label)}</div>
      ${entries}
    </div>
  `;
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

  persistDeck();
  render();
}

btnPrev.addEventListener("click", prev);
btnNext.addEventListener("click", next);

btnEditText?.addEventListener("click", () => {
  renderBasicSlideEditor();
  ui.modal(slideEditorModal).show();
});

btnEditDeck?.addEventListener("click", () => {
  deckEditorTextarea.value = JSON.stringify(currentDeck, null, 2);
  ui.modal(deckEditorModal).show();
});

btnApplyDeckChanges?.addEventListener("click", () => {
  try {
    const parsed = JSON.parse(deckEditorTextarea.value);
    const ok = applyDeck(parsed);
    if (ok) {
      ui.modal(deckEditorModal).hide();
      alert("Cambios aplicados y guardados en este navegador.");
    }
  } catch {
    alert("JSON invalido. Revisa la sintaxis antes de aplicar.");
  }
});

btnApplySlideChanges?.addEventListener("click", () => {
  applyBasicSlideChanges();
  ui.modal(slideEditorModal).hide();
  alert("Cambios de texto aplicados y guardados.");
});

btnSaveDeck?.addEventListener("click", () => {
  persistDeck();
  alert("Cambios guardados localmente.");
});

btnRestoreDeck?.addEventListener("click", () => {
  const confirmed = confirm("Esto eliminara los cambios locales y restaurara el deck original. ¿Continuar?");
  if (!confirmed) return;

  currentDeck = deepClone(defaultDeck);
  localStorage.removeItem(STORAGE_KEY);
  idx = 0;
  render();
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

initFromHash();
render();