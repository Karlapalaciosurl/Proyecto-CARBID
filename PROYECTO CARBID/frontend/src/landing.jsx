import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#1A3C5A] via-[#2F5D7C] to-[#3F7392] text-white overflow-hidden">

      <img
        src="/images/carroblancolanding.png"
        alt="Auto Carbid"
       className="absolute right-[-10%] bottom-[-30px]
             w-[60vw] md:w-[65vw] lg:w-[70vw]
             opacity-95 drop-shadow-[0_25px_45px_rgba(0,0,0,0.5)]
             select-none pointer-events-none z-0"
/>
      <div className="absolute bottom-0 left-0 w-full h-[150px] bg-gradient-to-t from-[#1A3C5A] via-[#1A3C5A]/70 to-transparent"></div>
      <header className="flex justify-between items-center px-8 py-5 bg-[#1A3C5A]/80 backdrop-blur-md relative z-20">
        <h1 className="text-2xl font-bold tracking-wide">CARBID</h1>
        <nav className="space-x-6 text-sm font-medium flex items-center">
          <a href="#features" className="hover:text-gray-300 transition">Características</a>
          <a href="#about" className="hover:text-gray-300 transition">Sobre Nosotros</a>
          <Link
            to="/login"
            className="bg-white text-[#1A3C5A] px-4 py-1.5 rounded-full font-semibold hover:bg-gray-200 transition"
          >
            Iniciar Sesión
          </Link>
        </nav>
      </header>

      <main className="relative z-30 flex flex-col justify-center px-8 md:px-20 lg:px-32 mt-8 md:mt-0 mb-10">
        <div className="max-w-2xl leading-tight">
          <h2 className="text-[2rem] md:text-[2.8rem] lg:text-[3.2rem] font-extrabold mb-6 drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
            Somos la mejor{" "}
            <span className="block text-gray-200">compañía de autos</span>
            <span className="block text-gray-300">para comprar, vender y subastar</span>
          </h2>

          <p className="text-base text-gray-100 mb-8 max-w-md">
            Bienvenido a <span className="font-semibold text-white">Carbid</span> — una
            plataforma moderna donde podrás pujar, vender y adquirir vehículos de forma rápida,
            segura y profesional.
          </p>

          <div className="flex gap-3 flex-wrap">
            <Link
              to="/portal"
              className="bg-white text-[#1A3C5A] font-semibold px-6 py-2 rounded-full shadow-lg hover:scale-105 hover:bg-gray-100 transition text-sm"
            >
              Explorar Subastas
            </Link>
            <a
              href="#about"
              className="border border-white text-white font-semibold px-6 py-2 rounded-full hover:bg-white hover:text-[#1A3C5A] transition text-sm"
            >
              Saber Más
            </a>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-200 py-3 bg-[#1A3C5A]/80 relative z-20">
        © {new Date().getFullYear()} Carbid. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Landing;
