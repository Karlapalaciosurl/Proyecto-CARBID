import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaChevronDown, FaBell } from "react-icons/fa";
import { UserContext } from "../variablesglobales/usuarioglobal.jsx";
import api from "../api/api";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useContext(UserContext);

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [cantidadNoLeidas, setCantidadNoLeidas] = useState(0);

 //obtener notis
  const obtenerNotificaciones = async () => {
    if (!usuario?.id) return;
    try {
      const res = await api.get(`/notificaciones/${usuario.id}`);
      const noLeidas = res.data.filter((n) => !n.lectura);
      setNotificaciones(res.data);
      setCantidadNoLeidas(noLeidas.length);
    } catch (error) {
      //console.error("Error al obtener notificaciones:", error);
    }
  };

  // cargar al iniciar y c/ 30s
useEffect(() => {
  if (!usuario?.id) return;

  const fetchIfVisible = () => {
    if (document.visibilityState === "visible") {
      obtenerNotificaciones();
    }
  };

  // Primera carga inmediata
  fetchIfVisible();

  // Ejecuta cada 30 segundos (solo si la pestaña está activa)
  const intervalo = setInterval(fetchIfVisible, 30000);

  return () => clearInterval(intervalo);
}, [usuario?.id]);


  const linkClass = (path) =>
    `font-semibold hover:underline ${
      location.pathname === path ? "underline text-white" : "text-white/90"
    }`;

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login");
  };

  const toggleMenu = () => setMenuAbierto((prev) => !prev);

  return (
    <header className="bg-[#1A3C5A] text-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-[1300px] mx-auto flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-wide">CARBID</h1>
          <img
            src="/images/carro.png"
            alt="Logo Carbid"
            className="w-8 h-8 object-contain filter brightness-0 invert"
          />
        </div>

        <nav className="flex items-center gap-8 text-sm">
          <Link to="/portal" className={linkClass("/portal")}>
            Página Principal
          </Link>
           {usuario && (
          <Link to="/registrar" className={linkClass("/registrar")}>
            Agregar Vehículo
          </Link>
           )}
            {usuario && (
    <Link to="/historialsubastas" className={linkClass("/historialsubastas")}>
      Historial de Subastas
    </Link>
  )}
        </nav>
        <div className="flex items-center gap-5 relative">
          {usuario && (
            <div
              className="relative cursor-pointer"
              title="Ver notificaciones"
              onClick={() => navigate("/notificaciones")}
            >
              <FaBell className="text-2xl hover:text-yellow-400 transition-transform hover:scale-110" />
              {cantidadNoLeidas > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 rounded-full">
                  {cantidadNoLeidas}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 text-sm text-white/80">
            <FaMapMarkerAlt className="text-sm" />
            <span>Guatemala</span>
          </div>
          {usuario ? (
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="flex items-center gap-1 bg-white text-[#1A3C5A] px-3 py-1.5 rounded-md font-semibold hover:bg-gray-100 transition"
              >
                <span>{usuario.nombre}</span>
                <FaChevronDown
                  className={`text-xs transition-transform duration-200 ${
                    menuAbierto ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {menuAbierto && (
                <div className="absolute right-0 mt-2 w-44 bg-[#1A3C5A] text-white rounded-md shadow-lg">
                  <Link
                    to="/configuracionusuario"
                    className="block px-4 py-2 hover:bg-[#244E6E] rounded-t-md"
                    onClick={() => setMenuAbierto(false)}
                  >
                    Configuración
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuAbierto(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#244E6E] rounded-b-md"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-white text-[#1A3C5A] px-3 py-1.5 rounded-md font-semibold hover:bg-gray-100 transition"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
