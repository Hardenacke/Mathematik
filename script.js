function getParams() {
  return new URLSearchParams(window.location.search);
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function loadData() {
  const response = await fetch("data.json");
  if (!response.ok) throw new Error("data.json konnte nicht geladen werden.");
  return response.json();
}

function findFach(data, fachSlug) {
  return data.faecher.find(fach => slugify(fach.name) === fachSlug);
}

function findKlasse(fach, klasseSlug) {
  return fach.klassen.find(klasse => slugify(klasse.name) === klasseSlug);
}

function linkClassForTyp(typ) {
  const lower = String(typ).toLowerCase();
  if (lower.includes("pdf") || lower.includes("arbeitsblatt") || lower.includes("material")) {
    return "button secondary";
  }
  return "button";
}

async function initStartPage() {
  const grid = document.getElementById("subjectGrid");
  try {
    const data = await loadData();
    grid.innerHTML = data.faecher.map(fach => {
      const fachSlug = slugify(fach.name);
      const icon = fach.name.toLowerCase().includes("physik") ? "⚛" : "∑";
      return `
        <a class="card" href="fach.html?fach=${fachSlug}">
          <div class="icon">${icon}</div>
          <h3>${fach.name}</h3>
          <p>${fach.klassen.length} Klassen und Kurse</p>
        </a>
      `;
    }).join("");
  } catch (error) {
    grid.innerHTML = `<div class="empty">${error.message}</div>`;
  }
}

async function initFachPage() {
  const fachSlug = getParams().get("fach");
  const title = document.getElementById("fachTitel");
  const breadcrumb = document.getElementById("breadcrumbFach");
  const grid = document.getElementById("classGrid");

  try {
    const data = await loadData();
    const fach = findFach(data, fachSlug);
    if (!fach) {
      title.textContent = "Fach nicht gefunden";
      grid.innerHTML = `<div class="empty">Prüfe den Link oder die Einträge in data.json.</div>`;
      return;
    }

    title.textContent = fach.name;
    breadcrumb.textContent = fach.name;
    document.title = `${fach.name} – Lernplattform`;

    grid.innerHTML = fach.klassen.map(klasse => {
      const klasseSlug = slugify(klasse.name);
      return `
        <a class="card" href="klasse.html?fach=${fachSlug}&klasse=${klasseSlug}">
          <div class="icon">📚</div>
          <h3>${klasse.name}</h3>
          <p>${klasse.themen.length} Themenbereiche</p>
        </a>
      `;
    }).join("");
  } catch (error) {
    grid.innerHTML = `<div class="empty">${error.message}</div>`;
  }
}

async function initKlassePage() {
  const params = getParams();
  const fachSlug = params.get("fach");
  const klasseSlug = params.get("klasse");

  const eyebrow = document.getElementById("klasseEyebrow");
  const title = document.getElementById("klasseTitel");
  const breadcrumbKlasse = document.getElementById("breadcrumbKlasse");
  const backLink = document.getElementById("zurueckZumFach");
  const themeList = document.getElementById("themeList");
  const searchInput = document.getElementById("searchInput");

  let themaDaten = [];

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = themaDaten.filter(thema => {
      const text = [
        thema.titel,
        thema.beschreibung,
        ...(thema.tags || []),
        ...(thema.links || []).map(link => `${link.typ} ${link.titel} ${link.url}`)
      ].join(" ").toLowerCase();
      return query === "" || text.includes(query);
    });

    if (filtered.length === 0) {
      themeList.innerHTML = `<div class="empty">Keine passenden Themen gefunden.</div>`;
      return;
    }

    themeList.innerHTML = filtered.map(thema => {
      const tags = (thema.tags || []).map(tag => `<span class="tag">${tag}</span>`).join("");
      let links = `<div class="empty">Noch kein Material hinterlegt.</div>`;

      if (thema.links && thema.links.length > 0) {
        links = thema.links.map(link => `
          <a class="${linkClassForTyp(link.typ)}"
             href="${link.url}"
             target="_blank"
             rel="noopener noreferrer">
            ${link.typ}: ${link.titel} ↗
          </a>
        `).join("");
      }

      return `
        <article class="theme-card">
          <div class="tags">${tags}</div>
          <h3>${thema.titel}</h3>
          <p>${thema.beschreibung || ""}</p>
          <div class="links">${links}</div>
        </article>
      `;
    }).join("");
  }

  try {
    const data = await loadData();
    const fach = findFach(data, fachSlug);
    if (!fach) {
      title.textContent = "Fach nicht gefunden";
      themeList.innerHTML = `<div class="empty">Prüfe den Link oder die Einträge in data.json.</div>`;
      return;
    }

    const klasse = findKlasse(fach, klasseSlug);
    if (!klasse) {
      title.textContent = "Klasse nicht gefunden";
      themeList.innerHTML = `<div class="empty">Prüfe den Link oder die Einträge in data.json.</div>`;
      return;
    }

    eyebrow.textContent = fach.name;
    title.textContent = klasse.name;
    breadcrumbKlasse.textContent = klasse.name;
    backLink.textContent = fach.name;
    backLink.href = `fach.html?fach=${fachSlug}`;
    document.title = `${fach.name} · ${klasse.name} – Lernplattform`;

    themaDaten = klasse.themen || [];
    render();
    searchInput.addEventListener("input", render);
  } catch (error) {
    themeList.innerHTML = `<div class="empty">${error.message}</div>`;
  }
}
