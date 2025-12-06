// Importa as ferramentas da biblioteca 'react-router-dom' para gerir a navegação. 
//(por exemplo, o Link, cria botões que mudam de página sem recarregar o site)
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
//import da Loja.js
import Loja from "./pages/Loja";
//import do backoffice.js
import Backoffice from "./pages/Backoffice";
//import do app.css
import './App.css'; 


/* 
  1. O <BrowserRouter> permite a navegação sem recarregar a página.
  2. A <nav> (barra de navegação) fica sempre visível no topo, não importa a página.
  3. O <Routes> irá mudar entre o Backoffice e a Loja quando lhe é pedido sem ter de recarregar a página.
*/
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          <Link to="/" className="nav-link brand-logo">VOKA</Link>
          <Link to="/admin" className="nav-link">⚙️ Backoffice</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Loja />} />
          <Route path="/admin" element={<Backoffice />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;