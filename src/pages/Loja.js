import { useState, useEffect } from "react";

function Loja() {
  const [produtos, setProdutos] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [loading, setLoading] = useState(true);
  const [meusLikes, setMeusLikes] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");

  const [carrinho, setCarrinho] = useState([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);

  const API_URL = "https://api.sheety.co/2672044352a1ba5cc22dc0fb03895bdf/lojaOnline/produtos"; 

  const carregarDados = () => {
    setLoading(true);
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) throw new Error("Erro na ligação à API");
        return response.json();
      })
      .then((data) => {
        setProdutos(data.produtos || data.Produtos || []); 
        setLoading(false);
      })
      .catch((erro) => {
        console.error("ERRO AO CARREGAR:", erro);
        setLoading(false);
      });
  };

  useEffect(() => {
    carregarDados();
    const likesGuardados = JSON.parse(localStorage.getItem("lista_likes_usuario")) || [];
    setMeusLikes(likesGuardados);
  }, []);

  const alternarLike = (produto) => {
    const jaGostei = meusLikes.includes(produto.id);
    let novosLikes;
    let novaListaMeusLikes;

    if (jaGostei) {
      novosLikes = (produto.likes || 0) - 1;
      if (novosLikes < 0) novosLikes = 0;
      novaListaMeusLikes = meusLikes.filter(id => id !== produto.id);
    } else {
      novosLikes = (produto.likes || 0) + 1;
      novaListaMeusLikes = [...meusLikes, produto.id];
    }

    setMeusLikes(novaListaMeusLikes);
    const listaAtualizada = produtos.map(p => 
      p.id === produto.id ? { ...p, likes: novosLikes } : p
    );
    setProdutos(listaAtualizada);
    localStorage.setItem("lista_likes_usuario", JSON.stringify(novaListaMeusLikes));

    fetch(`${API_URL}/${produto.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produto: { likes: novosLikes } })
    });
  };

  const adicionarAoCarrinho = (produto) => {
    setCarrinho([...carrinho, produto]);
    setMostrarCarrinho(true);
  };

  const removerDoCarrinho = (indexParaRemover) => {
    const novoCarrinho = carrinho.filter((_, index) => index !== indexParaRemover);
    setCarrinho(novoCarrinho);
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + Number(item.preco || 0), 0);
  };

  const produtosFiltrados = produtos.filter((produto) => {
    const nomeSeguro = (produto.nome || "").toLowerCase();
    const categoriaSegura = (produto.categoria || "").toLowerCase();
    const pesquisaSegura = pesquisa.toLowerCase();

    const matchPesquisa = nomeSeguro.includes(pesquisaSegura);
    
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

    return matchPesquisa && matchCategoria;
  });

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