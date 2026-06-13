import { useState, useEffect } from 'react';
import './UsuarioView.css';

interface UsuarioViewProps {
  emailUsuarioLogueado: string;
}

export const UsuarioView: React.FC<UsuarioViewProps> = ({ emailUsuarioLogueado }) => {
  const [pestañaActiva, setPestañaActiva] = useState<'cuentas' | 'seguridad'>('cuentas');
  const [misServicios, setMisServicios] = useState<any[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  // Estados del formulario de seguridad (Modificar contraseña de la tienda)

  const [passNueva, setPassNueva] = useState('');
  const [confirmarPass, setConfirmarPass] = useState('');
  const [fuerzaPassword, setFuerzaPassword] = useState<'débil' | 'intermedio' | 'fuerte' | ''>('');
  const [procesando, setProcesando] = useState(false);

  // 📥 Petición HTTP nativa con Fetch para traer los perfiles del usuario logueado
  useEffect(() => {
    const obtenerCompras = async () => {
      try {
        setCargando(true);
        const respuesta = await fetch(`http://localhost:3000/usuarios/mis-compras/${emailUsuarioLogueado}`);
        
        if (respuesta.ok) {
          const datos = await respuesta.json();
          setMisServicios(datos);
        } else {
          console.error("Error al obtener datos del backend");
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      } finally {
        setCargando(false);
      }
    };

    if (emailUsuarioLogueado) {
      obtenerCompras();
    }
  }, [emailUsuarioLogueado]);

  // Lógica de validación de contraseña (Idéntica a tu archivo original)
  useEffect(() => {
    if (!passNueva) {
      setFuerzaPassword('');
      return;
    }
    if (passNueva.length < 6) {
      setFuerzaPassword('débil');
    } else if (passNueva.length >= 6 && passNueva.length < 10) {
      const tieneLetras = /[a-zA-Z]/.test(passNueva);
      const tieneNumeros = /[0-9]/.test(passNueva);
      if (tieneLetras && tieneNumeros) {
        setFuerzaPassword('intermedio');
      } else {
        setFuerzaPassword('débil');
      }
    } else {
      setFuerzaPassword('fuerte');
    }
  }, [passNueva]);

  const cambiarPasswordTienda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passNueva.length < 8) return alert("⚠️ La nueva contraseña debe tener al menos 8 caracteres.");
    if (passNueva !== confirmarPass) return alert("⚠️ Las contraseñas no coinciden.");

    try {
      setProcesando(true);
      const respuesta = await fetch('http://localhost:3000/usuarios/actualizar/0', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: emailUsuarioLogueado.trim(),
          contrasena: passNueva
        })
      });

      if (respuesta.ok) {
        alert('🎉 ¡Contraseña modificada con éxito!');

        setPassNueva('');
        setConfirmarPass('');
      } else {
        alert('⚠️ No se pudo actualizar la contraseña.');
      }
    } catch (error) {
      alert("⚠️ Error de conexión con el servidor.");
    } finally {
      setProcesando(false);
    }
  };

  const obtenerColorMarca = (servicio: string) => {
    if (!servicio) return '#4444ff';
    const s = servicio.toLowerCase();
    if (s.includes('netflix')) return '#E50914';
    if (s.includes('crunchyroll')) return '#F47521';
    if (s.includes('disney')) return '#0063e5';
    if (s.includes('prime')) return '#00A8E1';
    return '#8a2be2';
  };

  return (
    <div className="usuario-container">
      <div className="usuario-nav-tabs">
        <button 
          className={`tab-btn ${pestañaActiva === 'cuentas' ? 'active' : ''}`}
          onClick={() => setPestañaActiva('cuentas')}
        >
          📋 Mis Cuentas Adquiridas
        </button>
        <button 
          className={`tab-btn ${pestañaActiva === 'seguridad' ? 'active' : ''}`}
          onClick={() => setPestañaActiva('seguridad')}
        >
          🔒 Seguridad de la Cuenta
        </button>
      </div>

      {pestañaActiva === 'cuentas' ? (
        <div className="tab-content">
          {cargando ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>Cargando tus credenciales de acceso...</p>
          ) : misServicios.length > 0 ? (
            <div className="cuentas-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              {misServicios.map((item) => {
                const color = obtenerColorMarca(item.servicio_nombre);
                return (
                  <div key={item.id} className="cuenta-card" style={{ borderLeft: `5px solid ${color}`, background: '#16161a', padding: '15px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: color, textTransform: 'uppercase' }}>
                        {item.servicio_nombre || 'STREAMING'} - Perfil: {item.perfil_nombre}
                      </h4>
                      <span style={{ backgroundColor: '#00e67622', color: '#00e676', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                        {item.estado || 'Activo'}
                      </span>
                    </div>
                    
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#aaa' }}>
                      Vencimiento: {item.fecha_vencimiento || 'No estipulado'}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', backgroundColor: '#0d0d14', padding: '10px', borderRadius: '4px' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#555', fontWeight: 'bold' }}>CORREO DE ACCESO</span>
                        <span style={{ fontSize: '0.9rem', color: '#fff' }}>{item.cuenta_correo}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#555', fontWeight: 'bold' }}>CONTRASEÑA</span>
                        <span style={{ fontSize: '0.9rem', color: '#fff' }}>{item.cuenta_contrasena}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#555', fontWeight: 'bold' }}>PIN DE PANTALLA</span>
                        <span style={{ fontSize: '1.1rem', color: '#00e676', fontWeight: 'bold' }}>{item.pin_pantalla || 'No requiere'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>
              Aún no tienes ningún perfil asignado a tu correo electrónico ({emailUsuarioLogueado}).
            </p>
          )}
        </div>
      ) : (
        <div className="config-form-box">
          <h3>Modificar contraseña de acceso</h3>
          <p className="form-subtitle">
            Cambiando la clave de la cuenta: <strong style={{ color: '#00e676' }}>{emailUsuarioLogueado}</strong>
          </p>
          
          <form onSubmit={cambiarPasswordTienda}>
            <div className="form-group">
              <label>Nueva Contraseña</label>
              <input 
                type="password" 
                required 
                value={passNueva} 
                onChange={(e) => setPassNueva(e.target.value)} 
                placeholder="Mínimo 8 caracteres" 
              />
              {fuerzaPassword && (
                <span className={`strength-badge badge-${fuerzaPassword}`} style={{ marginTop: '5px', display: 'inline-block' }}>
                  Contraseña: {fuerzaPassword.toUpperCase()}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Confirmar Nueva Contraseña</label>
              <input 
                type="password" 
                required 
                value={confirmarPass} 
                onChange={(e) => setConfirmarPass(e.target.value)} 
                placeholder="Repite tu nueva contraseña" 
              />
            </div>

            <button type="submit" className="btn-actualizar" disabled={procesando}>
              {procesando ? 'Guardando...' : 'Guardar Nueva Contraseña'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};