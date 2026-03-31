/* ========================================================= */
/* ===================== COVER SYSTEM ======================= */
/* ========================================================= */

const coverCache = new Map();

function getCover(title, author = "") {
  const key = `${title}__${author}`;

  // 🔥 CACHE (prevents re-rendering same cover)
  if (coverCache.has(key)) return coverCache.get(key);

  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 440;

  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "#0C326A";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // title
  ctx.fillStyle = "white";
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "center";

  wrapText(ctx, title, canvas.width / 2, 160, 240, 26);

  // author
  if (author) {
    ctx.font = "14px Arial";
    ctx.fillStyle = "#ddd";
    wrapText(ctx, author, canvas.width / 2, 340, 240, 20);
  }

  const data = canvas.toDataURL();
  coverCache.set(key, data);

  return data;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return;

  const words = text.split(" ");
  let line = "";
  let lines = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const width = ctx.measureText(testLine).width;

    if (width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }

  lines.push(line);

  lines.forEach((l, i) => {
    ctx.fillText(l.trim(), x, y + i * lineHeight);
  });
}

/* ========================================================= */
/* ===================== TITLE CLEANING ===================== */
/* ========================================================= */

function fixArticle(title) {
  const match = title.match(/^(.*),\s(The|A|An)$/i);
  return match ? `${match[2]} ${match[1]}` : title;
}

function parseTitle(rawTitle) {
  let clean = rawTitle
    .replace(/^\-\s*/, "")
    .replace(/\.\w+$/, "");

  const match = clean.match(/^(.*?)\s(\d+(?:\.\d+)?)\s-\s(.*?)\s-\s(.*)$/);

  if (match) {
    return {
      series: match[1].trim(),
      number: parseFloat(match[2]),
      title: fixArticle(match[3].trim()),
      author: match[4].trim()
    };
  }

  const parts = clean.split(" - ");

  return {
    series: "Standalone",
    number: null,
    title: fixArticle(parts[0] || clean),
    author: parts[parts.length - 1] || ""
  };
}

/* ========================================================= */
/* ===================== CARD CREATION ====================== */
/* ========================================================= */

function createBookCard(book) {
  const cover = getCover(book.cleanTitle, book.cleanAuthor);

  return `
    <div class="book">
      ${book.number ? `<div class="badge">#${book.number}</div>` : ""}

      <img 
        src="${cover}" 
        loading="lazy"
        onerror="this.src='https://via.placeholder.com/150x220?text=No+Cover'" 
      />

      <div class="info">
        <h3>${book.cleanTitle}</h3>
        <p class="author">${book.cleanAuthor}</p>

        <div class="buttons">
          <button onclick="downloadBook('${book.fileId}')">Open</button>
        </div>
      </div>
    </div>
  `;
}

/* ========================================================= */
/* ===================== GROUPING =========================== */
/* ========================================================= */

function groupBySeries(books) {
  const groups = {};

  books.forEach(book => {
    const p = parseTitle(book.title);
    const series = fixArticle(p.series);

    if (!groups[series]) groups[series] = [];

    groups[series].push({
      ...book,
      number: p.number,
      cleanTitle: p.title,
      cleanAuthor: p.author
    });
  });

  Object.values(groups).forEach(list => {
    list.sort((a, b) => (a.number || 0) - (b.number || 0));
  });

  return groups;
}

/* ========================================================= */
/* ===================== STATE ============================== */
/* ========================================================= */

let groupedData = {};
let currentTab = "";

/* ========================================================= */
/* ===================== RENDER TABS ======================== */
/* ========================================================= */

function renderTabs() {
  const tabs = document.getElementById("tabs");
  const entries = Object.entries(groupedData);

  if (!entries.length) {
    tabs.innerHTML = "";
    renderEmpty();
    return;
  }

  tabs.innerHTML = entries.map(([series], i) => `
    <button 
      class="tab ${i === 0 ? "active" : ""}" 
      data-series="${encodeURIComponent(series)}"
    >
      ${series}
    </button>
  `).join("");

  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(decodeURIComponent(btn.dataset.series), btn);
    });
  });

  currentTab = entries[0][0];
  renderBooks(currentTab);
}

/* ========================================================= */
/* ===================== SWITCH TAB ========================= */
/* ========================================================= */

function switchTab(series, el) {
  currentTab = series;

  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");

  renderBooks(series);
}

/* ========================================================= */
/* ===================== RENDER BOOKS ======================= */
/* ========================================================= */

function renderBooks(series) {
  const container = document.getElementById("library");

  const books = groupedData[series] || [];

  if (!books.length) {
    renderEmpty();
    return;
  }

  container.innerHTML = `
    <div class="grid">
      ${books.map(createBookCard).join("")}
    </div>
  `;
}

/* ========================================================= */
/* ===================== EMPTY STATE ======================== */
/* ========================================================= */

function renderEmpty() {
  document.getElementById("library").innerHTML = `
    <div class="empty">No books found.</div>
  `;
}

/* ========================================================= */
/* ===================== DOWNLOAD =========================== */
/* ========================================================= */

function downloadBook(fileId) {
  window.open(`https://drive.google.com/file/d/${fileId}/view`, "_blank");
}

/* ========================================================= */
/* ===================== RECENT ============================= */
/* ========================================================= */

function renderRecent() {
  const recent = books.slice(-5).reverse();

  const parsed = recent.map(b => {
    const p = parseTitle(b.title);
    return {
      ...b,
      number: p.number,
      cleanTitle: p.title,
      cleanAuthor: p.author
    };
  });

  document.getElementById("recent").innerHTML =
    parsed.map(createBookCard).join("");
}

/* ========================================================= */
/* ===================== SEARCH ============================= */
/* ========================================================= */

function setupSearch() {
  const input = document.getElementById("search");

  input.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();

    const filtered = books.filter(b =>
      b.title.toLowerCase().includes(value)
    );

    groupedData = groupBySeries(filtered);
    renderTabs();
  });
}

/* ========================================================= */
/* ===================== INIT =============================== */
/* ========================================================= */

function init() {
  groupedData = groupBySeries(books);
  renderTabs();
  renderRecent();
  setupSearch();
}

init();