import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./variablesglobales/alertasglobales";
import { Eye, EyeOff } from "lucide-react";
import api from "./api/api";
const CrearCuenta = () => {
  const { mostrarAlerta } = useAlert();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ nombre: "", apellido: "", usuario: "", correo: "", contrasena: "", confirmarContrasena: "", telefono: "", });
  const [mostrar, setMostrar] = useState({contrasena: false, confirmar: false, });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleMostrar = (campo) => {
  setMostrar((prev) => ({ ...prev, [campo]: !prev[campo] }));
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.nombre || !formData.apellido || !formData.usuario || !formData.correo) {
    return mostrarAlerta("Error", "Todos los campos obligatorios deben completarse.");
  }

  if (formData.contrasena !== formData.confirmarContrasena) {
    return mostrarAlerta("Error", "Las contraseñas no coinciden.");
  }

  try {
    const res = await api.post("/usuarios", {
      nombre: formData.nombre,
      apellido: formData.apellido,
      usuario: formData.usuario,
      correo: formData.correo,
      password: formData.contrasena,
      telefono: formData.telefono || null,
    });

    mostrarAlerta("Exito", "Cuenta creada correctamente");
    navigate(`/verificarcorreo?email=${formData.correo}`);

  } catch (error) {
    mostrarAlerta("Error", error.response?.data?.message || "No se pudo conectar al servidor.");
  }
};

  return (
    <div className="min-h-screen bg-[#1A3C5A] flex justify-center items-center px-3 sm:px-6">
      <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]
          border border-gray-200 
          p-6 sm:p-8 md:p-10
          w-[95vw] sm:w-[85vw] md:w-[70vw] lg:w-[55vw] xl:w-[45vw]
          min-w-[330px] max-w-[900px]
          h-auto max-h-[99vh]
          overflow-y-auto transition-all duration-500">
        <h1 className="text-3xl font-bold text-center text-[#1A3C5A] mb-6"> Crear Cuenta </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-semibold mb-1 text-[#1A3C5A]">Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5" required />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[#1A3C5A]">Apellido</label>
              <input  type="text" name="apellido" value={formData.apellido} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5" required /> </div>
            <div>
              <label className="block font-semibold mb-1 text-[#1A3C5A]">Usuario</label>
              <input type="text" name="usuario" value={formData.usuario} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5" required/>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[#1A3C5A]">Correo</label>
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5" required />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[#1A3C5A]">Contraseña</label>
              <div className="relative">
              <input type={mostrar.contrasena ? "text" : "password"} name="contrasena" value={formData.contrasena} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5 pr-10" required/>
              <button type="button" onClick={() => toggleMostrar("contrasena")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1A3C5A]" >
              {mostrar.contrasena ? ( <Eye size={18} strokeWidth={2} /> ) : ( <EyeOff size={18} strokeWidth={2} /> )} </button>
            </div>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[#1A3C5A]">Confirmar Contraseña</label>
              <div className="relative">
              <input type={mostrar.confirmar ? "text" : "password"} name="confirmarContrasena" value={formData.confirmarContrasena} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5 pr-10" required />
              <button type="button" onClick={() => toggleMostrar("confirmar")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1A3C5A]" >
              {mostrar.confirmar ? ( <Eye size={18} strokeWidth={2} /> ) : ( <EyeOff size={18} strokeWidth={2} /> )}
              </button>
            </div>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[#1A3C5A]">Teléfono (opcional)</label>
              <input type="tel"  name="telefono" value={formData.telefono} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5" />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={() => navigate("/login")} className="bg-gray-100 border border-[#1A3C5A] text-[#1A3C5A] px-6 py-2 rounded-md font-semibold hover:bg-[#e6ebf1] transition">
              Regresar
            </button>
            <button type="submit" className="bg-[#1A3C5A] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#244E6E] transition" > Crear Cuenta </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearCuenta;
