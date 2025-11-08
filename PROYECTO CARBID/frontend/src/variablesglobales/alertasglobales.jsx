import React, { createContext, useState, useContext, useCallback } from "react";

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alerta, setAlerta] = useState(null);

   const mostrarAlerta = useCallback((tipo, mensaje) => {
    setAlerta({ tipo, mensaje });

    setTimeout(() => {
      setAlerta(null);
    }, 3000);
  }, []);

  const colores = {
    info: "text-blue-800 border-blue-300 bg-blue-50",
    Exito: "text-green-800 border-green-300 bg-green-50",
    Precaucion: "text-yellow-800 border-yellow-300 bg-yellow-50",
    Error: "text-red-800 border-red-300 bg-red-50",
    Bienvenido: "text-blue-800 border-blue-300 bg-blue-50"
  };

  return (
    <AlertContext.Provider value={{ mostrarAlerta }}>
      {children}

      {/* Alerta visible */}
      {alerta && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center p-4 mb-4 text-sm border rounded-lg shadow-md w-[350px] transition-all duration-500 ${colores[alerta.tipo]}`}
          role="alert"
        >
          <svg
            className="shrink-0 inline w-5 h-5 me-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <div>
            <span className="font-semibold capitalize">
              {alerta.tipo}:
            </span>{" "}
            {alerta.mensaje}
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};
