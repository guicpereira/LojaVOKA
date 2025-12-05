// imports do react, do reactdom e dos ficheiros index.css e do app
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
/* 1. Ele procura a <div> com id="root" (que está no index.html da pasta public).
   2. Cria o root do site no tal <div>.
   3. Renderiza o componente principal <App /> lá dentro.
  
  Nota Importante: O <react.strictmode> foi ajuda da IA Gemini em que basicamente avisa de erros ou más práticas na consola enquanto programamos.
  Não afeta o site final.
*/
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);