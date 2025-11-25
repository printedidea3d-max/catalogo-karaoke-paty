// app.js – versão turbo com Web Worker + debounce + loading + limite de itens

let songs = [];
let worker = null;
let workerReady = false;

const list = document.getElementById("list");
const search = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");

//normaliza acentos
function normalize(str) {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Mostrar LOADING
function mostrarLoading() {
  list.innerHTML = `<div class="loading">Carregando...</div>`;
}

function criarCard(item) {
  const div = document.createElement("div");
  div.className = "item";

  const whatsappMsg = encodeURIComponent(
    `Quero cantar a música ${item.codigo} — ${item.musica}`
  );
  const whatsappURL = `https://wa.me/?text=${whatsappMsg}`;

  div.innerHTML = `
    <div class="item-header">
      <div class="item-title">${item.codigo} — ${item.musica}</div>
      <a href="${whatsappURL}" class="btn-whatsapp" target="_blank" aria-label="Enviar no WhatsApp">
        <img src="whatsapp.svg" alt="WhatsApp">
      </a>
    </div>
    <div class="item-meta">${item.cantor || ""}</div>
    <div class="item-letra">${item.inicio_letra || ""}</div>
    <div class="item-actions">
      <span class="copy-btn">Copiar código</span>
    </div>
  `;

  // Botão de copiar código
  const copyEl = div.querySelector(".copy-btn");
  copyEl.addEventListener("click", () => {
    const codigoStr = String(item.codigo ?? "").trim();
    if (!codigoStr) return;
    navigator.clipboard
      .writeText(codigoStr)
      .then(() => {
        const original = copyEl.textContent;
        copyEl.textContent = "Copiado!";
        setTimeout(() => {
          copyEl.textContent = original;
        }, 1000);
      })
      .catch(() => {
        alert("Não foi possível copiar automaticamente. Copie manualmente.");
      });
  });

  return div;
}

// Render com limite de 50 resultados
function render(items) {
  list.innerHTML = "";

  const maxItems = 50;
  const limited = items.slice(0, maxItems);

  limited.forEach((item) => {
    list.appendChild(criarCard(item));
  });

  if (items.length > maxItems) {
    const aviso = document.createElement("div");
    aviso.className = "mais-resultados";
    aviso.textContent = `Mostrando 50 de ${items.length} resultados. Refine a busca.`;
    list.appendChild(aviso);
  }
}

// Fallback local (em caso de falha do worker)
function filtrarLocal(q) {
  const query = String(q || "").toLowerCase();

  const filtrados = songs.filter((item) => {
    const musica = String(item.musica || "").toLowerCase();
    const cantor = String(item.cantor || "").toLowerCase();
    const codigo = String(item.codigo || "").toLowerCase();
    const inicio = String(item.inicio_letra || "").toLowerCase();

    return (
      musica.includes(query) ||
      cantor.includes(query) ||
      codigo.includes(query) ||
      inicio.includes(query)
    );
  });

  return filtrados;
}

// Busca
function fazerBusca() {
  const q = String(search.value || "").trim();

  mostrarLoading(); // mostra carregando

  if (!q) {
    render(songs);
    return;
  }

  if (worker && workerReady) {
    worker.postMessage({ type: "search", query: q });
  } else {
    const filtrados = filtrarLocal(q);
    render(filtrados);
  }
}

// Debounce
let timer = null;
search.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(fazerBusca, 150);
});

searchBtn.addEventListener("click", fazerBusca);

// Início da aplicação
fetch("songs.json")
  .then((r) => r.json())
  .then((data) => {
    songs = data;
    render(songs);

    // Iniciar Web Worker
    if (window.Worker) {
      worker = new Worker("search-worker.js");

      worker.onmessage = (event) => {
        const { type, items } = event.data;

        if (type === "ready") {
          workerReady = true;
        }

        if (type === "results") {
          render(items);
        }
      };

      worker.postMessage({ type: "init", data: songs });
    }
  })
  .catch((err) => {
    console.error("Erro ao carregar songs.json:", err);
  });