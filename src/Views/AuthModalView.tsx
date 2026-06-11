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
  // Estado para alternar entre formulario de 'login' o 'registro' en la columna derecha
  const [pestaña, setPestaña] = useState<'login' | 'registro'>('login');

  // Campos de formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  
  // Estados de control requeridos por el docente
  const [captchaGenerado, setCaptchaGenerado] = useState('');
  const [fuerzaPassword, setFuerzaPassword] = useState<'débil' | 'intermedio' | 'fuerte' | ''>('');
  const [procesando, setProcesando] = useState(false);

  // 🎲 Generar un CAPTCHA numérico aleatorio al cargar o fallar
  const generarNuevoCaptcha = () => {
    const num = Math.floor(1000 + Math.random() * 9000); // Código de 4 dígitos
    setCaptchaGenerado(num.toString());
    setCaptchaInput('');
  };

  useEffect(() => {
    generarNuevoCaptcha();
  }, [pestaña]);

  // 📊 REQUISITO 10: Validar la fuerza de la contraseña en tiempo real
  useEffect(() => {
    if (!password) {
      setFuerzaPassword('');
      return;
    }
    if (password.length < 5) {
      setFuerzaPassword('débil');
    } else if (password.length >= 5 && password.length < 8) {
      setFuerzaPassword('intermedio');
    } else {
      // Si tiene más de 8 letras y combina números o caracteres
      const tieneNumeros = /\d/.test(password);
      if (tieneNumeros) {
        setFuerzaPassword('fuerte');
      } else {
        setFuerzaPassword('intermedio');
      }
    }
  }, [password]);

  // 🔐 MANEJAR LOGIN (CON CAPTCHA - REQUISITO 9)
  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de CAPTCHA
    if (captchaInput !== captchaGenerado) {
      alert("⚠️ El código CAPTCHA es incorrecto. Intenta de nuevo.");
      generarNuevoCaptcha();
      return;
    }

    try {
      setProcesando(true);
      const respuesta = await fetch('http://localhost:3000/usuarios');
      if (!respuesta.ok) throw new Error("Error de conexión.");
      const usuarios = await respuesta.json();

      const usuario = usuarios.find(
        (u: any) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );

      if (usuario) {
        alert("¡Ingreso correcto!");
        onLoginExitoso(usuario.email);
      } else {
        alert("⚠️ Credenciales incorrectas.");
        generarNuevoCaptcha();
      }
    } catch (error) {
      alert("Error al conectar con el servidor.");
    } finally {
      setProcesando(false);
    }
  };

  // 📝 MANEJAR REGISTRO (CON VALIDACIONES - REQUISITO 6 Y 10)
  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmarPassword) {
      return alert("⚠️ Las contraseñas no coinciden.");
    }
    if (fuerzaPassword === 'débil') {
      return alert("⚠️ Por seguridad, el docente exige que la contraseña no sea 'débil'. Usa más de 5 caracteres.");
    }

    try {
      setProcesando(true);
      const verificarRes = await fetch('http://localhost:3000/usuarios');
      const usuarios = await verificarRes.json();
      
      if (usuarios.some((u: any) => u.email.toLowerCase() === email.trim().toLowerCase())) {
        return alert("⚠️ Este correo ya existe.");
      }

      const nuevoUsuario = {
        email: email.trim(),
        password: password,
        rol: 'cliente',
        qr_recaudacion: null
      };

      const respuesta = await fetch('http://localhost:3000/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoUsuario)
      });

      if (respuesta.ok) {
        alert("🎉 ¡Cuenta registrada con éxito! Ya puedes iniciar sesión.");
        setPestaña('login');
        setPassword('');
        setConfirmarPassword('');
      }
    } catch (error) {
      alert("Error en el servidor de registro.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="bienvenida-split-container">
      
      {/* SECCIÓN IZQUIERDA: Identidad Corporativa de la marca */}
      <div className="bienvenida-panel-info">
        <div className="info-content">
          <h1 className="bienvenida-logo">CÓDICE STORE</h1>
          <p className="bienvenida-tagline">Distribución Segura de Licencias y Perfiles Digitales</p>
          <p className="bienvenida-reseña">
            Acceso estable y optimizado para tus servicios de streaming favoritos. 
            Garantizamos monitoreo constante y soporte antifraude directo para cada una de tus pantallas.
          </p>
          
          <div className="invitado-box">
            <p>¿Solo quieres echar un vistazo?</p>
            <button className="btn-enlace-invitado" onClick={onEntrarComoInvitado}>
              👀 Entrar al catálogo como Invitado
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Formulario Integrado (No más modales perdidos) */}
      <div className="bienvenida-panel-form">
        <div className="form-box">
          <div className="form-tabs">
            <button 
              className={`tab-btn ${pestaña === 'login' ? 'active' : ''}`} 
              onClick={() => setPestaña('login')}
            >
              Iniciar Sesión
            </button>
            <button 
              className={`tab-btn ${pestaña === 'registro' ? 'active' : ''}`} 
              onClick={() => setPestaña('registro')}
            >
              Registrarse
            </button>
          </div>

          {pestaña === 'login' ? (
            /* FORMULARIO DE INICIO DE SESIÓN */
            <form onSubmit={manejarLogin} className="auth-form">
              <h2>Bienvenido de nuevo</h2>
              <div className="input-group">
                <label>Correo Electrónico</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="correo@ejemplo.com"/>
              </div>
              <div className="input-group">
                <label>Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"/>
              </div>

              {/* REQUISITO 9: CAPTCHA */}
              <div className="captcha-container">
                <label>Código de Seguridad (CAPTCHA)</label>
                <div className="captcha-row">
                  <span className="captcha-codigo">{captchaGenerado}</span>
                  <button type="button" className="btn-refresh-captcha" onClick={generarNuevoCaptcha}>🔄</button>
                  <input 
                    type="text" 
                    value={captchaInput} 
                    onChange={(e) => setCaptchaInput(e.target.value)} 
                    placeholder="Escribe el código" 
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-auth-submit" disabled={procesando}>
                {procesando ? 'Verificando...' : 'Ingresar a la cuenta'}
              </button>
            </form>
          ) : (
            /* FORMULARIO DE REGISTRO */
            <form onSubmit={manejarRegistro} className="auth-form">
              <h2>Crear tu cuenta cliente</h2>
              <div className="input-group">
                <label>Correo Electrónico</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu-correo@gmail.com"/>
              </div>
              <div className="input-group">
                <label>Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Crea una contraseña"/>
                
                {/* REQUISITO 10: Medidor de fuerza visual dinámico */}
                {fuerzaPassword && (
                  <div className={`medidor-fuerza ${fuerzaPassword}`}>
                    Contraseña {fuerzaPassword === 'débil' ? '🔴 Débil' : fuerzaPassword === 'intermedio' ? '🟡 Intermedia' : '🟢 Fuerte y Segura'}
                  </div>
                )}
              </div>
              <div className="input-group">
                <label>Confirmar Contraseña</label>
                <input type="password" value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} required placeholder="Repite tu contraseña"/>
              </div>

              <button type="submit" className="btn-auth-submit btn-register" disabled={procesando}>
                {procesando ? 'Registrando...' : 'Confirmar Registro'}
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
};