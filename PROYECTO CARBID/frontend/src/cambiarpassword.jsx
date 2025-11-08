import React, { useState, useContext } from "react";
import { UserContext } from "./variablesglobales/usuarioglobal";
import { useAlert } from "./variablesglobales/alertasglobales";
import { Eye, EyeOff } from "lucide-react";
import api from "./api/api";

const CambiarPassword = () => {
  const { usuario } = useContext(UserContext);
  const { mostrarAlerta } = useAlert();

  const [formData, setFormData] = useState({
    contraseniaActual: "",
    contraseniaNueva: "",
    confirmarContrasenia: "",
  });

  const [errores, setErrores] = useState({
    contraseniaNueva: "",
    confirmarContrasenia: "",
  });

  const [mostrar, setMostrar] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });

  const toggleMostrar = (campo) => {
    setMostrar((prev) => ({ ...prev, [campo]: !prev[campo] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "contraseniaNueva") {
      if (value.length > 0 && value.length < 6) {
        setErrores((prev) => ({
          ...prev,
          contraseniaNueva: "La contraseña debe tener al menos 6 caracteres.",
        }));
      } else {
        setErrores((prev) => ({ ...prev, contraseniaNueva: "" }));
      }
    }

    if (name === "confirmarContrasenia") {
      if (value !== formData.contraseniaNueva) {
        setErrores((prev) => ({
          ...prev,
          confirmarContrasenia: "Las contraseñas no coinciden.",
        }));
      } else {
        setErrores((prev) => ({ ...prev, confirmarContrasenia: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.contraseniaNueva !== formData.confirmarContrasenia) {
      mostrarAlerta("Error", "Las contraseñas no coinciden.");
      return;
    }

  try {
    const res = await api.put(`/usuarios/${usuario.id}/password`, {
      contraseniaActual: formData.contraseniaActual,
      contraseniaNueva: formData.contraseniaNueva,
    });

    mostrarAlerta("Exito", "Contraseña actualizada correctamente");

    setFormData({
      contraseniaActual: "",
      contraseniaNueva: "",
      confirmarContrasenia: "",
    });

  } catch (error) {
    mostrarAlerta("Error", error.response?.data?.message || "No se pudo conectar al servidor.");
  }
};
  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col items-center pt-28 pb-12 px-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-10 w-full max-w-[700px]">
        <h1 className="text-3xl font-bold text-center text-[#1A3C5A] mb-8"> Cambiar Contraseña </h1>

        <form onSubmit={handleSubmit} className="border p-8 rounded-lg">
          <div className="grid grid-cols-1 gap-6">
            <div className="relative">
              <label className="block font-semibold mb-1 text-[#1A3C5A]"> Contraseña Actual </label>
              <input type={mostrar.actual ? "text" : "password"} name="contraseniaActual" value={formData.contraseniaActual} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5 pr-10" required />
              <button type="button" onClick={() => toggleMostrar("actual")} className="absolute right-3 top-9 text-gray-500 hover:text-[#1A3C5A]" >
                {mostrar.actual ? ( <Eye size={18} strokeWidth={2} /> ) : ( <EyeOff size={18} strokeWidth={2} /> )}
              </button>
            </div>
            <div className="relative">
              <label className="block font-semibold mb-1 text-[#1A3C5A]"> Nueva Contraseña </label>  <input type={mostrar.nueva ? "text" : "password"} name="contraseniaNueva" value={formData.contraseniaNueva} onChange={handleChange} className={`w-full border rounded-md p-2.5 pr-10 
              ${ errores.contraseniaNueva ? "border-red-400" : "border-gray-300" }`} required />
              <button type="button"  onClick={() => toggleMostrar("nueva")} className="absolute right-3 top-9 text-gray-500 hover:text-[#1A3C5A]" >
                {mostrar.nueva ? ( <Eye size={18} strokeWidth={2} /> ) : ( <EyeOff size={18} strokeWidth={2} /> )}
              </button>
              {errores.contraseniaNueva && (
                <p className="text-red-600 text-sm mt-1"> {errores.contraseniaNueva} </p>
              )}
            </div>
            <div className="relative">
              <label className="block font-semibold mb-1 text-[#1A3C5A]"> Confirmar Contraseña </label>
              <input type={mostrar.confirmar ? "text" : "password"} name="confirmarContrasenia"  value={formData.confirmarContrasenia} onChange={handleChange} className={`w-full border rounded-md p-2.5 pr-10 
              ${ errores.confirmarContrasenia ? "border-red-400": "border-gray-300" }`} required />
              <button type="button" onClick={() => toggleMostrar("confirmar")} className="absolute right-3 top-9 text-gray-500 hover:text-[#1A3C5A]" >
                {mostrar.confirmar ? ( <Eye size={18} strokeWidth={2} /> ) : ( <EyeOff size={18} strokeWidth={2} /> )}
              </button>
              {errores.confirmarContrasenia && (
                <p className="text-red-600 text-sm mt-1"> {errores.confirmarContrasenia} </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">

            <button type="submit" className="bg-[#1A3C5A] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#244E6E]"> Guardar Cambios </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CambiarPassword;
