import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAlert } from "./variablesglobales/alertasglobales";
import api from "./api/api";

const VerificarCorreo = () => {
  const { mostrarAlerta } = useAlert();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");

  const [codigo, setCodigo] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!codigo) {
    return mostrarAlerta("Error", "Debes ingresar el código enviado a tu correo.");
  }

  try {
    const res = await api.post("/verificarcodigo", {
      correo: email,
      codigo,
    });

    mostrarAlerta("Exito", "Correo verificado correctamente");
    navigate("/login");

  } catch (error) {
    mostrarAlerta("Error", "No se pudo conectar al servidor.");
  }
};

  return (
    <div className="min-h-screen bg-[#1A3C5A] flex justify-center items-center px-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-[#1A3C5A] mb-4">
          Verificar Correo
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Ingresa el código que enviamos a:
          <br />
          <span className="font-semibold">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              maxLength="6"
              placeholder="Código de 6 dígitos"
              className="w-full border border-gray-300 rounded-md p-3 text-center text-xl tracking-widest"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#1A3C5A] text-white py-2 rounded-md font-semibold hover:bg-[#244E6E]"
          >
            Verificar
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerificarCorreo;
