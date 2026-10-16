import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://pdtddtonzhkrfcmryeod.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdGRkdG9uemhrcmZjbXJ5ZW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjQwMzAsImV4cCI6MjEwNzY0MDAzMH0.FX5A5UhpT7uWWJDUwLn-pK30PUcWXZKyM3_rOBi5Na4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const campoBusca = document.getElementById("campo-busca");
const botaoBuscar = document.getElementById("botao-buscar");
const resultado = document.getElementById("resultado");
const listaFavoritos = document.getElementById("lista-favoritos");

function supabaseConfigurado() {
  return !SUPABASE_URL.includes("COLE_AQUI") && !SUPABASE_ANON_KEY.includes("COLE_AQUI");
}

function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = String(texto ?? "");
  return div.innerHTML;
}

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
          <img src="${imagem}" alt="Imagem de ${escaparHTML(dados.name)}">
        </div>
        <div>
          <h2 class="name">${escaparHTML(dados.name)}</h2>
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
              <span>${escaparHTML(tipos)}</span>
            </div>
            <div class="info">
              <strong>Habilidades</strong>
              <span>${escaparHTML(habilidades)}</span>
            </div>
          </div>

          <button class="botao-favoritar" id="botao-favoritar">☆ Favoritar</button>
        </div>
      </article>
    `;

    document.getElementById("botao-favoritar").addEventListener("click", () => {
      salvarFavorito(dados);
    });
  } catch (erro) {
    resultado.innerHTML = `
      <div class="error">
        <h2>Pokémon não encontrado</h2>
        <p>Verifique o nome ou número digitado e tente novamente.</p>
      </div>
    `;
  }
}

async function salvarFavorito(pokemon) {
  if (!supabaseConfigurado()) {
    alert("Configure a URL e a chave anon do Supabase no arquivo script.js.");
    return;
  }

  const { error } = await supabase.from("favoritos").insert({
    nome_item: pokemon.name,
    dados_extra: {
      id: pokemon.id,
      imagem: pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default,
      tipos: pokemon.types.map(item => item.type.name),
      altura: pokemon.height / 10,
      peso: pokemon.weight / 10
    }
  });

  if (error) {
    console.error(error);
    alert("Não foi possível salvar o favorito. Verifique as políticas RLS do Supabase.");
    return;
  }

  await listarFavoritos();
  alert(`${pokemon.name} foi salvo nos favoritos!`);
}

async function listarFavoritos() {
  if (!supabaseConfigurado()) {
    listaFavoritos.innerHTML = `
      <div class="empty">
        <h2>Supabase ainda não configurado</h2>
        <p>Adicione a URL e a chave anon no arquivo script.js.</p>
      </div>
    `;
    return;
  }

  const { data, error } = await supabase
    .from("favoritos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error(error);
    listaFavoritos.innerHTML = `
      <div class="error">
        <h2>Erro ao carregar favoritos</h2>
        <p>Verifique a tabela e as políticas RLS no Supabase.</p>
      </div>
    `;
    return;
  }

  if (!data.length) {
    listaFavoritos.innerHTML = `
      <div class="empty">
        <h2>Nenhum favorito ainda</h2>
        <p>Pesquise um Pokémon e clique em "Favoritar".</p>
      </div>
    `;
    return;
  }

  listaFavoritos.innerHTML = data.map(favorito => {
    const extra = favorito.dados_extra || {};
    return `
      <article class="favorito-card">
        <img src="${escaparHTML(extra.imagem)}" alt="Imagem de ${escaparHTML(favorito.nome_item)}">
        <div class="favorito-info">
          <h3>${escaparHTML(favorito.nome_item)}</h3>
          <p>Nº ${String(extra.id ?? "").padStart(3, "0")}</p>
          <span>${escaparHTML((extra.tipos || []).join(", "))}</span>
        </div>
        <button class="botao-excluir" data-id="${escaparHTML(favorito.id)}">Excluir</button>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".botao-excluir").forEach(botao => {
    botao.addEventListener("click", () => removerFavorito(botao.dataset.id));
  });
}

async function removerFavorito(id) {
  if (!supabaseConfigurado()) return;

  const { error } = await supabase
    .from("favoritos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Não foi possível excluir o favorito.");
    return;
  }

  await listarFavoritos();
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

listarFavoritos();
buscarPokemon("pikachu");
