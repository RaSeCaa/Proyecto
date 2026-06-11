import React from 'react';
import './Navbar.css';

// Definimos la estructura de datos que el Navbar está obligado a recibir desde App.tsx
interface NavbarProps {
  totalCarrito: number;
  nombreUsuario: string;
  onCambiarVista: (vista: string) => void;
  onCambiarCategoria: (categoria: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  totalCarrito, 
  nombreUsuario, 
  onCambiarVista, 
  onCambiarCategoria 
}) => {
  return (
    <header className="main-header">
      {/* BARRA SUPERIOR */}
      <div className="navbar-top">
        {/* Izquierda: Logo */}
        <div className="nav-logo-box" onClick={() => onCambiarVista('catalogo')}>
          <div className="logo-placeholder">GIF</div>
        </div>

        {/* Centro: Título de la tienda */}
        <div className="nav-title-box" onClick={() => onCambiarVista('catalogo')}>
          <h1>CÓDICE STORE</h1>
        </div>

        {/* Derecha: Carrito y Perfil */}
        <div className="nav-actions-box">
          <div className="nav-cart" onClick={() => onCambiarVista('carrito')}>
            <span className="cart-amount">{totalCarrito} Bs</span>
            <span className="cart-icon">🛒</span>
          </div>
          <div className="nav-user" onClick={() => onCambiarVista('usuario')}>
            <span>{nombreUsuario ? `৹${nombreUsuario}` : 'Usuario'}</span>
          </div>
        </div>
      </div>

      {/* BARRA INFERIOR DE CATEGORÍAS */}
      <nav className="navbar-bottom">
        <button className="category-link" onClick={() => { onCambiarVista('catalogo'); onCambiarCategoria('streaming'); }}>
          Streaming
        </button>
        <button className="category-link" onClick={() => { onCambiarVista('catalogo'); onCambiarCategoria('licencias'); }}>
          Licencias
        </button>
        <button className="category-link" onClick={() => { onCambiarVista('catalogo'); onCambiarCategoria('apps'); }}>
          Aplicaciones
        </button>
      </nav>
    </header>
  );
};
