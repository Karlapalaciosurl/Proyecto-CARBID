import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "./variablesglobales/usuarioglobal";
import { useAlert } from "./variablesglobales/alertasglobales";
import api from "./api/api";
import { backendUrl } from "./backendurl";
import { fetchAuth } from "./token/fetchAuth";

const DetalleSubastaComprador = () => {
  const { id_vehiculo } = useParams();
  const { mostrarAlerta } = useAlert();
  const { usuario } = useContext(UserContext);
  const [vehiculo, setVehiculo] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [indice, setIndice] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);

  const porPagina = 10;

  const obtenerDetalle = async () => {
    try {
      const res = await api.get(`/detallesubastavendedor/${id_vehiculo}`); 
      setVehiculo(res.data);

      const resPujas = await fetchAuth.get(`/pujas/${id_vehiculo}`);
      setParticipantes(resPujas.data || []);
    } catch (error) {
      mostrarAlerta("Error", "No se pudo obtener el detalle de la subasta.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDetalle();
  }, [id_vehiculo]);

  if (cargando)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
        <p className="text-[#1A3C5A] font-semibold text-lg animate-pulse"> Cargando detalle de subasta... </p>
      </div>
    );
  if (!vehiculo)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
        <p className="text-red-600 font-semibold text-lg"> No se encontró la subasta solicitada. </p>
      </div>
    );

  // Carrusel
  const imagenes = JSON.parse(vehiculo.imagenes || "[]");
  const imgActual =
    imagenes.length > 0
      ? `${backendUrl}/uploads/${imagenes[indice]}`
      : "https://via.placeholder.com/400x200?text=Sin+imagen";

  const cambiarImagen = (dir) => {
    setIndice((prev) =>
      dir === "izq"
        ? (prev - 1 + imagenes.length) % imagenes.length
        : (prev + 1) % imagenes.length
    );
  };

  const comprador = vehiculo.resultado_subasta?.Usuario;
  const ofertaMasAlta = vehiculo.resultado_subasta?.monto_final || 0;

  // mensaje segun estado del vehiculo
  let mensajeEstado = "";
  if (vehiculo.estado === 6) {
    mensajeEstado =
      "¡Felicidades por tu compra exitosa! Esperamos que disfrutes tu nuevo vehículo.";
  } else if (vehiculo.estado === 7 || vehiculo.estado === 4) {
    mensajeEstado =
      "Lamentamos que no se haya podido concretar la compra. ¡Esperamos que pronto encuentres otro vehículo de tu interés!";
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center pt-24 pb-12 px-8">
      <div className="w-full max-w-[1100px] bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-[#1A3C5A] mb-6 text-center"> Detalle de Subasta (Comprador) </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Carrusel */}
          <div className="relative flex flex-col items-center">
            <img src={imgActual} alt={`${vehiculo.marca} ${vehiculo.modelo}`} className="w-full rounded-lg shadow-md object-cover" />
            {imagenes.length > 1 && (
              <> <button onClick={() => cambiarImagen("izq")} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[#1A3C5A]/80 text-white rounded-full p-2 hover:bg-[#244E6E]" >
                  ‹
                </button>
                <button onClick={() => cambiarImagen("der")} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#1A3C5A]/80 text-white rounded-full p-2 hover:bg-[#244E6E]">
                  ›
                </button> </>
            )}
            <div className="flex gap-2 mt-4">
              {imagenes.map((img, i) => (
                <img
                  key={i}
                  src={`${backendUrl}/uploads/${img}`}
                  onClick={() => setIndice(i)}
                  className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 ${
                    i === indice ? "border-[#1A3C5A]" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#1A3C5A] mb-2 uppercase">{vehiculo.marca} {vehiculo.modelo} {vehiculo.anio} </h2>
              <p className="text-gray-600 mb-4">{vehiculo.descripcion}</p>
              <p className="font-semibold text-[#1A3C5A]"> Oferta base:{" "}
                <span className="text-gray-700"> Q {Number(vehiculo.precio_base).toLocaleString("es-GT")} </span></p>
              <p className="font-semibold text-[#1A3C5A]">
                Fecha de finalización:{" "}
                <span className="text-gray-700">{new Date(vehiculo.fecha_fin).toLocaleString("es-GT", {dateStyle: "short", timeStyle: "short", })} </span>
              </p>
              <p className="font-semibold text-[#1A3C5A]">Oferta más alta:{" "}
                <span className="text-gray-700"> Q {Number(ofertaMasAlta).toLocaleString("es-GT")} </span>
              </p>
              <p className="font-semibold text-[#1A3C5A]"> Comprador:{" "}
                 <span className="text-gray-700"> {comprador ? `${comprador.nombre} ${comprador.apellido}`: "Sin comprador"} </span>
              </p>
              {mensajeEstado && (
                <p className="mt-5 text-sm font-medium text-gray-700 italic bg-gray-50 p-3 rounded-lg border border-gray-200"> {mensajeEstado}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white mt-10 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-[#1A3C5A] mb-4">Participantes  </h2>
          <div className="max-h-[320px] overflow-y-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-[#1A3C5A] sticky top-0">
                <tr>
                  <th className="text-left py-2 px-3 w-[50px]">#</th>
                  <th className="text-left py-2 px-3">Nombre</th>
                  <th className="text-left py-2 px-3">Oferta Actual</th>
                </tr>
              </thead>
              <tbody>
                {participantes.length > 0 ? (
                  participantes
                    .slice((paginaActual - 1) * porPagina, paginaActual * porPagina)
                    .map((p, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 font-semibold text-gray-600">
                          {(paginaActual - 1) * porPagina + (index + 1)}
                        </td>
                        <td className="py-2 px-3">{p.usuario || "Desconocido"}</td>
                        <td className="py-2 px-3">
                          Q {p.monto.toLocaleString("es-GT")}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-500 py-4"> No hay participantes registrados </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {participantes.length > 0 && (
            <p className="text-sm text-gray-500 mt-3 text-center">
              Mostrando{" "}
              {Math.min((paginaActual - 1) * porPagina + 1, participantes.length)}–
              {Math.min(paginaActual * porPagina, participantes.length)} de{" "}
              {participantes.length} registros
            </p>
          )}
          {Math.ceil(participantes.length / porPagina) > 1 && (
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
              {Array.from(
                { length: Math.ceil(participantes.length / porPagina) },
                (_, i) => i + 1
              ).map((num) => (
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
                    prev < Math.ceil(participantes.length / porPagina)
                      ? prev + 1
                      : prev
                  )
                }
                disabled={paginaActual >= Math.ceil(participantes.length / porPagina)}
                className={`px-4 py-2 rounded-full font-semibold transition ${
                  paginaActual >= Math.ceil(participantes.length / porPagina)
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-[#1A3C5A] text-white hover:bg-[#244e6e]"
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetalleSubastaComprador;
