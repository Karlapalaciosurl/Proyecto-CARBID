import React, { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./variablesglobales/usuarioglobal";
import { useAlert } from "./variablesglobales/alertasglobales";
import { SocketContext } from "./variablesglobales/socketglobal"; 
import { fetchAuth } from "./token/fetchAuth";
import { backendUrl } from "./backendurl";


const Portal = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [now, setNow] = useState(new Date());
  const [paginaActual, setPaginaActual] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [estadisticas, setEstadisticas] = useState({});
  const porPagina = 5;
  const navigate = useNavigate();
  const { usuario } = useContext(UserContext);
  const { mostrarAlerta } = useAlert();
  const socket = useContext(SocketContext);

  // Obtener vehículos
  const obtenerVehiculos = async () => {
    const res = await fetchAuth.get("/vehiculos");
    setVehiculos(res.data || []);
  };

  // Obtener oferta maxima y participantes
  const obtenerEstadisticas = async () => {
    const res = await fetchAuth.get("/estadisticas");
    const mapa = {};
    (res.data || []).forEach((item) => {
      mapa[String(item.id_vehiculo)] = {
        oferta_maxima: item.oferta_maxima,
        participantes: item.participantes,
      };
    });
    setEstadisticas(mapa);
  };

  useEffect(() => {
    Promise.all([obtenerVehiculos(), obtenerEstadisticas()])
      .catch((err) => {
        mostrarAlerta("Error", "No se pudieron cargar las subastas.");
      })
      .finally(() => setCargando(false));
  }, [mostrarAlerta]);

  // actualizar el temporizador cada segundo (para que se vea el contador)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

//conexion al socket
  useEffect(() => {
    if (!socket) return;
    socket.emit("joinPortal");
    //console.log("Portal conectado a WebSocket:", socket.id);
    socket.on("nuevoVehiculo", (vehiculo) => {
    //console.log("Nuevo vehículo agregado:", vehiculo);
    setVehiculos((prev) => [vehiculo, ...prev]);
    });

    // Actualización de pujas 
    socket.on("actualizacionPuja", (data) => {
     //console.log("Actualización recibida en Portal:", data);
      const key = String(data.id_vehiculo);
      setEstadisticas((prev) => ({
        ...prev,
        [key]: {
          oferta_maxima: data.oferta_maxima,
          participantes: data.participantes,
        },
      }));
    });

    // apagar el socket al salir
    return () => {
      socket.off("nuevoVehiculo");
      socket.off("actualizacionPuja");
    };
  }, [socket]);

  // Navegación con validaciones
  const irASubasta = (vehiculo) => {
    const inicio = new Date(vehiculo.fecha_inicio);
    const fin = new Date(vehiculo.fecha_fin);

    if (!usuario) {
      mostrarAlerta("Precaucion", "Debes iniciar sesión para poder pujar.");
      return;
    }

    if (now < inicio) {
      mostrarAlerta("Precaucion", "Esta subasta aún no ha iniciado.");
      return;
    }

    if (now > fin) {
      mostrarAlerta("Error", "Esta subasta ya finalizó.");
      return;
    }

    navigate(`/subasta/${vehiculo.id}`);
  };

  const getEstado = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin)
      return { estado: "invalida", texto: "Fechas no configuradas" };

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime()))
      return { estado: "invalida", texto: "Fechas inválidas" };

    if (now < inicio) return { estado: "pendiente", texto: "Pendiente de iniciar" };
    if (now >= inicio && now <= fin) {
      const diff = fin - now;
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      return { estado: "activa", texto: `Faltan ${d}d ${h}h ${m}m ${s}s` };
    }
    return { estado: "finalizada", texto: "Subasta finalizada" };
  };

  // filtrar vehículos vigentes y ordenar
  const vehiculosMostrar = useMemo(() => {
    return (vehiculos || [])
      .map((v) => {
        const inicio = new Date(v.fecha_inicio);
        const fin = new Date(v.fecha_fin);
        const ahora = now;
        let tipo = "pendiente";
        if (ahora >= inicio && ahora <= fin) tipo = "activa";
        else if (ahora > fin) tipo = "finalizada";
        return { ...v, tipo };
      })
      .filter((v) => v.tipo !== "finalizada")
      .sort((a, b) => {
        if (a.tipo === "activa" && b.tipo !== "activa") return -1;
        if (a.tipo !== "activa" && b.tipo === "activa") return 1;
        return new Date(a.fecha_inicio) - new Date(b.fecha_inicio);
      });
  }, [vehiculos, now]);

  // paginacion
  const totalPaginas = Math.max(1, Math.ceil(vehiculosMostrar.length / porPagina));

  useEffect(() => {
    if (paginaActual > totalPaginas) setPaginaActual(1);
  }, [totalPaginas, paginaActual]);

  const indiceInicio = (paginaActual - 1) * porPagina;
  const indiceFin = indiceInicio + porPagina;
  const vehiculosPagina = vehiculosMostrar.slice(indiceInicio, indiceFin);

  const cambiarPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
        <p className="text-[#1A3C5A] font-semibold text-lg animate-pulse">
          Cargando vehículos en subasta...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center pt-24 pb-12 px-8">
      <h1 className="text-3xl font-bold text-[#1A3C5A] mb-8 text-center"> Vehículos en subasta</h1>

      <div className="w-full max-w-[1000px] flex flex-col gap-6">
        {vehiculosPagina.length === 0 ? (
          <p className="text-gray-600 text-center">No hay subastas vigentes.</p>
        ) : (
          vehiculosPagina.map((v) => {
            const imagenes = JSON.parse(v.imagenes || "[]");
            const img = imagenes.length
              ? `${backendUrl}/uploads/${imagenes[0]}`
              : "https://via.placeholder.com/400x200?text=Sin+imagen";
            const { estado, texto } = getEstado(v.fecha_inicio, v.fecha_fin);
            const key = String(v.id);
            const info = estadisticas[key] || { oferta_maxima: 0, participantes: 0 };

            return (
              <div key={v.id} className="flex bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition" >
                <img src={img} alt={v.modelo} className="w-64 h-48 object-cover" />
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div> 
                    <h2 className="text-xl font-semibold text-[#1A3C5A] uppercase"> {v.marca} {v.modelo} {v.anio} </h2>
                    <p className={`mt-3 text-sm font-semibold ${
                        estado === "pendiente"
                          ? "text-yellow-500"
                          : estado === "activa"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}>{texto}
                    </p>

                    <p className="text-gray-600 text-sm mt-1">
                      <span className="font-semibold text-[#1A3C5A]"> {v.tipo === "pendiente" ? "Inicia:" : "Cierre:"} </span>{" "}
                      {new Date( v.tipo === "pendiente" ? v.fecha_inicio : v.fecha_fin).toLocaleString("es-GT", { dateStyle: "short", timeStyle: "short", })}
                    </p>
                  </div>

                  <div className="flex justify-between text-sm font-semibold text-[#1A3C5A] mt-3">
                    <span> OFERTA Q{" "} {Number(info.oferta_maxima || 0).toLocaleString("es-GT")} </span>
                    <span>PARTICIPANTES {info.participantes || 0}</span>
                  </div>

                  <div className="flex justify-end items-center mt-3 gap-8">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-500"> PRECIO INICIAL </p>
                      <p className="text-2xl font-extrabold text-[#1A3C5A] mt-1"> Q {Number(v.precio_base).toLocaleString("es-GT")} </p>
                    </div>
                    <button onClick={() => irASubasta(v)}  disabled={estado !== "activa"} className={`px-5 py-2 rounded-full font-semibold text-base transition ${ estado === "activa"
                          ? "bg-[#1A3C5A] text-white hover:bg-[#244e6e]"
                          : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}>{estado === "pendiente" ? "Próximamente" : "Pujar ahora"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
          <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1} className="px-4 py-2 bg-[#1A3C5A] text-white rounded-full disabled:bg-gray-400" >
            Anterior
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => cambiarPagina(num)}
              className={`w-9 h-9 rounded-full font-semibold transition ${
                paginaActual === num
                  ? "bg-[#1A3C5A] text-white"
                  : "bg-gray-200 text-[#1A3C5A] hover:bg-gray-300"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} className="px-4 py-2 bg-[#1A3C5A] text-white rounded-full disabled:bg-gray-400" >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default Portal;
