import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "./variablesglobales/usuarioglobal.jsx";
import { useNavigate } from "react-router-dom";
import api from "./api/api";

const Notificaciones = () => {
  const { usuario } = useContext(UserContext);
  const [notificaciones, setNotificaciones] = useState([]);
  const navigate = useNavigate();

  // cargar notificaciones con informacion del vehiculo
  useEffect(() => {
    const obtenerNotificaciones = async () => {
      if (!usuario?.id) return;
      try {
        const res = await api.get(`/notificaciones/${usuario.id}`
        );
        const ordenadas = res.data.sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );
        setNotificaciones(ordenadas);
      } catch (error) {
       // console.error("Error al cargar notificaciones:", error);
      }
    };
    obtenerNotificaciones();
  }, [usuario]);

 const manejarClick = async (n) => {
  try {
    // si da click en ver detalle actualizar como noti leia
    await api.put(`/notificaciones/${n.id}`);

    // actualizar visualmente
    setNotificaciones((prev) =>
      prev.map((item) =>
        item.id === n.id ? { ...item, lectura: 1 } : item
      )
    );

    if (n.tipo === 3) {
      navigate(`/confirmacion/${n.id_vehiculo}`);
      return;
    }

    // el usuario es el vendedor?
    const esVendedor = n.vehiculo?.id_usuario === usuario.id;

    navigate(
      esVendedor
        ? `/detallesubastavendedor/${n.id_vehiculo}`
        : `/detallesubastacomprador/${n.id_vehiculo}`
    );
  } catch (error) {
   // console.error("Error al marcar como leída o redirigir:", error);
  }
};


  return (
    <div className="max-w-5xl mx-auto mt-24 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-[#1A3C5A]"> Notificaciones </h2>

      <table className="w-full border border-gray-200 text-sm">
        <thead className="bg-[#1A3C5A] text-white">
          <tr>
            <th className="p-2 text-left">Mensaje</th>
            <th className="p-2 text-left">Leída</th>
            <th className="p-2 text-left">Fecha</th>
            <th className="p-2 text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          {notificaciones.length > 0 ? (
            notificaciones.map((n) => (
              <tr
                key={n.id}
                className={`border-b hover:bg-gray-100 ${
                  n.lectura
                    ? "text-gray-500"
                    : "font-semibold text-gray-800 bg-yellow-50"
                }`}
              >
                <td className="p-2">{n.mensaje}</td>
                <td className="p-2">{n.lectura ? "Sí" : "No"}</td>
                <td className="p-2">
                  {new Date(n.fecha).toLocaleString("es-GT", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => manejarClick(n)}
                    className="bg-[#1A3C5A] text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-[#244E6E] transition"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-gray-500 py-4">
                No hay notificaciones disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Notificaciones;
