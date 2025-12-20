// Importa o useState e useEffect para gerir estados e efeitos do componente
import { useState, useEffect } from "react";

// Componente principal da página de administração (Backoffice)
function Backoffice() {
  
  // Guarda a lista completa de produtos vindos da API
  const [produtos, setProdutos] = useState([]);
  
  // Guarda a lista de categorias disponíveis (Roupa, Tecnologia, Casa, etc)
  const [categorias, setCategorias] = useState([]); 
  
  // Controla se o administrador está autenticado (true = pode aceder, false = tem de fazer login)
  const [login, setLogin] = useState(false);
  
  // Guarda a password que o utilizador escreve no campo de login
  const [senhaInput, setSenhaInput] = useState("");
  
  // Guarda os dados do novo produto que está a ser criado (formulário)
  const [novoProduto, setNovoProduto] = useState({
    nome: "",        // Nome do produto
    preco: "",       // Preço do produto
    imagem: "",      // URL ou nome do ficheiro da imagem
    categoria: "",   // Categoria base (ex: "Roupa")
    descricao: ""    // Descrição detalhada do produto
  });
  
  // Guarda o género selecionado (Mulher/Homem) quando a categoria é roupa
  const [generoSelecionado, setGeneroSelecionado] = useState("");

  // URL base da API Sheety
  const BASE_URL = "https://api.sheety.co/2672044352a1ba5cc22dc0fb03895bdf/lojaOnline";
  
  // URL específico para a tabela de produtos
  const URL_PRODUTOS = `${BASE_URL}/produtos`;
  
  // URL específico para a tabela de categorias
  const URL_CATEGORIAS = `${BASE_URL}/categorias`;

  /* Vai buscar os produtos e categorias à API e guarda-os nos estados correspondentes.
     Esta função é chamada sempre que o admin faz login ou cria/apaga um produto. */
  const carregarDados = () => {
    // Busca os produtos à API
    fetch(URL_PRODUTOS)
      .then(res => res.json()) // Converte a resposta em JSON
      .then(data => setProdutos(data.produtos || data.Produtos || [])); // Guarda os produtos (com sistema de segurança triplo)
    
    // Busca as categorias à API
    fetch(URL_CATEGORIAS)
      .then(res => res.json()) // Converte a resposta em JSON
      .then(data => setCategorias(data.categorias || data.Categorias || [])); // Guarda as categorias
  };

  /* useEffect observa a variável 'login'. Sempre que ela mudar para 'true', 
     carrega automaticamente os dados da API. */
  useEffect(() => { 
    if(login) carregarDados(); 
  }, [login]); // O [login] significa "executa isto quando 'login' mudar"

  /* Verifica se a password introduzida está correta.
     Se sim, permite acesso ao backoffice. Se não, mostra um alerta. */
  const verificarLogin = (e) => {
    e.preventDefault(); // Evita que o formulário recarregue a página
    
    // Compara a password com a password correta ("admin123")
    if (senhaInput === "admin123") {
      setLogin(true); // Autentica o utilizador
    } else {
      alert("Password errada!"); // Mostra erro se a password estiver errada
    }
  };

  /* Apaga um produto da base de dados através da API.
     Pede confirmação antes de apagar para evitar acidentes. */
  const apagarProduto = (id) => {
    // Mostra uma caixa de confirmação antes de apagar
    if(!window.confirm("Tens a certeza?")) return; // Se cancelar, sai da função
    
    // Envia pedido DELETE para a API para remover o produto
    fetch(`${URL_PRODUTOS}/${id}`, { method: "DELETE" })
      .then(() => {
        alert("Produto apagado!"); // Confirma que foi apagado
        carregarDados(); // Atualiza a lista de produtos
      });
  };

  /* Algumas categorias como "Tecnologia" e "Casa" não têm género.
     Esta variável verifica se a categoria atual é uma dessas. */
  const isCategoriaNeutra = ["Tecnologia", "Casa"].includes(novoProduto.categoria);

  /* Valida o formulário e envia o novo produto para a API.
     Faz várias verificações antes de enviar. */
  const criarProduto = (e) => {
    e.preventDefault(); // Evita que o formulário recarregue a página
    
    // Verifica se foi escolhida uma categoria
    if (!novoProduto.categoria) {
      alert("⚠️ Tens de escolher uma Categoria!");
      return; // Pára aqui se não tiver categoria
    }
    
    // Se não for categoria neutra, tem de escolher o género
    if (!isCategoriaNeutra && !generoSelecionado) {
      alert("⚠️ Para Roupa, tens de escolher o Género!");
      return; // Pára aqui se for roupa e não tiver género
    }

    /* Se for categoria neutra (ex: Tecnologia), usa só o nome da categoria.
       Se for roupa, junta o género com a categoria (ex: "Mulher Roupa"). */
    let categoriaFinal = novoProduto.categoria;
    if (!isCategoriaNeutra) {
      categoriaFinal = `${generoSelecionado} ${novoProduto.categoria}`;
    }

    // Cria uma cópia do produto com a categoria final correta
    const produtoParaEnviar = { ...novoProduto, categoria: categoriaFinal };

    // Faz um pedido POST para criar o novo produto na base de dados
    fetch(URL_PRODUTOS, {
      method: "POST", // Método POST = criar novo registo
      headers: { "Content-Type": "application/json" }, // Diz à API que está a enviar JSON
      body: JSON.stringify({ produto: produtoParaEnviar }) // Converte o objeto em texto JSON
    })
    .then(() => {
      alert("✅ Produto criado com sucesso!"); // Confirma o sucesso
      carregarDados(); // Atualiza a lista de produtos
      
      // Limpa o formulário para criar um novo produto
      setNovoProduto({ nome: "", preco: "", imagem: "", categoria: "", descricao: "" });
      setGeneroSelecionado(""); // Limpa também o género selecionado
    });
  };

  /* Se 'login' for false, mostra apenas o formulário de login.
     O resto da página de administração só aparece depois de fazer login. */
  if (!login) {
    return (
      <div className="login-container">
        {/* Cartão centralizado com o formulário de login */}
        <div className="admin-card" style={{maxWidth: '400px', margin: '0 auto', textAlign: 'center'}}>
          <h3>🔐 Área Reservada</h3>
          
          {/* Formulário de login */}
          <form onSubmit={verificarLogin}>
            {/* Campo de password */}
            <input 
              className="admin-input"
              type="password" 
              value={senhaInput} 
              onChange={(e) => setSenhaInput(e.target.value)} 
              style={{marginBottom: '15px'}}
            />
            {/* Botão para submeter o login */}
            <button type="submit" className="btn-gravar">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  /* Início da página de administração (Backoffice)
     Só é mostrado se o login for bem-sucedido */
  return (
    <div className="admin-container">
      
      {/*Cabeçalho com título e botão de sair*/}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h1>Gestão de Produtos</h1>
        {/* Botão para fazer logout (volta ao ecrã de login) */}
        <button onClick={() => setLogin(false)} className="btn-sair">Sair 🚪</button>
      </div>

      {/*Secção: Formulário para adicionar novo produto*/}
      <div className="admin-card">
        <h3>➕ Adicionar Novo Produto</h3>
        
        {/* Formulário com grelha de 2 colunas (form-grid definido no CSS) */}
        <form onSubmit={criarProduto} className="form-grid">
          
          {/* Campo: Nome do Produto */}
          <div className="input-group">
            <label>Nome do Artigo</label>
            <input 
              className="admin-input" 
              required //Campo que tem de ser obrigatoriamente preenchido
              value={novoProduto.nome} 
              onChange={(e) => setNovoProduto({...novoProduto, nome: e.target.value})} 
            />
          </div>
          
          {/* Campo: Preço do Produto */}
          <div className="input-group">
            <label>Preço (€)</label>
            <input 
              className="admin-input" 
              type="number" 
              required //Campo que tem de ser obrigatoriamente preenchido
              value={novoProduto.preco} 
              onChange={(e) => setNovoProduto({...novoProduto, preco: e.target.value})} 
            />
          </div>
          
          {/* Campo: Categoria do Produto (dropdown) */}
          <div className="input-group">
            <label>Tipo de Peça / Categoria</label>
            <select 
              className="admin-select" 
              required //Campo que tem de ser obrigatoriamente preenchido
              value={novoProduto.categoria} 
              onChange={(e) => setNovoProduto({...novoProduto, categoria: e.target.value})}
            >
              {/* Opção por defeito */}
              <option value="">-- Selecionar Categoria --</option>
              
              {/* Percorre a lista de categorias e cria uma opção para cada */}
              {categorias.map((cat) => ( 
                <option key={cat.id} value={cat.nome}>{cat.nome}</option> 
              ))}
            </select>
          </div>
          
          {/* Campo: Género (apenas para categorias de roupa) */}
          <div className="input-group">
            {/* O label muda de cor conforme a categoria seja neutra ou não */}
            <label style={{color: isCategoriaNeutra ? '#ccc' : '#64748b'}}>
              Género {isCategoriaNeutra ? "(Não aplicável)" : "(Obrigatório)"}
            </label>
            <select 
              className="admin-select" 
              value={generoSelecionado} 
              onChange={(e) => setGeneroSelecionado(e.target.value)} 
              disabled={isCategoriaNeutra} // Desativa o campo se for categoria neutra
              style={{
                backgroundColor: isCategoriaNeutra ? '#e2e8f0' : '#f8fafc', 
                cursor: isCategoriaNeutra ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="">-- Selecionar --</option>
              <option value="Mulher">👩 Mulher</option>
              <option value="Homem">👨 Homem</option>
            </select>
          </div>
          
          {/* Campo: URL ou nome da imagem (ocupa 2 colunas) */}
          <div className="input-group" style={{gridColumn: 'span 2'}}>
            <label>Imagem (Nome local OU Link)</label>
            <input 
              className="admin-input" 
              required //Campo que tem de ser obrigatoriamente preenchido
              value={novoProduto.imagem} 
              onChange={(e) => setNovoProduto({...novoProduto, imagem: e.target.value})} 
            />
          </div>
          
          {/* Campo: Descrição do produto (textarea - ocupa 2 colunas) */}
          <div className="input-group" style={{gridColumn: 'span 2'}}>
            <label>Descrição Detalhada</label>
            <textarea 
              className="admin-input" 
              required //Campo que tem de ser obrigatoriamente preenchido
              value={novoProduto.descricao} 
              onChange={(e) => setNovoProduto({...novoProduto, descricao: e.target.value})} 
            />
          </div>
          
          {/* Botão para submeter o formulário e criar o produto */}
          <button type="submit" className="btn-gravar">Gravar Produto</button>
        </form>
      </div>

      {/*Secção: Tabela com todos os produtos existentes*/}
      <div className="tabela-container">
        <table className="tabela-admin">
          
          {/* Cabeçalho da tabela */}
          <thead>
            <tr>
              <th>#</th> {/* Número de ordem */}
              <th>Nome</th> {/* Nome do produto */}
              <th>Categoria Final</th> {/* Categoria completa (com género se aplicável) */}
              <th>Preço</th> {/* Preço do produto */}
              <th>Ações</th> {/* Botão de remover */}
            </tr>
          </thead>
          
          {/* Corpo da tabela com a lista de produtos */}
          <tbody>
            {/* Percorre todos os produtos e cria uma linha para cada um */}
            {produtos.map((p, index) => (
              <tr key={p.id}>
                {/* Coluna 1: Número de ordem (index começa em 0, por isso +1) */}
                <td>{index + 1}</td>
                
                {/* Coluna 2: Nome do produto em negrito */}
                <td><strong>{p.nome}</strong></td>
                
                {/* Coluna 3: Categoria com estilo de etiqueta azul */}
                <td>
                  <span style={{
                    backgroundColor: '#e0f2fe', 
                    color: '#0369a1', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem', 
                    fontWeight: 'bold'
                  }}>
                    {p.categoria}
                  </span>
                </td>
                
                {/* Coluna 4: Preço com símbolo € */}
                <td>{p.preco} €</td>
                
                {/* Coluna 5: Botão para apagar o produto */}
                <td>
                  <button 
                    className="btn-remover" 
                    onClick={() => apagarProduto(p.id)}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Backoffice;