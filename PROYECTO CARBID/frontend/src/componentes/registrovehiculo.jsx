import React, { useState, useEffect, useContext } from "react";
import { useAlert } from "../variablesglobales/alertasglobales";
import { UserContext } from "../variablesglobales/usuarioglobal"; 
import {  useNavigate } from "react-router-dom";
import api from "../api/api";


const RegistrarVehiculo = () => {
  const { mostrarAlerta } = useAlert();
  const { usuario } = useContext(UserContext); 
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    color: "",
    anio: "",
    descripcion: "",
    precio_base: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  const [imagenes, setImagenes] = useState([]);
  const [preview, setPreview] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [minInicio, setMinInicio] = useState("");
  const [minFin, setMinFin] = useState("");
  const [disabledFin, setDisabledFin] = useState(true);



      useEffect(() => {
      if (!usuario) {
        mostrarAlerta("Error", "Debes iniciar sesión para acceder a las subastas.");
        navigate("/login");
      }
    }, [usuario, navigate, mostrarAlerta]);
  // hora local corregida 
  useEffect(() => {
    const now = new Date();
    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setMinInicio(localISO);
  }, []);

  // validaciones para fecha inicio y fecha fin
  useEffect(() => {
    const now = new Date();

    if (formData.fecha_inicio && new Date(formData.fecha_inicio) < now) {
      mostrarAlerta("Error", "La fecha de inicio no puede ser menor a la actual.");
      setFormData((prev) => ({ ...prev, fecha_inicio: "" }));
      return;
    }

    if (formData.fecha_inicio) {
      setDisabledFin(false);
      const inicio = new Date(formData.fecha_inicio);
      const localISOInicio = new Date(inicio.getTime() - inicio.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setMinFin(localISOInicio);

      if (formData.fecha_fin) {
        const fin = new Date(formData.fecha_fin);

        if (fin < inicio) {
          mostrarAlerta("Error", "La fecha de fin no puede ser menor que la de inicio.");
          setFormData((prev) => ({ ...prev, fecha_fin: "" }));
          return;
        }

        if (
          inicio.toDateString() === fin.toDateString() &&
          fin.getTime() <= inicio.getTime()
        ) {
          mostrarAlerta("Precaucion", "Si la subasta termina el mismo día, la hora debe ser posterior a la hora de inicio.");
          setFormData((prev) => ({ ...prev, fecha_fin: "" }));
          return;
        }
      }
    } else {
      setDisabledFin(true);
      setMinFin("");
      setFormData((prev) => ({ ...prev, fecha_fin: "" }));
    }
  }, [formData.fecha_inicio, formData.fecha_fin, mostrarAlerta]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // subir imagenes (solo 10)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const nuevasImagenes = [...imagenes, ...files].slice(0, 10);
    setImagenes(nuevasImagenes);

    const nuevasPreviews = [
      ...preview,
      ...files.map((file) => URL.createObjectURL(file)),
    ].slice(0, 10);
    setPreview(nuevasPreviews);
    e.target.value = "";
  };

  // (si se elimina una imagen)
  const eliminarImagen = (index) => {
    const nuevasImagenes = imagenes.filter((_, i) => i !== index);
    const nuevasPreviews = preview.filter((_, i) => i !== index);
    setImagenes(nuevasImagenes);
    setPreview(nuevasPreviews);
    if (currentIndex >= nuevasPreviews.length) setCurrentIndex(0);
  };

  // 🔹 Enviar datos
  const handleSubmit = async (e) => {
    e.preventDefault();

     if (!usuario || !usuario.id) {
    mostrarAlerta("Error", "Debes iniciar sesión antes de registrar un vehículo.");
    return;
  }
    const now = new Date();
    const inicio = new Date(formData.fecha_inicio);
    const fin = new Date(formData.fecha_fin);

    if (inicio < now) {
      mostrarAlerta("Error", "La fecha de inicio no puede ser menor a la actual.");
      return;
    }

    if (fin < inicio) {
      mostrarAlerta("Error", "La fecha de fin no puede ser menor que la de inicio.");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    if (usuario?.id) data.append("id_usuario", usuario.id);

    imagenes.forEach((img) => data.append("imagenes", img));

    try {
        for (let pair of data.entries()) {
      }
      const res = await api.post("/vehiculos", data, {
        
        headers: { "Content-Type": "multipart/form-data" },
      });
      
    
      mostrarAlerta("Exito", "Vehículo guardado con éxito");

      setFormData({
        marca: "",
        modelo: "",
        color: "",
        anio: "",
        descripcion: "",
        precio_base: "",
        fecha_inicio: "",
        fecha_fin: "",
      });
      setImagenes([]);
      setPreview([]);
      setCurrentIndex(0);
      setDisabledFin(true);
    } catch (error) {
      //console.error("Error al guardar:", error);
      mostrarAlerta("Error", "Error al guardar el vehículo.");
    }
  };

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % preview.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev === 0 ? preview.length - 1 : prev - 1));

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col items-center pt-28 pb-12 px-6">
      <h1 className="text-4xl font-bold text-[#1A3C5A] mb-2 text-center">
        Venda su vehículo con nosotros
      </h1>
      <p className="text-gray-600 text-center mb-10 text-lg max-w-[700px]">
        Complete el formulario para ingresar su vehículo a la subasta.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 p-10 rounded-xl shadow-sm w-full max-w-[950px]"
      >
        <h2 className="text-2xl font-semibold text-[#1A3C5A] mb-6">
          Formulario de ingreso de vehículos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <div>
            <label className="block font-semibold mb-1 text-[#1A3C5A]">Marca</label>
            <input name="marca" value={formData.marca} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-md" required/>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-[#1A3C5A]">Modelo</label>
            <input name="modelo" value={formData.modelo} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-md" required />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-[#1A3C5A]">Color</label>
            <input
              name="color" value={formData.color} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-md" required />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-[#1A3C5A]">Año</label>
            <input
              name="anio" type="number" value={formData.anio}  onChange={handleChange}  className="w-full border border-gray-300 p-2.5 rounded-md"  required />
            </div>  
          <div>
            <label className="block font-semibold mb-1 text-[#1A3C5A]"> Fecha Inicio Subasta </label>
            <input name="fecha_inicio" type="datetime-local" min={minInicio} value={formData.fecha_inicio} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-md" required />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-[#1A3C5A]"> Fecha Fin Subasta </label>
            <input
              name="fecha_fin" type="datetime-local" min={minFin} value={formData.fecha_fin} onChange={handleChange} disabled={disabledFin} className={`w-full border border-gray-300 p-2.5 rounded-md ${ disabledFin ? "bg-gray-100 cursor-not-allowed" : "" }`} required/>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-[#1A3C5A]">Precio Base (Q) </label>
            <input name="precio_base" type="number" value={formData.precio_base} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-md" required />
          </div>
          <div className="lg:col-span-2">
            <label className="block font-semibold mb-1 text-[#1A3C5A]"> Descripción</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="2" className="w-full border border-gray-300 p-2.5 rounded-md" />
          </div>
        </div>
        {/* carrusel */}
        {preview.length > 0 && (
          <div className="relative mt-8 flex flex-col items-center">
            <div className="relative w-full max-w-[500px] h-64 overflow-hidden rounded-xl shadow-md">
              <img src={preview[currentIndex]} alt={`preview-${currentIndex}`} className="w-full h-full object-cover" />
              {preview.length > 1 && (
                <> <button type="button" onClick={prevSlide} className="absolute top-1/2 left-3 -translate-y-1/2 bg-[#1A3C5A]/70 text-white p-2 rounded-full" >
                    ‹
                  </button>
                  <button type="button" onClick={nextSlide} className="absolute top-1/2 right-3 -translate-y-1/2 bg-[#1A3C5A]/70 text-white p-2 rounded-full">
                    ›
                  </button> </>
              )}
            </div>

            <div className="mt-3 flex justify-center gap-2 flex-wrap">
              {preview.map((src, index) => (
                <div key={index} className="relative">
                  <img src={src}  alt={`thumb-${index}`} onClick={() => setCurrentIndex(index)} className={`w-16 h-16 rounded-md object-cover cursor-pointer border-2 ${
                      currentIndex === index
                        ? "border-[#1A3C5A]"
                        : "border-transparent"
                    }`}/>
                  <button
                    type="button"
                    onClick={() => eliminarImagen(index)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <label className="block font-semibold mb-2 text-[#1A3C5A]"> Imágenes del vehículo </label>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} className="border border-gray-300 p-2.5 rounded-md w-full"/>
          <p className="text-sm text-gray-500 mt-1"> Puedes subir hasta 10 imágenes. </p>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button type="submit" className="bg-[#1A3C5A] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#244e6e]" >
            Guardar Vehículo
          </button>
          <button type="button" className="bg-gray-400 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-500" >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrarVehiculo;
