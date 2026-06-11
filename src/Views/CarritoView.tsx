import React, { useState } from 'react';
import './CarritoView.css';

// Definimos la estructura exacta de cada item que guardas en tu carrito
interface ItemCarrito {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

interface CarritoProps {
  items: ItemCarrito[]; // Recibe la lista completa de productos agregados
  totalCarrito: number;
  isLoggedIn?: boolean;
  linkQr: string | null; 
  emailUsuarioLogueado?: string;
  onExigirLogin?: () => void;
  onVaciarCarrito?: () => void;
  onActualizarCantidad?: (nombre: string, cantidad: number, precioUnitario: number) => void;
}

export const CarritoView: React.FC<CarritoProps> = ({ 
  items = [], 
  totalCarrito, 
  isLoggedIn = false,
  linkQr,
  emailUsuarioLogueado,
  onExigirLogin,
  onVaciarCarrito,
  onActualizarCantidad
}) => {
  const [metodoPago, setMetodoPago] = useState<'qr' | 'efectivo'>('qr');
  const [procesando, setProcesando] = useState<boolean>(false);
  const [comprobante, setComprobante] = useState<File | null>(null);

  const manejarCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setComprobante(e.target.files[0]);
    }
  };

const manejarConfirmarPedido = async () => {
    if (!isLoggedIn) {
      if (onExigirLogin) onExigirLogin();
      return;
    }

    if (items.length === 0) {
      alert("⚠️ El carrito está vacío.");
      return;
    }

    setProcesando(true);

    // 🚀 MODIFICADO: Ahora la función interna también recibe el idCompraTexto
    const enviarFilaPeticion = async (productoTexto: string, montoFila: number, base64Data: string, idCompraTexto: string) => {
      const respuesta = await fetch('http://localhost:3000/usuarios/enviar-comprobante-completo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: emailUsuarioLogueado,
          producto: productoTexto,
          monto: montoFila,
          imagenBase64: base64Data,
          id_compra: idCompraTexto // 🚀 MANDAMOS EL ID UNIFICADOR AL BACKEND
        })
      });
      return respuesta.ok;
    };

    try {
      // Preparar la imagen del comprobante si es por QR
      let comprobanteBase64 = 'PAGO_EN_EFECTIVO_PRESENCIAL';
      if (metodoPago === 'qr') {
        if (!comprobante) {
          alert("⚠️ Por favor, selecciona una captura de tu comprobante.");
          setProcesando(false);
          return;
        }
        comprobanteBase64 = await new Promise<string>((resolve, reject) => {
          const lector = new FileReader();
          lector.readAsDataURL(comprobante);
          lector.onload = () => resolve(lector.result as string);
          lector.onerror = error => reject(error);
        });
      }

      // 🚀 EL TRUCO: Generamos un ID único para ESTE clic de compra (milisegundos actuales)
      // Como se genera AQUÍ, afuera del bucle, será el mismo número para todos los productos de este carrito
      const codigoCompraUnico = Date.now().toString();

      // ENVIAR INDEPENDIENTE: Mandamos una petición al backend por cada item del carrito
      let todasExitosas = true;

      for (const item of items) {
        // Formato clásico: "Netflix (x2)" o "HBO Max"
        const textoProducto = item.cantidad > 1 ? `${item.nombre} (x${item.cantidad})` : item.nombre;
        const montoEspecifico = item.precioUnitario * item.cantidad;

        // 🚀 PASAMOS EL 'codigoCompraUnico' como cuarto parámetro a la función
        const exito = await enviarFilaPeticion(textoProducto, montoEspecifico, comprobanteBase64, codigoCompraUnico);
        if (!exito) todasExitosas = false;
      }

      if (todasExitosas) {
        alert("🎉 ¡Pedido enviado con éxito! El administrador verificará tus peticiones individuales.");
        if (onVaciarCarrito) onVaciarCarrito();
        setComprobante(null);
      } else {
        alert("⚠️ Hubo intermitencias enviando algunos productos.");
      }

    } catch (error) {
      console.error("Error al enviar el carrito:", error);
      alert("❌ Error de red al comunicar con el servidor.");
    } finally {
      setProcesando(false);
    }
  };

  const botonDeshabilitado = procesando || (metodoPago === 'qr' && !comprobante);

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '15px' }}>🛒</span>
        <h3 style={{ color: '#fff', marginBottom: '10px' }}>Tu carrito está vacío</h3>
        <p>Explora el catálogo y añade las pantallas de los servicios que deseas adquirir.</p>
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <div className="carrito-header">
        <h2 className="carrito-title">Tu Carrito de Compras</h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Revisa tu pedido antes de realizar el depósito QR o pago físico.</p>
      </div>

      <div className="carrito-layout">
        
        <div className="carrito-lista">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#aaa', margin: 0, fontSize: '1.1rem' }}>Items Seleccionados</h3>
            {onVaciarCarrito && (
              <button onClick={onVaciarCarrito} className="btn-vaciar-todo" style={{ background: 'transparent', color: '#ff4444', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                Vaciar todo
              </button>
            )}
          </div>
          
          {items.map((item, index) => (
            <div key={index} className="carrito-item">
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'capitalize', color: '#fff' }}>
                  {item.nombre}
                </h4>
                <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '0.85rem' }}>
                  Precio unitario: {item.precioUnitario} Bs
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#222', borderRadius: '6px', overflow: 'hidden' }}>
                  <button 
                    style={{ background: 'none', border: 'none', color: '#fff', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => onActualizarCantidad && onActualizarCantidad(item.nombre, item.cantidad - 1, item.precioUnitario)}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 5px', fontSize: '0.9rem', minWidth: '20px', textAlign: 'center' }}>
                    {item.cantidad}
                  </span>
                  <button 
                    style={{ background: 'none', border: 'none', color: '#fff', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => onActualizarCantidad && onActualizarCantidad(item.nombre, item.cantidad + 1, item.precioUnitario)}
                  >
                    +
                  </button>
                </div>

                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#28a745', minWidth: '65px', textAlign: 'right' }}>
                  {item.precioUnitario * item.cantidad} Bs
                </span>

                <button 
                  type="button"
                  onClick={() => onActualizarCantidad && onActualizarCantidad(item.nombre, 0, item.precioUnitario)}
                  style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '15px', borderTop: '2px dashed #333' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Total a pagar:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#28a745' }}>{totalCarrito} Bs</span>
          </div>
        </div>

        <div className="pago-box">
          <h3 style={{ fontSize: '1.1rem', color: '#aaa', margin: 0 }}>Selecciona tu método de pago</h3>
          
          <div style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
            <button 
              type="button"
              onClick={() => setMetodoPago('qr')}
              style={{
                flex: 1, padding: '10px', borderRadius: '6px', cursor: 'pointer', border: 'none', fontWeight: 'bold',
                backgroundColor: metodoPago === 'qr' ? '#4444ff' : '#222', color: '#fff'
              }}
            >
              📱 Pago por QR
            </button>
            <button 
              type="button"
              onClick={() => setMetodoPago('efectivo')}
              style={{
                flex: 1, padding: '10px', borderRadius: '6px', cursor: 'pointer', border: 'none', fontWeight: 'bold',
                backgroundColor: metodoPago === 'efectivo' ? '#ff9900' : '#222', color: '#fff'
              }}
            >
              💵 Pago Físico
            </button>
          </div>

          {metodoPago === 'qr' ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '12px' }}>
                Escanea el código QR oficial vinculado por el administrador para transferir {totalCarrito} Bs.
              </p>
              
              <div style={{ 
                width: '200px', height: '200px', margin: '0 auto 15px auto', backgroundColor: '#fff', 
                padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {/* 🌟 AQUÍ USA EL LINK DINÁMICO DE TU BASE DE DATOS */}
                {linkQr ? (
                  <img 
                    src={linkQr} 
                    alt="QR del Servidor Administrador" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                    onError={(e) => {
                      const parent = (e.target as HTMLImageElement).parentElement;
                      (e.target as HTMLImageElement).style.display = 'none';
                      if(parent) {
                        parent.style.backgroundColor = '#1a1a1a';
                        parent.innerHTML = "<span style='color:#ff4444; font-size:0.75rem; padding:10px;'>[ Error: Link de imagen roto o inaccesible ]</span>";
                      }
                    }}
                  />
                ) : (
                  <div style={{ color: '#666', fontSize: '0.75rem', padding: '10px', textAlign: 'center' }}>
                    [ Cargando QR de Recaudación... ]
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: '#1a1a1a', padding: '12px', borderRadius: '8px', marginBottom: '15px', textAlign: 'left', border: '1px solid #262626' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: '#4444ff', fontWeight: 'bold', marginBottom: '8px' }}>
                  📤 Adjuntar Comprobante (Requerido):
                </span>
                
                <label htmlFor="file-upload-input" className="btn-file-custom">
                  {comprobante ? "🔄 Cambiar Imagen" : "📸 Seleccionar de Galería"}
                </label>
                <input 
                  id="file-upload-input"
                  type="file" 
                  accept="image/*"
                  onChange={manejarCambioArchivo} // Corregido el error de definición
                  className="input-file-hidden"
                />

                {comprobante && (
                  <p style={{ color: '#28a745', fontSize: '0.75rem', margin: '6px 0 0 0' }}>
                    ✓ Cargado: {comprobante.name}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: '#ff990011', border: '1px solid #ff990033', padding: '12px', borderRadius: '8px', margin: '15px 0', textAlign: 'left' }}>
              <p style={{ color: '#ff9900', margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '0.85rem' }}>⚠️ Intercambio Presencial:</p>
              <p style={{ color: '#ccc', margin: 0, fontSize: '0.75rem', lineHeight: '1.4' }}>
                Al confirmar, tus cuentas se guardarán en tu perfil en estado 'pendiente'. El administrador activará tus accesos inmediatamente tras recibir el dinero físico.
              </p>
            </div>
          )}
          
          <button 
            className="btn-pagar" 
            onClick={manejarConfirmarPedido}
            disabled={botonDeshabilitado}
            style={{ 
              backgroundColor: botonDeshabilitado ? '#222' : (metodoPago === 'efectivo' ? '#ff9900' : '#28a745'), 
              color: botonDeshabilitado ? '#555' : '#fff', 
              width: '100%', padding: '12px', borderRadius: '6px',
              cursor: botonDeshabilitado ? 'not-allowed' : 'pointer', 
              fontWeight: 'bold', border: 'none', marginTop: '10px'
            }}
          >
            {procesando ? 'Procesando Pedido...' : (metodoPago === 'qr' && !comprobante ? 'Sube tu comprobante para confirmar' : 'Confirmar Pedido Realizado')}
          </button>
        </div>

      </div>
    </div>
  );
};