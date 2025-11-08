import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAlert } from "./variablesglobales/alertasglobales";
import api from "./api/api";
import { fetchAuth } from "./token/fetchAuth";

const Confirmacion = () => {
  const { id_vehiculo } = useParams();
  const { mostrarAlerta } = useAlert();
  const navigate = useNavigate();
  const [respondido, setRespondido] = useState(false);
  const [vehiculo, setVehiculo] = useState(null);

 //datos del vehiculo
  useEffect(() => {
    const obtenerVehiculo = async () => {
      try {
        const res = await fetchAuth.get(`/vehiculos/${id_vehiculo}`);
        setVehiculo(res.data);

        // verificar si el estado es 6 o 7
        if (res.data.estado === 6 || res.data.estado === 7) {
          setRespondido(true);
        }
      } catch (error) {
        //console.error("Error al obtener vehículo:", error);
      }
    };
    obtenerVehiculo();
  }, [id_vehiculo]);

  // confirmar o rechazar
  const manejarRespuesta = async (confirmado) => {
    if (respondido) return;
    setRespondido(true);

    try {
      await api.put(`/vehiculos/${id_vehiculo}/confirmarventadefinitiva`,
        { realizado: confirmado }
      );

      if (confirmado) {
        mostrarAlerta("Exito", "¡Gracias por confirmar tu entrega! Nos alegra que la venta haya sido exitosa.");
      } else {
        mostrarAlerta("info", "Lamentamos lo sucedido");
      }

      setTimeout(() => navigate("/notificaciones"), 1500);
    } catch (error) {
      mostrarAlerta("Error", "Ocurrio un error al guardar tu respuesta");
      setRespondido(false);
    }
  };

  if (!vehiculo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9] text-[#1A3C5A]"> Cargando información del vehículo...</div>
    );
  }

  // mensaje cuando el estado sea 6 i 7
  const yaRespondidoMensaje =
    vehiculo.estado === 6
      ? "Ya confirmaste que la venta fue efectuada con éxito."
      : vehiculo.estado === 7
      ? "Ya indicaste que la venta no se concretó."
      : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F6F9] px-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg text-center border border-gray-200">
        <h1 className="text-3xl font-bold text-[#1A3C5A] mb-4"> Confirmación de entrega </h1>

        <p className="text-gray-700 mb-6 leading-relaxed">
          ¡Felicitaciones por haber finalizado la subasta! <br />
          ¿Lograste concretar la entrega del vehículo asociado a la subasta{" "}
          <span className="font-semibold text-[#1A3C5A]">
            #{id_vehiculo} – {vehiculo.marca} {vehiculo.modelo} {vehiculo.color}{" "}
            {vehiculo.anio}
          </span>
          ?
        </p>

        {yaRespondidoMensaje && (
          <p className="text-sm font-medium text-gray-600 mb-5">{yaRespondidoMensaje}</p>
        )}

        <div className="flex justify-center gap-6 mt-4">
          <button onClick={() => manejarRespuesta(true)}  disabled={respondido}  className={`px-6 py-2 rounded-lg font-semibold text-white transition ${
              respondido
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Sí, fue efectuada la venta
          </button>

          <button onClick={() => manejarRespuesta(false)} disabled={respondido} className={`px-6 py-2 rounded-lg font-semibold text-white transition ${
              respondido
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            No, la venta no se concluyó
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirmacion;
