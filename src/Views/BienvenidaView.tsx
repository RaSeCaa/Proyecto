import React, { useState, useEffect } from 'react';
import './BienvenidaView.css';

interface BienvenidaProps {
  onLoginExitoso: (email: string) => void;
  onEntrarComoInvitado: () => void;
}

export const BienvenidaView: React.FC<BienvenidaProps> = ({
  onLoginExitoso,
  onEntrarComoInvitado
}) => {
  const [pestaña, setPestaña] = useState<'login' | 'registro'>('login');
  
  // Estados para los campos de texto
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  
  // Estados de control del sistema
  const [captchaGenerado, setCaptchaGenerado] = useState('');
  const [fuerzaPassword, setFuerzaPassword] = useState<'débil' | 'intermedio' | 'fuerte' | ''>('');
  const [procesando, setProcesando] = useState(false);

  // Generar CAPTCHA local aleatorio
  const generarNuevoCaptcha = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    setCaptchaGenerado(num.toString());
    setCaptchaInput('');
  };

  useEffect(() => {
    generarNuevoCaptcha();
  }, [pestaña]);

  // Validación de fuerza en tiempo real (Mínimo 8 caracteres)
  useEffect(() => {
    if (!password) {
      setFuerzaPassword('');
      return;
    }
    if (password.length < 8) {
      setFuerzaPassword('débil');
      return;
    }
    const tieneLetras = /[a-zA-Z]/.test(password);
    const tieneNumeros = /\d/.test(password);

    if (tieneLetras && tieneNumeros) {
      setFuerzaPassword('fuerte');
    } else {
      setFuerzaPassword('intermedio');
    }
  }, [password]);

  // 🔐 ENVIAR DATOS PARA INICIAR SESIÓN (Lectura de la DB)
const manejarLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (captchaInput !== captchaGenerado) {
    alert("⚠️ Código CAPTCHA incorrecto. Intenta nuevamente.");
    generarNuevoCaptcha();
    return;
  }

  try {
    setProcesando(true);
    
    // Enviamos un POST directo al controlador de NestJS
    const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/login-operador`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: email.trim().toLowerCase(), // Ajustado a la columna 'correo' de tu DB
        contrasena: password                // Ajustado a la columna 'contrasena' de tu DB
      })
    });

    if (!respuesta.ok) {
      throw new Error("Credenciales inválidas");
    }

    
    // Si la respuesta es exitosa, le pasamos el correo a la app principal
    onLoginExitoso(email);

  } catch (error) {
    alert("⚠️ El correo o la contraseña no son correctos, o el backend rechazó la petición.");
    generarNuevoCaptcha();
  } finally {
    setProcesando(false);
  }
};

// 📝 EXPLICACIÓN DEL REGISTRO 
// 📝 ENVIAR DATOS PARA CREAR CUENTA EN NESTJS
  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      return alert("⚠️ La contraseña debe tener al menos 8 caracteres.");
    }
    if (password !== confirmarPassword) {
      return alert("⚠️ Las contraseñas no coinciden.");
    }
    if (fuerzaPassword === 'débil') {
      return alert("⚠️ Contraseña insegura. Por favor combina letras y números.");
    }

    try {
      setProcesando(true);

      // Enviamos la petición POST a la nueva ruta de NestJS
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: email.trim().toLowerCase(), // Usamos 'correo' como espera tu DB
          contrasena: password                // Usamos 'contrasena' como espera tu DB
        })
      });

      if (respuesta.ok) {
        alert("🎉 ¡Registro exitoso! Tus datos se han guardado en MySQL. Ahora puedes iniciar sesión.");
        setPestaña('login');
        setEmail('');
        setPassword('');
        setConfirmarPassword('');
      } else {
        const errorData = await respuesta.json();
        alert(`⚠️ No se pudo registrar: ${errorData.message || 'Error del servidor'}`);
      }
    } catch (error) {
      alert("⚠️ Error de conexión con el servidor backend NestJS.");
    } finally {
      setProcesando(false);
    }
  };

  // 💡 AQUÍ ESTÁ EL CAMBIO: Declaramos correctamente la variable booleana de control
  const lasContraseniasCoinciden = password.length >= 8 && password === confirmarPassword;

  return (
    <div className="bienvenida-layout">
      
      {/* PANEL BRANDING */}
      <div className="layout-panel-branding">
        <div className="branding-wrapper">
          <h1 className="brand-logo-huge">CÓDICE STORE</h1>
          <p className="brand-subtitle">Distribución Segura de Licencias</p>
          <p className="brand-text">
            Autenticación blindada y monitoreo antifraude continuo para tus perfiles digitales y pantallas de streaming.
          </p>
        </div>
      </div>

      {/* PANEL FORMULARIO */}
      <div className="layout-panel-auth">
        <div className="mobile-only-logo">
          <h2>CÓDICE STORE</h2>
        </div>

        <div className="auth-card">
          <div className="auth-tabs-nav">
            <button 
              className={`nav-tab-btn ${pestaña === 'login' ? 'is-active' : ''}`}
              onClick={() => setPestaña('login')}
            >
              Iniciar Sesión
            </button>
            <button 
              className={`nav-tab-btn ${pestaña === 'registro' ? 'is-active' : ''}`}
              onClick={() => setPestaña('registro')}
            >
              Registrarse
            </button>
          </div>

          {pestaña === 'login' ? (
            <form onSubmit={manejarLogin} className="interactive-form">
              <div className="form-field">
                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="nombre@ejemplo.com"
                />
              </div>
              
              <div className="form-field">
                <label>Contraseña</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                />
              </div>

              <div className="captcha-wrapper-box">
                <label>Código de Validación</label>
                <div className="captcha-flex-row">
                  <div className="captcha-display-code">{captchaGenerado}</div>
                  <button type="button" className="refresh-code-btn" onClick={generarNuevoCaptcha}>🔄</button>
                  <input 
                    type="text" 
                    value={captchaInput} 
                    onChange={(e) => setCaptchaInput(e.target.value)} 
                    placeholder="Código" 
                    required
                  />
                </div>
              </div>

              <button type="submit" className="action-main-btn btn-color-login" disabled={procesando}>
                {procesando ? 'Verificando...' : 'Entrar al Sistema'}
              </button>
            </form>
          ) : (
            <form onSubmit={manejarRegistro} className="interactive-form">
              <div className="form-field">
                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="ejemplo@correo.com"
                />
              </div>
              
              <div className="form-field">
                <label>Contraseña</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="Mínimo 8 caracteres"
                />
                {fuerzaPassword && (
                  <span className={`strength-badge badge-${fuerzaPassword}`}>
                    Contraseña: {fuerzaPassword.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label>Confirmar Contraseña</label>
                <input 
                  type="password" 
                  value={confirmarPassword} 
                  onChange={(e) => setConfirmarPassword(e.target.value)} 
                  required 
                  placeholder="Repite tu contraseña"
                />
              </div>

              {/* Botón controlado de forma segura */}
              <button 
                type="submit" 
                className={`action-main-btn ${lasContraseniasCoinciden ? 'btn-registro-listo' : 'btn-registro-inactivo'}`} 
                disabled={!lasContraseniasCoinciden || procesando}
              >
                {procesando ? 'Guardando cuenta...' : 'Completar Registro'}
              </button>
            </form>
          )}

          <div className="guest-action-footer">
            <span className="guest-text">¿No tienes cuenta? </span>
            <button type="button" className="guest-link-btn" onClick={onEntrarComoInvitado}>
              Explorar como invitado
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};