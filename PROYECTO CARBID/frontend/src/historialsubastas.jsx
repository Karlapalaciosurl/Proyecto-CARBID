import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "./variablesglobales/usuarioglobal";
import api from "./api/api";
const HistorialSubastas = () => {
  const { usuario } = useContext(UserContext);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 7; 

  useEffect(() => {
    const obtenerHistorial = async () => {
      try {
        const res = await api.get(`/historial/${usuario.id}`);
        setHistorial(res.data);
      } catch (error) {
       // console.error("Error al obtener historial:", error);
      } finally {
        setCargando(false);
      }
    };

    if (usuario?.id) obtenerHistorial();
  }, [usuario]);

const getColorEstado = (estado) => {
  const colores = {
    1: "text-gray-500",   // PENDIENTE
    2: "text-yellow-500", // ACTIVA
    3: "text-blue-500",   // FINALIZADA SIN CONFIRMAR
    4: "text-red-500",    // FINALIZADA RECHAZADA
    5: "text-blue-600",   // FINALIZADA CONFIRMADA
    6: "text-green-500",  // FINALIZADA CON COMPRA
    7: "text-red-500",    // FINALIZADA SIN COMPRA
    VIRTUAL: "text-gray-400", // PARTICIPASTE
  };
  return colores[estado] || "text-gray-600";
};

const getTextoEstado = (estado, texto_estado) => {
  return (
    texto_estado ||
    {
      1: "PENDIENTE",
      2: "ACTIVA",
      3: "FINALIZADA SIN CONFIRMAR",
      4: "VENTA RECHAZADA",
      5: "FINALIZADA CONFIRMADA",
      6: "VENTA EXITOSA",
      7: "CERRADA SIN ÉXITO",
      VIRTUAL: "PARTICIPASTE",
    }[estado]
  );
};


  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
        <p className="text-[#1A3C5A] font-semibold animate-pulse"> Cargando historial de subastas... </p>
      </div>
    );
  }

  const totalPaginas = Math.ceil(historial.length / porPagina);
  const inicio = (paginaActual - 1) * porPagina;
  const fin = paginaActual * porPagina;
  const registrosPagina = historial.slice(inicio, fin);

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center pt-24 pb-10 px-4">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-5xl border border-gray-200">
        <h1 className="text-2xl font-bold text-center text-[#1A3C5A] mb-6"> Historial de Subastas </h1>

        {historial.length === 0 ? (
          <p className="text-center text-gray-500">No hay registros en el historial.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-[#1A3C5A] text-white">
                  <tr>
                    <th className="p-3 text-left">Vehículo Subastado</th>
                    <th className="p-3 text-left">Oferta Final</th>
                    <th className="p-3 text-left">Fecha Cierre</th>
                    <th className="p-3 text-left">Estado</th>
                    <th className="p-3 text-left">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosPagina.map((h, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 font-semibold text-gray-800">{h.vehiculo}</td>
                      <td className="p-3 text-gray-700">
                        {h.oferta_final
                          ? `Q ${Number(h.oferta_final).toLocaleString("es-GT")}`
                          : "—"}
                      </td>
                      <td className="p-3 text-gray-700">
                        {h.fecha_cierre
                          ? new Date(h.fecha_cierre).toLocaleDateString("es-GT")
                          : "—"}
                      </td>
                      <td className={`p-3 font-semibold ${getColorEstado(h.estado)}`}>
                        {getTextoEstado(h.estado, h.texto_estado)}
                      </td>
                      <td className="p-3 text-gray-600">{h.rol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-gray-500 mt-3 text-center">
              Mostrando {inicio + 1}–{Math.min(fin, historial.length)} de {historial.length} registros
            </p>

            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
                <button
                  onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                  disabled={paginaActual === 1}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    paginaActual === 1
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-[#1A3C5A] text-white hover:bg-[#244e6e]"
                  }`}
                >
                  Anterior
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setPaginaActual(num)}
                    className={`w-9 h-9 rounded-full font-semibold transition ${
                      paginaActual === num
                        ? "bg-[#1A3C5A] text-white"
                        : "bg-gray-200 text-[#1A3C5A] hover:bg-gray-300"
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setPaginaActual((prev) =>
                      prev < totalPaginas ? prev + 1 : prev
                    )
                  }
                  disabled={paginaActual >= totalPaginas}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    paginaActual >= totalPaginas
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-[#1A3C5A] text-white hover:bg-[#244e6e]"
                  }`}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HistorialSubastas;
