// Lista com busca, copiar código e botão WhatsApp com ícone SVG
fetch("songs.json")
  .then((r) => r.json())
  .then((data) => {
    const list = document.getElementById("list");
    const search = document.getElementById("search");
    const searchBtn = document.getElementById("search-btn");

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

    function render(items) {
      list.innerHTML = "";
      items.forEach((item) => {
        list.appendChild(criarCard(item));
      });
    }

    function filtrar() {
      const q = (search.value || "").toLowerCase();
      const filtrados = data.filter((item) => {
        const musica = (item.musica || "").toLowerCase();
        const cantor = (item.cantor || "").toLowerCase();
        const codigo = String(item.codigo || "").toLowerCase();
        const inicio = (item.inicio_letra || "").toLowerCase();

        return (
          musica.includes(q) ||
          cantor.includes(q) ||
          codigo.includes(q) ||
          inicio.includes(q)
        );
      });
      render(filtrados);
    }

    search.addEventListener("input", filtrar);
    searchBtn.addEventListener("click", filtrar);

    render(data);
  });
