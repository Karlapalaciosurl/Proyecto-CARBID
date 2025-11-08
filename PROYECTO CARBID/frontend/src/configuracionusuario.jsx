import React, { useState, useContext } from "react";
import { UserContext } from "./variablesglobales/usuarioglobal";
import { useAlert } from "./variablesglobales/alertasglobales";
import { useNavigate } from "react-router-dom";
import api from "./api/api";


const ConfiguracionUsuario = () => {
  const { usuario } = useContext(UserContext);
  const { mostrarAlerta } = useAlert();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || "",
    apellido: usuario?.apellido || "",
    usuario: usuario?.usuario || "",
    correo: usuario?.correo || "",
  });
const handleChange = (e) => { const { name, value } = e.target; setFormData({ ...formData, [name]: value }); };
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await api.put(`/usuarios/${usuario.id}`, {
      nombre: formData.nombre,
      apellido: formData.apellido,
      usuario: formData.usuario,
      correo: formData.correo,
    });

    mostrarAlerta("Exito", "Datos actualizados correctamente");

  } catch (error) {
    mostrarAlerta(
      "Error",
      error.response?.data?.message || "No se pudo conectar al servidor."
    );
  }
};

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col items-center pt-28 pb-12 px-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-10 w-full max-w-[900px]">
        <h1 className="text-3xl font-bold text-center text-[#1A3C5A] mb-8"> Configuración de Usuario </h1>

        <form onSubmit={handleSubmit} className="border p-8 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-1 text-[#1A3C5A]"> Nombre </label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[#1A3C5A]"> Apellido </label>
              <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[#1A3C5A]"> Usuario </label>
              <input type="text" name="usuario" value={formData.usuario} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5" required/>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[#1A3C5A]"> Correo </label>
              <input type="email" name="correo"  value={formData.correo}  onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5" />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={() => navigate("/cambiarpassword")}
              className="bg-gray-100 border border-[#1A3C5A] text-[#1A3C5A] px-6 py-2 rounded-md font-semibold hover:bg-[#e6ebf1] transition"> Cambiar Contraseña</button>
            <button type="submit" className="bg-[#1A3C5A] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#244E6E]" > Actualizar </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfiguracionUsuario;
