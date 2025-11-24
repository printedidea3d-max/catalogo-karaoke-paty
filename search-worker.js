// search-worker.js
let songs = [];

// Recebe dados e comandos do app.js
self.onmessage = (event) => {
  const { type, data, query } = event.data;

  // Inicialização do worker
  if (type === "init") {
    // Monta índice de texto para busca rápida
    songs = data.map((item) => {
      const index =
        (item.musica || "") +
        " " +
        (item.cantor || "") +
        " " +
        String(item.codigo || "") +
        " " +
        (item.inicio_letra || "");

      return {
        ...item,
        _index: index.toLowerCase(),
      };
    });

    // Informa ao app.js que o worker está pronto
    self.postMessage({ type: "ready" });
  }

  // Pesquisa
  if (type === "search") {
    const q = String(query || "").toLowerCase().trim();

    if (!q) {
      // Sem texto → devolve tudo
      self.postMessage({ type: "results", items: songs });
      return;
    }

    const filtrados = songs.filter((song) => song._index.includes(q));

    // Envia de volta apenas os itens
    self.postMessage({ type: "results", items: filtrados });
  }
};