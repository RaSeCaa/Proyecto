import { useState } from 'react';
import './App.css'; 

import { Footer } from './components/Footer';
import { BienvenidaView } from './Views/BienvenidaView';
import { TiendaView } from './Views/TiendaView'; 

function App() {
  const [entorno, setEntorno] = useState<'bienvenida' | 'tienda'>('bienvenida');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inputEmail, setInputEmail] = useState('');

  const manejarLoginConExito = (email: string) => {
    setIsLoggedIn(true);
    setInputEmail(email);
    setEntorno('tienda');
  };

  const manejarInvitado = () => {
    setIsLoggedIn(false);
    setInputEmail('');
    setEntorno('tienda');
  };

  const manejarCerrarSesionGlobal = () => {
    setIsLoggedIn(false);
    setInputEmail('');
    setEntorno('bienvenida');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', display: 'flex', flexDirection: 'column' }}>
      
      {/* CONTROL DE ENTORNOS PRINCIPALES */}
      {entorno === 'bienvenida' && (
        <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <BienvenidaView 
            onLoginExitoso={manejarLoginConExito} 
            onEntrarComoInvitado={manejarInvitado} 
          />
        </main>
      )}

      {entorno === 'tienda' && (
        <TiendaView 
          isLoggedIn={isLoggedIn}
          inputEmail={inputEmail}
          onExigirLogin={manejarCerrarSesionGlobal}
          onCerrarSesion={manejarCerrarSesionGlobal}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;