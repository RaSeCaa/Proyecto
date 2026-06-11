import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { CatalogoView } from './CatalogoView';
import { CarritoView } from './CarritoView';
import { UsuarioView } from './UsuarioView';

interface ItemCarrito {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

interface TiendaViewProps {
  isLoggedIn: boolean;
  inputEmail: string;
  onExigirLogin: () => void;
  onCerrarSesion: () => void;
}

export const TiendaView: React.FC<TiendaViewProps> = ({
  isLoggedIn,
  inputEmail,
  onExigirLogin,
  onCerrarSesion
}) => {
  const [vistaInterna, setVistaInterna] = useState<string>('catalogo');
  const [categoria, setCategoria] = useState<string>('streaming');
  const [listaCarrito, setListaCarrito] = useState<ItemCarrito[]>([]);
  const [qrLinkDesdeBD, setQrLinkDesdeBD] = useState<string | null>(null);

  // Calcula el precio total acumulado de todos los productos añadidos
  const carritoPrecioTotal = listaCarrito.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);

  // 🌟 EFECTO EFICAZ: Jalar el QR desde la tabla usuarios
// 🌟 CORRECCIÓN DENTRO DE TiendaView.tsx
useEffect(() => {
  const obtenerQrAdmin = async () => {
    try {
      // 💡 Cambiamos la ruta a la ruta exacta mapeada en tu NestJS
      const respuesta = await fetch('http://localhost:3000/usuarios/qr-publico/1');
      
      if (!respuesta.ok) {
        throw new Error(`Error en el servidor: Código ${respuesta.status}`);
      }
      
      const datosUsuario = await respuesta.json();
      
      // Dependiendo de cómo devuelva el string tu controlador de NestJS,
      // si devuelve el objeto plano o directamente la propiedad en texto.
      if (datosUsuario) {
        // Si tu backend devuelve un objeto como { qr_recaudacion: "http..." } o directo el string:
        const link = datosUsuario.qr_recaudacion ? datosUsuario.qr_recaudacion : datosUsuario;
        setQrLinkDesdeBD(link);
      }
    } catch (error) {
      console.error("Error obteniendo el QR de recaudación:", error);
    }
  };

  obtenerQrAdmin();
}, []);

  const manejarActualizarCarrito = (nombre: string, cant: number, precioUnitario: number) => {
    if (!nombre) return;
    setListaCarrito((prev) => {
      const existe = prev.find(item => item.nombre.toLowerCase() === nombre.toLowerCase());
      if (cant <= 0) {
        return prev.filter(item => item.nombre.toLowerCase() !== nombre.toLowerCase());
      }
      if (existe) {
        return prev.map(item => 
          item.nombre.toLowerCase() === nombre.toLowerCase() ? { ...item, cantidad: cant } : item
        );
      } else {
        return [...prev, { nombre, cantidad: cant, precioUnitario }];
      }
    });
  };

  return (
    <>
      <Navbar 
        totalCarrito={carritoPrecioTotal} 
        nombreUsuario={isLoggedIn ? `👤 ${inputEmail.split('@')[0]}` : 'Ingresar'}
        onCambiarVista={(nueva) => {
          if (nueva === 'salir') onCerrarSesion();
          else if (nueva === 'usuario' && !isLoggedIn) onExigirLogin();
          else if (nueva === 'ingresar_click') onExigirLogin();
          else setVistaInterna(nueva);
        }}
        onCambiarCategoria={setCategoria}
      />

      <main style={{ padding: '30px', maxWidth: '1200px', width: '100%', margin: '0 auto', flex: 1 }}>
        
        {/* VISTA 1: CATÁLOGO */}
        {vistaInterna === 'catalogo' && (
          <CatalogoView 
            categoriaActiva={categoria} 
            carritoActual={listaCarrito}
            onActualizarCarrito={manejarActualizarCarrito}
          />
        )}

        {/* VISTA 2: CARRITO - Ahora sí le inyectamos la propiedad 'linkQr' de la BD */}
        {vistaInterna === 'carrito' && (
          <CarritoView 
            items={listaCarrito}
            totalCarrito={carritoPrecioTotal}
            isLoggedIn={isLoggedIn}
            linkQr={qrLinkDesdeBD} 
            emailUsuarioLogueado={inputEmail}
            onExigirLogin={onExigirLogin}
            onActualizarCantidad={manejarActualizarCarrito}
            onVaciarCarrito={() => setListaCarrito([])}
          />
        )}

        {/* VISTA 3: USUARIO */}
        {vistaInterna === 'usuario' && (
        <UsuarioView emailUsuarioLogueado={inputEmail} />
        )}
      </main>
    </>
  );
};