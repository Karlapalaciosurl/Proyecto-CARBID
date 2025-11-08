import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const dataGuardada = localStorage.getItem("usuario");
    if (dataGuardada) {
      setUsuario(JSON.parse(dataGuardada));
    }
  }, []);

  useEffect(() => {
      if (usuario) {
    localStorage.setItem("usuario", JSON.stringify(usuario));
    }
  }, [usuario]);

  //console.log("CONTEXT ACTUAL:", usuario);

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
  };

  return (
    <UserContext.Provider value={{ usuario, setUsuario, cerrarSesion }}>
      {children}
    </UserContext.Provider>
  );
};
