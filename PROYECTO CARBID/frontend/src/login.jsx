import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "./variablesglobales/usuarioglobal.jsx";
import { useAlert } from "./variablesglobales/alertasglobales";
import api from "./api/api";

const Login = () => {
  const navegar = useNavigate();
  const { setUsuario } = useContext(UserContext);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [carga, setCarga] = useState(false);
  const { mostrarAlerta } = useAlert();

 const enviarFormulario = async (e) => {
  e.preventDefault();
  setCarga(true);

  try {
    const res = await api.post("/login", { correo, password });
    //console.log("LOGIN RESPONSE:", res.data);
    localStorage.setItem("token", res.data.token);
    setUsuario(res.data.usuario);

    mostrarAlerta("Bienvenido",res.data.usuario.nombre);
    navegar("/portal");

  } catch (error) {
    mostrarAlerta("Error", error.response?.data?.message || "Error al iniciar sesión");
  } finally {
    setCarga(false);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1A3C5A]" style={{ fontFamily: "'Roboto', sans-serif" }}>
<div
  className="relative 
    w-[38vw] min-w-[340px] max-w-[480px] 
    h-[90vh] min-h-[600px] max-h-[900px]
    lg:w-[40vw] lg:max-w-[520px] lg:h-[92vh] lg:max-h-[950px]
    xl:w-[42vw] xl:max-w-[560px] xl:h-[99vh] xl:max-h-[1000px]
    rounded-xl overflow-hidden 
    shadow-[0_10px_40px_rgba(0,0,0,0.45)] 
    flex justify-center items-center 
    transition-all duration-500 "
  style={{ backgroundImage: "url('/images/logo-carro.png')", backgroundSize: "cover", backgroundPosition: "center", }} >


        {/* Capa oscura sobre el fondo */}
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.45)]"></div>
        {/* Caja central */}
        <div className="relative z-10 w-10/12 text-center text-white">
          {/* Logo */}
          <div className="flex justify-center items-center gap-2 mb-4">
            <h1 className="text-4xl font-bold tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              CARBID
            </h1>
            <img src="/images/carro.png" alt="Car icon" className="w-8 h-6 brightness-50 invert" />
          </div>
          {/* Subtítulo */}
          <p className="text-[13px] text-gray-200 font-light mb-6">
            Bienvenido al portal de subastas de vehículos
          </p>
          {/* Formulario */}
          <form onSubmit={enviarFormulario} className="flex flex-col items-center gap-4">
            <input type="email"  placeholder="Correo Electrónico" required value={correo} onChange={(e) => setCorreo(e.target.value)} className="w-[90%] px-4 py-2.5 text-[14px] border border-white/60 bg-white/10 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300" />
            <input type="password" placeholder="Contraseña" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-[90%] px-4 py-2.5 text-[14px] border border-white/60 bg-white/10 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300" />

            <button  type="submit" disabled={carga} className={`w-[90%] py-2.5 mt-3 ${ carga ? "bg-gray-500" : "bg-[#1A3C5A] hover:bg-[#0f2638]" } text-white text-[14px] font-bold rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.3)] transition-all duration-300`} >
              {carga ? "Verificando..." : "INICIAR SESIÓN"}
            </button>
          </form>

          {/* Crear cuenta */}
          <p className="mt-5 text-[13px] text-gray-200">
            ¿No tiene una cuenta?{" "}
            <Link to="/crearcuenta" className="font-bold text-white no-underline hover:text-gray-300 transition-colors">
              Crear
            </Link>
          </p>

          {/* Regresar */}
          <p className="mt-2 text-[13px] text-gray-200">
            ¿Quieres regresar?{" "}
            <Link to="/" className="font-bold text-white no-underline hover:text-gray-300 transition-colors">
              Regresar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
