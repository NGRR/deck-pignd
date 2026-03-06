import { deck } from "./slides.js";

const elTOC = document.getElementById("toc");
const elStage = document.getElementById("stage");
const elMeta = document.getElementById("slideMeta");
const elTitle = document.getElementById("deckTitle");
const elProgress = document.getElementById("progress");

const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

elTitle.textContent = deck.title;

let idx = 0;

function esc(s=""){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
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
  const items = deck.slides.map((s, i) => {
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
  const s = deck.slides[idx];
  const tone = idx % 2 === 0 ? "tone-primary" : "tone-secondary";
  elStage.innerHTML = `<article class="slide-shell ${tone}">${renderSlide(s)}</article>`;
  elMeta.textContent = `Lámina ${idx+1} / ${deck.slides.length}`;
  elProgress.value = Math.round(((idx+1) / deck.slides.length) * 100);

  renderTOC();

  history.replaceState(null, "", `#${s.id}`);
  fitStage();
}

function prev(){ if (idx > 0) { idx--; render(); } }
function next(){ if (idx < deck.slides.length - 1) { idx++; render(); } }

btnPrev.addEventListener("click", prev);
btnNext.addEventListener("click", next);

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") prev();
  if (e.key === "ArrowRight") next();
});

window.addEventListener("resize", fitStage);

function initFromHash(){
  const id = location.hash?.slice(1);
  const found = deck.slides.findIndex(s => s.id === id);
  if (found >= 0) idx = found;
}

initFromHash();
render();