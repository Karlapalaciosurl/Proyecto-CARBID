// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation  } from "react-router-dom";
import Landing from "./landing";
import Login from "./login";
import Portal from "./portal";
import RegistrarVehiculo from "./componentes/registrovehiculo";
import Subasta from "./subasta";
import Header from "./componentes/header";
import { UserProvider } from "./variablesglobales/usuarioglobal";
import { AlertProvider } from "./variablesglobales/alertasglobales"; 
import { SocketProvider } from "./variablesglobales/socketglobal";
import ConfiguracionUsuario from "./configuracionusuario";
import CambiarPassword from "./cambiarpassword";
import Notificaciones from "./notificaciones";
import DetalleSubastaVendedor from "./detallesubastavendedor";
import DetalleSubastaComprador from "./detallesubastacomprador";
import Confirmacion from "./confirmacion";
import HistorialSubastas from "./historialsubastas";
import CrearCuenta from "./crearcuenta";
import VerificarCorreo from "./verificarcorreo";


// que rutas muestra el header
const AppContent = () => {
  const location = useLocation();
  const ocultarHeader = ["/", "/login","/crearcuenta"];
  const mostrarHeader = !ocultarHeader.includes(location.pathname);

  return (
    <>
      {mostrarHeader && <Header />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/registrar" element={<RegistrarVehiculo />} />
        <Route path="/subasta/:id" element={<Subasta />} />
        <Route path="/configuracionusuario" element={<ConfiguracionUsuario/>} />
        <Route path="/cambiarpassword" element={<CambiarPassword />} />
        <Route path="/notificaciones" element={<Notificaciones />} />
        <Route path="/detallesubastavendedor/:id_vehiculo" element={<DetalleSubastaVendedor />}/>
        <Route path="/detallesubastacomprador/:id_vehiculo" element={<DetalleSubastaComprador />}/>
        <Route path="/confirmacion/:id_vehiculo" element={<Confirmacion />}/>
        <Route path="/historialsubastas" element={<HistorialSubastas />} />
        <Route path="/crearcuenta" element={<CrearCuenta />} />
        <Route path="/verificarcorreo" element={<VerificarCorreo />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <UserProvider>
      <AlertProvider>
      <Router>
        <SocketProvider>
        <AppContent />
        </SocketProvider>
      </Router>
      </AlertProvider>
    </UserProvider>
  );
}

export default App;

