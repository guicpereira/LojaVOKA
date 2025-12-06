//Importar o useState e o useEffect para poder utilizar nas variáveis
import { useState, useEffect } from "react";

//Criamos o function que vai ser usado para guardar todas as variaveis e estados que a pagina principal precisa.
function Loja() {

  const [produtos, setProdutos] = useState([]); // Guarda a lista de produtos que vem da API (começa vazia).

  const [pesquisa, setPesquisa] = useState(""); // Guarda o texto que o utilizador escreve na barra de pesquisa.

  const [loading, setLoading] = useState(true); //Controla se o aviso que o site esta "A carregar..." aparece (verdadeiro no início).

  const [meusLikes, setMeusLikes] = useState([]); // Serve para controlar visualmente quais os corações que devem aparecer preenchidos.

  const [filtroCategoria, setFiltroCategoria] = useState("Todos"); //Guarda qual o filtro selecionado (começa com o filtro "Todos").

  // O carrinho é uma lista de produtos. O 'mostrarCarrinho' diz se o menu lateral está aberto ou fechado.
  const [carrinho, setCarrinho] = useState([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);

  //Link da API utilizada que foi o Sheety em combinação com o Google Sheets.
  const API_URL = "https://api.sheety.co/2672044352a1ba5cc22dc0fb03895bdf/lojaOnline/produtos"; 

//Função que vai à net buscar os dados dos produtos.
const carregarDados = () => {
    setLoading(true);
    fetch(API_URL)
      // 1. Recebe a resposta do servidor.
      .then((response) => {
        // Verifica se o servidor respondeu com sucesso. Se não, força um erro.
        if (!response.ok) throw new Error("Erro na ligação à API");
        // Converte a resposta (que vem em texto) para um objeto JSON que o código consegue ler.
        return response.json();
      })
      .then((data) => {
        /* Aqui guardamos os dados recebidos na nossa variável de estado 'produtos'.
           
           A parte (data.produtos || data.Produtos || []) é um sistema de segurança triplo:
           1. Tenta ler 'data.produtos';
           2. Se não existir (||), tenta ler 'data.Produtos';
           3. Se nenhum existir (||), usa uma lista vazia [] para o site não "rebentar".
        */
        setProdutos(data.produtos || data.Produtos || []); 
        
        // Avisa o componente que o carregamento terminou para remover o aviso "A carregar...".
        setLoading(false);
      })
      // 2. Se algo correr mal em qualquer passo acima (sem internet, link errado, por exemplo), o código salta para aqui.
      .catch((erro) => {
        console.error("ERRO AO CARREGAR:", erro); // Mostra o erro técnico na consola para o programador ver.
        setLoading(false); // Desliga o aviso de "A carregar" para não ficar preso no ecrã.
      });
  };

  useEffect(() => {
    carregarDados(); //Vai buscar a função definida anteriormente, que vai buscar à net os dados dos produtos
    /*
      1. Define uma função para definir os likes que ja foram dados anteriormente como likesGuardados;
      2. Muda o estado dos likes para o valor de likes que estavam guardados
      Exemplo pratico da funcao: dia 10/01 entrei no site e dei like num produto. Sai do site. No dia 15/01 voltei ao site e esta um like no mesmo produto que tinha dado like.
    */
    const likesGuardados = JSON.parse(localStorage.getItem("lista_likes_usuario")) || [];
    setMeusLikes(likesGuardados);
  }, []);

// Função acionada quando o utilizador clica no botão de like.
  const alternarLike = (produto) => {
    // Verifica na lista de likes locais se o ID deste produto já lá está.
    // Retorna 'true' se já deu like, ou 'false' se ainda não deu like.
    const jaGostei = meusLikes.includes(produto.id);

    // Cria variáveis vazias que vão guardar os novos valores calculados abaixo.
    let novosLikes; //'novosLikes' será o número total (ex: passou de 10 para 11).
    let novaListaMeusLikes; // 'novaListaMeusLikes' será a minha lista pessoal de IDs atualizada.
    
    //Funcao para evitar que possa dar likes infinitos. (Se já tinha like, remove. Se não tinha, adiciona)
    if (jaGostei) {
      novosLikes = (produto.likes || 0) - 1;
      if (novosLikes < 0) novosLikes = 0; // Evita likes negativos
      novaListaMeusLikes = meusLikes.filter(id => id !== produto.id);
    } else {
      novosLikes = (produto.likes || 0) + 1;
      novaListaMeusLikes = [...meusLikes, produto.id];
    }

    // 1. Atualiza a variável de estado com a nova lista de IDs favoritos do utilizador.
    setMeusLikes(novaListaMeusLikes);

    /* 2. Atualiza a lista visual de produtos para mostrar o novo número de likes imediatamente.
       O método .map() cria uma nova lista baseada na anterior:
       - Se for o produto em que cliquei (p.id === produto.id): cria uma cópia dele com o novo número de likes.
       - Se for outro produto qualquer (: p): mantém-no exatamente igual.
    */
    const listaAtualizada = produtos.map(p => 
      p.id === produto.id ? { ...p, likes: novosLikes } : p
    );
    
    // Guarda essa nova lista na memória do site para o ecrã atualizar.
    setProdutos(listaAtualizada);

    //Guarda no navegador para não perder os likes se fechar a janela
    localStorage.setItem("lista_likes_usuario", JSON.stringify(novaListaMeusLikes));

    // Envia a atualização dos dados para a API
    fetch(`${API_URL}/${produto.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produto: { likes: novosLikes } })
    });
  };

  // Adiciona um produto à lista do carrinho e abre a sidebar.
  const adicionarAoCarrinho = (produto) => {
    setCarrinho([...carrinho, produto]);
    setMostrarCarrinho(true);
  };

  // Remove um item do carrinho com base na sua posição (index).
  const removerDoCarrinho = (indexParaRemover) => {
    const novoCarrinho = carrinho.filter((_, index) => index !== indexParaRemover);
    setCarrinho(novoCarrinho);
  };

  // Soma os preços de tudo o que está no carrinho.
  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + Number(item.preco || 0), 0);
  };

  /* Filtra a lista original de produtos antes de mostrar no ecrã.
     Verifica:
     1. Se o nome corresponde à pesquisa.
     2. Se a categoria corresponde ao filtro selecionado (Homem, Mulher, Tecnologia, etc).
  */
  const produtosFiltrados = produtos.filter((produto) => {
    const nomeSeguro = (produto.nome || "").toLowerCase();
    const categoriaSegura = (produto.categoria || "").toLowerCase();
    const pesquisaSegura = pesquisa.toLowerCase();

    // Verifica a barra de pesquisa
    const matchPesquisa = nomeSeguro.includes(pesquisaSegura);
    
    // Verifica os botões de categoria
    let matchCategoria = true;
    if (filtroCategoria === "Roupa Homem") {
      matchCategoria = categoriaSegura.includes("homem") && categoriaSegura.includes("roupa");
    } 
    else if (filtroCategoria === "Roupa Mulher") {
      matchCategoria = (categoriaSegura.includes("mulher") || categoriaSegura.includes("feminina")) && categoriaSegura.includes("roupa");
    } 
    else if (filtroCategoria === "Tecnologia") {
      matchCategoria = categoriaSegura.includes("tecnologia");
    }
    else if (filtroCategoria === "Casa") {
      matchCategoria = categoriaSegura.includes("casa");
    }

    // Só mostra o produto se passar nos dois testes (pesquisa e categoria)
    return matchPesquisa && matchCategoria;
  });





  /*
    Se a variável 'loading' for verdadeira, o código pára aqui e retorna apenas a mensagem.
    O resto da página (abaixo) só é desenhado quando o loading passar a false.
  */
  if (loading) return <div className="loading" style={{textAlign:'center', marginTop:'50px'}}>A carregar produtos...</div>;

  return (
    <div className="loja-wrapper">
      
      <button className="btn-carrinho-flutuante" onClick={() => setMostrarCarrinho(!mostrarCarrinho)}>
        🛒 <span className="contador-carrinho">{carrinho.length}</span>
      </button>

      <div className={`overlay-carrinho ${mostrarCarrinho ? "aberto" : ""}`} onClick={() => setMostrarCarrinho(false)}></div>
      <div className={`sidebar-carrinho ${mostrarCarrinho ? "aberto" : ""}`}>
        <div className="cabecalho-carrinho">
          <h2>O Meu Carrinho</h2>
          <button className="fechar-carrinho" onClick={() => setMostrarCarrinho(false)}>×</button>
        </div>
        <div className="lista-itens-carrinho">
          {carrinho.length === 0 ? (
            <p className="carrinho-vazio">O seu carrinho está vazio.</p>
          ) : (
            carrinho.map((item, index) => {
              const imgUrl = (item.imagem || "").startsWith('http') ? item.imagem : `/img/${item.imagem}`;
              return (
                <div key={index} className="item-carrinho">
                  <img src={imgUrl} alt={item.nome} onError={(e) => {e.target.src='https://via.placeholder.com/60?text=Foto'}} />
                  <div className="detalhes-item">
                    <h4>{item.nome}</h4>
                    <p>{item.preco} €</p>
                  </div>
                  <button className="btn-remover" onClick={() => removerDoCarrinho(index)}>Remover</button>
                </div>
              );
            })
          )}
        </div>
        <div className="rodape-carrinho">
          <div className="total-linha">
            <span>Total</span>
            <span>{calcularTotal()} €</span>
          </div>
          <button className="btn-checkout" onClick={() => alert("Simulação de Compra Feita!")}>Finalizar Compra</button>
        </div>
      </div>

      <div className="container-loja">
        
        <div className="filtros-genero" style={{marginTop: '40px'}}>
          <button className={filtroCategoria === "Todos" ? "btn-filtro ativo" : "btn-filtro"} onClick={() => setFiltroCategoria("Todos")}>Ver Tudo</button>
          <button className={filtroCategoria === "Roupa Mulher" ? "btn-filtro ativo" : "btn-filtro"} onClick={() => setFiltroCategoria("Roupa Mulher")}>Roupa Mulher</button>
          <button className={filtroCategoria === "Roupa Homem" ? "btn-filtro ativo" : "btn-filtro"} onClick={() => setFiltroCategoria("Roupa Homem")}>Roupa Homem</button>
          <button className={filtroCategoria === "Tecnologia" ? "btn-filtro ativo" : "btn-filtro"} onClick={() => setFiltroCategoria("Tecnologia")}>Tecnologia</button>
          <button className={filtroCategoria === "Casa" ? "btn-filtro ativo" : "btn-filtro"} onClick={() => setFiltroCategoria("Casa")}>Casa</button>
        </div>

        <input type="text" placeholder="Procurar artigo..." value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} className="barra-pesquisa" />

        <div className="grelha-produtos">
          {produtosFiltrados.length > 0 ? (
            produtosFiltrados.map((item) => {
              const temMeuLike = meusLikes.includes(item.id);
              const imagemSegura = item.imagem || "";
              const imagemFinal = imagemSegura.startsWith('http') ? imagemSegura : `/img/${imagemSegura}`;

              return (
                <div key={item.id} className="cartao-produto">
                  <div className="imagem-container">
                     <img src={imagemFinal} alt={item.nome} className="img-produto" onError={(e) => {e.target.src='https://via.placeholder.com/300?text=Sem+Foto'}} />
                  </div>
                  <div className="info-produto">
                    <span className="etiqueta-categoria">{item.categoria || "Geral"}</span>
                    <h3>{item.nome || "Produto"}</h3>
                    
                    <p className="descricao-produto">{item.descricao || ""}</p>

                    <div className="rodape-card">
                      <span className="preco">{item.preco || 0} €</span>
                      <button className="btn-like" onClick={() => alternarLike(item)} style={{ color: temMeuLike ? "#ff6b6b" : "#ccc" }}>
                        {temMeuLike ? "❤️" : "🤍"} {item.likes || 0}
                      </button>
                    </div>
                    <button className="btn-comprar" onClick={() => adicionarAoCarrinho(item)}>Adicionar</button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="sem-resultados"><p>Nenhum artigo encontrado.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Loja;