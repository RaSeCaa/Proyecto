import './App.css'; 
import { useState } from 'react';

function App() {
  // 1. EL CEREBRO: El estado para saber qué categoría mostrar
  const [categoria, setCategoria] = useState('todos');

  return (
    <div className="layout-principal">
      {/* NAVBAR COMPLETO */}
      <nav className="navbar-completo">
        {/* PISO 1: Logo y Usuario */}
        <div className="nav-superior">
          <div className="logo">LICENCIAS BOLIVIA</div>
          <div className="usuario-seccion">
            <button className="btn-usuario">Mi Cuenta 👤</button>
          </div>
        </div>

        {/* PISO 2: Categorías con filtros */}
        <div className="nav-inferior">
          <button onClick={() => setCategoria('todos')} className="link-cat">Ver Todo</button>
          <button onClick={() => setCategoria('windows')} className="link-cat">Windows</button>
          <button onClick={() => setCategoria('office')} className="link-cat">Office</button>
          <button onClick={() => setCategoria('antivirus')} className="link-cat">Antivirus</button>
          <button onClick={() => setCategoria('juegos')} className="link-cat">Juegos</button>
        </div>
      </nav>

      {/* CUERPO CON FILTRADO DINÁMICO */}
      <main className="contenedor-grid">
        
        {/* CAJA WINDOWS: Solo se muestra si es 'todos' o 'windows' */}
        {(categoria === 'todos' || categoria === 'windows') && (
          <div className="caja-producto">
            <div className="imagen-placeholder">
              <img src="https://lafrikileria.com/blog/wp-content/uploads/2022/08/gatos-famosos-instagram-princess-cheeto-900x506.jpg" alt="Windows 11" />
            </div>
            <h3>Windows 11 Pro</h3>
            <p className="precio">50 Bs</p>
            <button className="btn-comprar">Comprar Ahora</button>
          </div>
        )}

        {/* CAJA OFFICE: Solo se muestra si es 'todos' o 'office' */}
        {(categoria === 'todos' || categoria === 'office') && (
          <div className="caja-producto">
            <div className="imagen-placeholder">
              <img src="https://via.placeholder.com/150" alt="Office 2024" />
            </div>
            <h3>Office 2024</h3>
            <p className="precio">100 Bs</p>
            <button className="btn-comprar">Comprar Ahora</button>
          </div>
        )}

        {/* CAJA ANTIVIRUS: Solo se muestra si es 'todos' o 'antivirus' */}
        {(categoria === 'todos' || categoria === 'antivirus') && (
          <div className="caja-producto">
            <div className="imagen-placeholder">
              <img src="https://via.placeholder.com/150" alt="Antivirus" />
            </div>
            <h3>Kaspersky Antivirus</h3>
            <p className="precio">30 Bs</p>
            <button className="btn-comprar">Comprar Ahora</button>
          </div>
        )}

        {/* CAJA SOPORTE / JUEGOS */}
        {(categoria === 'todos' || categoria === 'juegos') && (
          <div className="caja-producto">
            <div className="imagen-placeholder">
              <img src="https://via.placeholder.com/150" alt="Soporte" />
            </div>
            <h3>Soporte Técnico</h3>
            <p className="precio">20 Bs</p>
            <button className="btn-comprar">Comprar Ahora</button>
          </div>
        )}

        
      </main>

      <main className="contenedor-principal">
  
  {/* SECCIÓN DE WINDOWS */}
  {(categoria === 'todos' || categoria === 'windows') && (
    <section className="seccion-categoria">
      <h2 className="titulo-seccion">Sistemas Operativos Windows</h2>
      <div className="contenedor-grid">
        <div className="caja-producto">...</div>
        <div className="caja-producto">...</div>
        {/* Aquí podrías poner un botón de "Ver más Windows" si tuvieras 20 cajas */}
      </div>
    </section>
  )}

  {/* SECCIÓN DE OFFICE */}
  {(categoria === 'todos' || categoria === 'office') && (
    <section className="seccion-categoria">
      <h2 className="titulo-seccion">Suites de Ofimática</h2>
      <div className="contenedor-grid">
        <div className="caja-producto">...</div>
      </div>
    </section>
  )}

</main>

    </div>
  );
}

export default App;
