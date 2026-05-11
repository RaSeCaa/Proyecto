import React from 'react';
import './Navbar.css'; // Si decides crear un archivo CSS separado

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        {/* Aquí irá el logo más adelante */}
        <span>Logo</span>
      </div>
      <div className="navbar-buttons">
        <button className="nav-button">Inicio</button>
        <button className="nav-button">Acerca de</button>
        <button className="nav-button">Contacto</button>
      </div>
      <div className="navbar-user">
        {/* Aquí irá el nombre del usuario más adelante */}
        <span>Usuario</span>
      </div>
    </nav>
  );
};

export default Navbar;