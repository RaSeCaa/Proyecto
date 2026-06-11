import React, { useState, useEffect } from 'react';
import './CatalogoView.css'; 

// Definimos la estructura local para que no dependa de importaciones circulares problemáticas
interface ItemCarritoLocal {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

interface Producto {
  id: string | number;
  nombre: string;       
  precio: number;       
  urlImagen?: string;   
  categoria?: string;
  colorTema?: string;
}

interface CatalogoProps {
  categoriaActiva: string;
  carritoActual?: ItemCarritoLocal[]; // Con el "?" ahora es OPCIONAL y jamás romperá otras vistas
  onActualizarCarrito?: (nombre: string, cantidad: number, total: number) => void; 
}

export const CatalogoView: React.FC<CatalogoProps> = ({ 
  categoriaActiva, 
  carritoActual = [], // Si no te lo pasan, por defecto es un arreglo vacío limpio
  onActualizarCarrito 
}) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setCargando(true);
        const respuesta = await fetch('http://localhost:3000/productos');
        if (!respuesta.ok) throw new Error('Error al conectar con el servidor');
        
        const datos = await respuesta.json();
        if (datos && datos.data && Array.isArray(datos.data)) {
          setProductos(datos.data);
        } else if (Array.isArray(datos)) {
          setProductos(datos);
        } else {
          setProductos([]);
        }
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError("No se pudo conectar con la base de datos.");
      } finally {
        setCargando(false);
      }
    };
    cargarProductos();
  }, []);
  

  const productosFiltrados = productos.filter((p) => {
    if (!p || !p.categoria) return false;
    return p.categoria.trim().toLowerCase() === categoriaActiva.trim().toLowerCase();
  });

  if (cargando) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '40px' }}>🔄 Sincronizando catálogo...</div>;
  if (error) return <div style={{ color: '#ff4444', textAlign: 'center', marginTop: '40px' }}>⚠️ {error}</div>;

  return (
    <div className="catalogo-container">
      {productosFiltrados.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>
          No hay productos disponibles en esta categoría.
        </p>
      ) : (
        <div className="catalogo-grid">
          {productosFiltrados.map((producto) => {
            const nombreReal = producto.nombre || "Sin Nombre";
            const precioBaseReal = Number(producto.precio) || 0;

            // Buscamos de forma segura dentro del carrito (sea el array real o el de respaldo)
            const itemEnCarrito = carritoActual.find(
              (item) => item && item.nombre && item.nombre.toLowerCase() === nombreReal.toLowerCase()
            );
            const estaSeleccionado = !!itemEnCarrito;
            const cantidadActual = itemEnCarrito ? itemEnCarrito.cantidad : 0;
            const precioTotal = precioBaseReal * cantidadActual;

            const urlLogo = producto.urlImagen && producto.urlImagen.trim() !== "" 
              ? producto.urlImagen 
              : 'https://cdn-icons-png.flaticon.com/512/3159/3159614.png';

            const colorBorde = producto.colorTema || '#4444ff';

            return (
              <div 
                key={producto.id}
                className="producto-card"
                style={{
                  borderColor: estaSeleccionado ? colorBorde : '#222',
                  boxShadow: estaSeleccionado ? `0 0 15px ${colorBorde}44` : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (!estaSeleccionado && onActualizarCarrito) {
                    onActualizarCarrito(nombreReal, 1, precioBaseReal);
                  }
                }}
              >
                <div className="producto-logo-box">
                  <img src={urlLogo} alt={nombreReal} className="producto-logo" />
                </div>

                <h4 className="producto-titulo" style={{ textTransform: 'capitalize' }}>
                  {nombreReal}
                </h4>

                <div className="producto-precio">
                  {estaSeleccionado ? precioTotal : precioBaseReal}
                  <span className="producto-precio-unidad" style={{ color: colorBorde }}> Bs</span>
                </div>

                {!estaSeleccionado ? (
                  <span className="producto-accion">Toca para añadir</span>
                ) : (
                  <div className="contador-box" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="btn-contador"
                      onClick={() => {
                        if (onActualizarCarrito) {
                          onActualizarCarrito(nombreReal, cantidadActual - 1, precioBaseReal);
                        }
                      }}
                    >
                      -
                    </button>
                    <span className="cantidad-texto">{cantidadActual}</span>
                    <button 
                      className="btn-contador"
                      onClick={() => {
                        if (onActualizarCarrito) {
                          onActualizarCarrito(nombreReal, cantidadActual + 1, precioBaseReal);
                        }
                      }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};