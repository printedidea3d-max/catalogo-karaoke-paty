
fetch("songs.json").then(r=>r.json()).then(data=>{
  const list=document.getElementById("list");
  const search=document.getElementById("search");
  const searchBtn=document.getElementById("search-btn");

  function render(items){
    list.innerHTML="";
    items.forEach(item=>{
      const div=document.createElement("div");
      div.className="item";

      const whatsappMsg = encodeURIComponent(`Quero cantar a música ${item.codigo} — ${item.musica}`);
      const whatsappURL = `https://wa.me/?text=${whatsappMsg}`;

      div.innerHTML = `
        <div class="row">
          <strong>${item.codigo} — ${item.musica}</strong>
          <a href="${whatsappURL}" class="btn-whatsapp" target="_blank">🟢</a>
        </div>
        <small>${item.cantor}</small><br>
        <small>${item.inicio_letra || ""}</small><br>
        <span class="copy-btn">Copiar código</span>
      `;

      div.querySelector(".copy-btn").addEventListener("click", ()=>{
        navigator.clipboard.writeText(String(item.codigo));
      });

      list.appendChild(div);
    });
  }

  function filter(){
    let q=search.value.toLowerCase();
    render(
      data.filter(item=>
        (item.musica||"").toLowerCase().includes(q) ||
        (item.cantor||"").toLowerCase().includes(q) ||
        String(item.codigo||"").includes(q) ||
        (item.inicio_letra||"").toLowerCase().includes(q)
      )
    );
  }

  search.addEventListener("input",filter);
  searchBtn.addEventListener("click",filter);

  render(data);
});
