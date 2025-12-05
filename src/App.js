
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Loja from "./pages/Loja";
import Backoffice from "./pages/Backoffice";
import './App.css'; 

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