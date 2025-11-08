import React, { createContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { socket } from "../socket";

export const SocketContext = createContext(socket);

export const SocketProvider = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    const ruta = location.pathname;
    const activar = ruta.startsWith("/portal") || ruta.startsWith("/subasta");

    if (activar) {
      if (!socket.connected) {
        socket.connect();
       // console.log("Socket conectado en:", ruta);
      }
    } else {
      if (socket.connected) {
        socket.disconnect();
       // console.log("Socket desconectado fuera de Portal/Subasta");
      }
    }

    // cleanup opcional
    return () => {};
  }, [location.pathname]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
