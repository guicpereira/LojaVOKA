import { useState, useEffect } from "react";

function Backoffice() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]); 
  const [login, setLogin] = useState(false);
  const [senhaInput, setSenhaInput] = useState("");
  
  const [novoProduto, setNovoProduto] = useState({
    nome: "", preco: "", imagem: "", categoria: "", descricao: ""
  });
  const [generoSelecionado, setGeneroSelecionado] = useState("");

  const BASE_URL = "https://api.sheety.co/2672044352a1ba5cc22dc0fb03895bdf/lojaOnline";
  const URL_PRODUTOS = `${BASE_URL}/produtos`;
  const URL_CATEGORIAS = `${BASE_URL}/categorias`;

  const carregarDados = () => {
    fetch(URL_PRODUTOS).then(res => res.json()).then(data => setProdutos(data.produtos || data.Produtos || []));
    fetch(URL_CATEGORIAS).then(res => res.json()).then(data => setCategorias(data.categorias || data.Categorias || []));
  };

  useEffect(() => { if(login) carregarDados(); }, [login]);

  const verificarLogin = (e) => {
    e.preventDefault();
    if (senhaInput === "admin123") setLogin(true);
    else alert("Password errada!");
  };

  const apagarProduto = (id) => {
    if(!window.confirm("Tens a certeza?")) return;
    fetch(`${URL_PRODUTOS}/${id}`, { method: "DELETE" }).then(() => {
      alert("Produto apagado!");
      carregarDados();
    });
  };

  const isCategoriaNeutra = ["Tecnologia", "Casa"].includes(novoProduto.categoria);

  const criarProduto = (e) => {
    e.preventDefault();
    if (!novoProduto.categoria) {
      alert("⚠️ Tens de escolher uma Categoria!");
      return;
    }
    if (!isCategoriaNeutra && !generoSelecionado) {
      alert("⚠️ Para Roupa, tens de escolher o Género!");
      return;
    }

    let categoriaFinal = novoProduto.categoria;
    if (!isCategoriaNeutra) {
      categoriaFinal = `${generoSelecionado} ${novoProduto.categoria}`;
    }

    const produtoParaEnviar = { ...novoProduto, categoria: categoriaFinal };

    fetch(URL_PRODUTOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produto: produtoParaEnviar })
    })
    .then(() => {
      alert("✅ Produto criado com sucesso!");
      carregarDados();
      setNovoProduto({ nome: "", preco: "", imagem: "", categoria: "", descricao: "" });
      setGeneroSelecionado("");
    });
  };

  if (!login) {
    return (
      <div className="login-container">
        <div className="admin-card" style={{maxWidth: '400px', margin: '0 auto', textAlign: 'center'}}>
          <h3>🔐 Área Reservada</h3>
          <form onSubmit={verificarLogin}>
            <input 
              className="admin-input"
              type="password" placeholder="" 
              value={senhaInput} 
              onChange={(e) => setSenhaInput(e.target.value)} 
              style={{marginBottom: '15px'}}
            />
            <button type="submit" className="btn-gravar">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h1>Gestão de Produtos</h1>
        <button onClick={() => setLogin(false)} className="btn-sair">Sair 🚪</button>
      </div>

      <div className="admin-card">
        <h3>➕ Adicionar Novo Produto</h3>
        <form onSubmit={criarProduto} className="form-grid">
          <div className="input-group">
            <label>Nome do Artigo</label>
            <input className="admin-input" placeholder="" required 
              value={novoProduto.nome} onChange={(e) => setNovoProduto({...novoProduto, nome: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Preço (€)</label>
            <input className="admin-input" placeholder="" type="number" required 
              value={novoProduto.preco} onChange={(e) => setNovoProduto({...novoProduto, preco: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Tipo de Peça / Categoria</label>
            <select className="admin-select" required value={novoProduto.categoria} onChange={(e) => setNovoProduto({...novoProduto, categoria: e.target.value})}>
              <option value="">-- Selecionar Categoria --</option>
              {categorias.map((cat) => ( <option key={cat.id} value={cat.nome}>{cat.nome}</option> ))}
            </select>
          </div>
          <div className="input-group">
            <label style={{color: isCategoriaNeutra ? '#ccc' : '#64748b'}}>Género {isCategoriaNeutra ? "(Não aplicável)" : "(Obrigatório)"}</label>
            <select className="admin-select" value={generoSelecionado} onChange={(e) => setGeneroSelecionado(e.target.value)} disabled={isCategoriaNeutra} style={{backgroundColor: isCategoriaNeutra ? '#e2e8f0' : '#f8fafc', cursor: isCategoriaNeutra ? 'not-allowed' : 'pointer'}}>
              <option value="">-- Selecionar --</option>
              <option value="Mulher">👩 Mulher</option>
              <option value="Homem">👨 Homem</option>
            </select>
          </div>
          <div className="input-group" style={{gridColumn: 'span 2'}}>
            <label>Imagem (Nome local OU Link)</label>
            <input className="admin-input" placeholder="" required 
              value={novoProduto.imagem} onChange={(e) => setNovoProduto({...novoProduto, imagem: e.target.value})} />
          </div>
          <div className="input-group" style={{gridColumn: 'span 2'}}>
            <label>Descrição Detalhada</label>
            <textarea className="admin-input" placeholder="" required 
              value={novoProduto.descricao} onChange={(e) => setNovoProduto({...novoProduto, descricao: e.target.value})} />
          </div>
          <button type="submit" className="btn-gravar">Gravar Produto</button>
        </form>
      </div>

      <div className="tabela-container">
        <table className="tabela-admin">
          <thead>
            <tr><th>#</th><th>Nome</th><th>Categoria Final</th><th>Preço</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {produtos.map((p, index) => (
              <tr key={p.id}>
                <td>{index + 1}</td>
                <td><strong>{p.nome}</strong></td>
                <td><span style={{backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>{p.categoria}</span></td>
                <td>{p.preco} €</td>
                <td><button className="btn-remover" onClick={() => apagarProduto(p.id)}>Remover</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Backoffice;