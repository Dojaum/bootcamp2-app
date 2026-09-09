const campoBusca = document.getElementById("campo-busca");
const botaoBuscar = document.getElementById("botao-buscar");
const resultado = document.getElementById("resultado");

async function buscarPokemon(termo) {
  resultado.innerHTML = `
    <div class="empty">
      <h2>Carregando...</h2>
      <p>Consultando a PokeAPI.</p>
    </div>
  `;

  try {
    const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(termo)}`);

    if (!resposta.ok) {
      throw new Error("Pokémon não encontrado");
    }

    const dados = await resposta.json();

    const tipos = dados.types.map(item => item.type.name).join(", ");
    const habilidades = dados.abilities.map(item => item.ability.name).join(", ");
    const imagem = dados.sprites.other["official-artwork"].front_default || dados.sprites.front_default;

    resultado.innerHTML = `
      <article class="card">
        <div class="image-area">
          <img src="${imagem}" alt="Imagem de ${dados.name}">
        </div>
        <div>
          <h2 class="name">${dados.name}</h2>
          <p class="number">Nº ${String(dados.id).padStart(3, "0")}</p>

          <div class="info-grid">
            <div class="info">
              <strong>Altura</strong>
              <span>${dados.height / 10} m</span>
            </div>
            <div class="info">
              <strong>Peso</strong>
              <span>${dados.weight / 10} kg</span>
            </div>
            <div class="info">
              <strong>Tipos</strong>
              <span>${tipos}</span>
            </div>
            <div class="info">
              <strong>Habilidades</strong>
              <span>${habilidades}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  } catch (erro) {
    resultado.innerHTML = `
      <div class="error">
        <h2>Pokémon não encontrado</h2>
        <p>Verifique o nome ou número digitado e tente novamente.</p>
      </div>
    `;
  }
}

botaoBuscar.addEventListener("click", () => {
  const termo = campoBusca.value.toLowerCase().trim();

  if (!termo) {
    resultado.innerHTML = `
      <div class="error">
        <h2>Digite alguma coisa</h2>
        <p>Informe o nome ou número de um Pokémon para pesquisar.</p>
      </div>
    `;
    campoBusca.focus();
    return;
  }

  buscarPokemon(termo);
});

campoBusca.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    botaoBuscar.click();
  }
});

buscarPokemon("pikachu");
