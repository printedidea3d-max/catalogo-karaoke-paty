// search-worker.js
let songs = [];

function normalize(str) {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

self.onmessage = (event) => {
  const { type, data, query } = event.data;

  if (type === "init") {
    songs = data.map((item) => {
      const index =
        normalize(item.musica) +
        " " +
        normalize(item.cantor) +
        " " +
        normalize(item.codigo) +
        " " +
        normalize(item.inicio_letra);

      return {
        ...item,
        _index: index
      };
    });

    self.postMessage({ type: "ready" });
  }

  if (type === "search") {
    const q = normalize(query.trim());

    if (!q) {
      self.postMessage({ type: "results", items: songs });
      return;
    }

    const filtrados = songs.filter((song) => song._index.includes(q));

    self.postMessage({ type: "results", items: filtrados });
  }
};
