import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "./variablesglobales/usuarioglobal";
import { SocketContext } from "./variablesglobales/socketglobal";
import { useAlert } from "./variablesglobales/alertasglobales";
import { fetchAuth } from "./token/fetchAuth";
import { backendUrl } from "./backendurl";


const Subasta = () => {
  const { id } = useParams();
  const { usuario } = useContext(UserContext);
  const socket = useContext(SocketContext);
  const { mostrarAlerta } = useAlert();
  const navigate = useNavigate();
  const [vehiculo, setVehiculo] = useState(null);
  const [pujas, setPujas] = useState([]);
  const [nuevaPuja, setNuevaPuja] = useState("");
  const [tiempoRestante, setTiempoRestante] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);

    useEffect(() => {
    if (!usuario) {
      mostrarAlerta("Error", "Debes iniciar sesión para acceder a las subastas.");
      navigate("/login");
    }
  }, [usuario, navigate, mostrarAlerta]);

  // Cargar vehículo y pujas
  const obtenerDatos = async () => {
    try {
      const vehiculoRes = await fetchAuth.get(`/vehiculos/${id}`);
      setVehiculo(vehiculoRes.data);

      const pujasRes = await fetchAuth.get(`/pujas/${id}`);
      setPujas(pujasRes.data);
    } catch (error) {
      mostrarAlerta("Error", "No se pudieron obtener los datos de la subasta.");
    }
  };

  // Calcular tiempo restante
  const calcularTiempo = (fechaFin) => {
    const ahora = new Date();
    const fin = new Date(fechaFin);
    const diff = fin - ahora;
    if (diff <= 0) return "Subasta finalizada";

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diff / (1000 * 60)) % 60);
    const segundos = Math.floor((diff / 1000) % 60);

    return `${dias}D ${horas}H ${minutos}M ${segundos}S`;
  };

  //  Contador
  useEffect(() => {
    if (!vehiculo?.fecha_fin) return;
    const interval = setInterval(() => {
      setTiempoRestante(calcularTiempo(vehiculo.fecha_fin));
    }, 1000);
    return () => clearInterval(interval);
  }, [vehiculo]);

  useEffect(() => {
    obtenerDatos();
  }, [id]);

  // Socket: conexión a subasta específica
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("joinSubasta", id);
    //console.log(`Unido al grupo de subasta_${id}`);

    socket.on("pujaActualizada", (data) => {
      if (Number(data.id_vehiculo) === Number(id)) {
        //console.log("Nueva puja detectada en tiempo real:", data);
        obtenerDatos();
      }
    });

    return () => {
      socket.off("pujaActualizada");
      //console.log(`Saliste de la sala subasta_${id}`);
    };
  }, [socket, id]);

  // Registrar nueva puja (solo una por usuario, excepto el vendedor)
  const manejarPuja = async () => {
    if (!nuevaPuja)
      return mostrarAlerta("Precaucion", "Ingresa una cantidad válida.");
    if (!usuario)
      return mostrarAlerta("Precaucion", "Debes iniciar sesión para pujar.");

    // Validar que el creador de la subasta no pueda pujar
    if (vehiculo.id_usuario === usuario.id) {
      return mostrarAlerta("Error", "No puedes pujar en una subasta que tú creaste." );
    }

    // Verificar si ya ha pujado antes
    const yaPujado = pujas.some((p) => p.id_usuario === usuario.id);
    if (yaPujado) {
      return mostrarAlerta( "Error","Solo puedes realizar una puja en esta subasta.");
    }

    const monto = parseFloat(nuevaPuja);
    if (isNaN(monto) || monto <= 0)
      return mostrarAlerta("Error", "El monto ingresado no es válido.");

    // monto miunimo
    let minimoPermitido = vehiculo.precio_base;
    if (pujas.length > 0) {
      const ultimaPuja = Math.max(...pujas.map((p) => p.monto));
      minimoPermitido = Math.max(minimoPermitido, ultimaPuja);
    }

    if (monto <= minimoPermitido) {
      return mostrarAlerta( "Precaucion",`La puja debe ser mayor a Q${minimoPermitido.toLocaleString("es-GT")}.` );
    }

    try {
      await fetchAuth.post("/pujas", {
        id_vehiculo: id,
        monto,
        id_usuario: usuario.id,
      });

      setNuevaPuja("");
      mostrarAlerta("Exito", "Puja registrada correctamente");
      obtenerDatos();
    } catch (error) {
      //console.error("Error al registrar la puja:", error);
      mostrarAlerta("Error", "No se pudo registrar la puja.");
    }
  };

  //  Carrusel
  const nextSlide = () => {
    if (!vehiculo?.imagenes) return;
    const total = JSON.parse(vehiculo.imagenes).length;
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    if (!vehiculo?.imagenes) return;
    const total = JSON.parse(vehiculo.imagenes).length;
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  if (!vehiculo) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Cargando subasta...
      </div>
    );
  }

  // Bloquear botón si ya pujó o si es el creador
  const yaPujado = usuario && pujas.some((p) => p.id_usuario === usuario.id);
  const esCreador = usuario && vehiculo.id_usuario === usuario.id;
  const botonDeshabilitado = yaPujado || esCreador;

  return (
    <div className="bg-[#F4F6F9] min-h-screen pt-[100px] pb-8 px-10">
      <h1 className="text-2xl font-bold text-[#1A3C5A] mb-6">{vehiculo.marca} {vehiculo.modelo} {vehiculo.anio} </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col items-center">
          {vehiculo.imagenes && (
            <>
              <div className="relative w-full max-w-[700px] h-[400px] overflow-hidden rounded-xl shadow-lg">
                <img
                  src={`${backendUrl}/uploads/${
                    JSON.parse(vehiculo.imagenes)[currentIndex]
                  }`}
                  alt={`vehiculo-${currentIndex}`}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                {JSON.parse(vehiculo.imagenes).length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevSlide}
                      className="absolute top-1/2 left-3 -translate-y-1/2 bg-[#1A3C5A]/70 text-white p-2 rounded-full hover:bg-[#244e6e]"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      className="absolute top-1/2 right-3 -translate-y-1/2 bg-[#1A3C5A]/70 text-white p-2 rounded-full hover:bg-[#244e6e]"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              <div className="mt-4 flex justify-center gap-2 flex-wrap">
                {JSON.parse(vehiculo.imagenes).map((img, index) => (
                  <img
                    key={index}
                    src={`${backendUrl}/uploads/${img}`}
                    alt={`thumb-${index}`}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-20 h-20 rounded-md object-cover cursor-pointer border-2 ${
                      currentIndex === index
                        ? "border-[#1A3C5A]"
                        : "border-transparent"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col justify-between h-[480px]">
          <div>
            <h2 className="text-lg font-semibold text-[#1A3C5A] mb-2"> Descripción del Vehículo </h2>
            <p className="text-gray-600 mb-4">{vehiculo.descripcion}</p>
            <p className="text-sm font-semibold text-[#1A3C5A]"> Cuenta regresiva de subasta: </p>
            <p className="text-red-500 font-bold text-lg">{tiempoRestante}</p>
          </div>

          <div className="mt-4 border-t pt-4">
            <h2 className="text-lg font-semibold text-[#1A3C5A] mb-2"> Oferta Base </h2>
            <p className="text-2xl font-bold text-[#1A3C5A] mb-4"> Q {vehiculo.precio_base.toLocaleString()} </p>

            <input type="number" value={nuevaPuja} onChange={(e) => setNuevaPuja(e.target.value)} className="border rounded-lg p-2 w-full mb-2 focus:ring-[#1A3C5A] focus:border-[#1A3C5A]" disabled={botonDeshabilitado} />
            <p className="text-sm text-gray-500 mb-3"> Mínimo permitido: Q{" "}
              {Math.max(
                vehiculo.precio_base,
                pujas.length > 0 ? Math.max(...pujas.map((p) => p.monto)) : 0
              ).toLocaleString("es-GT")}
            </p>

            <button
              onClick={manejarPuja} disabled={botonDeshabilitado} className={`w-full py-2 rounded-full font-semibold transition ${ botonDeshabilitado
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-[#1A3C5A] text-white hover:bg-[#244e6e]"
              }`}
            >
              {esCreador
                ? "Eres el creador de la subasta"
                : yaPujado
                ? "Ya participaste"
                : "Pujar Ahora"}
            </button>
          </div>
        </div>
      </div>

<div className="bg-white mt-8 p-6 rounded-xl shadow-lg">
  <h2 className="text-xl font-semibold text-[#1A3C5A] mb-4"> Participantes </h2>

  <div className="max-h-[320px] overflow-y-auto rounded-lg border border-gray-200">
    <table className="min-w-full text-sm">
      <thead className="bg-gray-100 text-[#1A3C5A] sticky top-0">
        <tr>
          <th className="text-left py-2 px-3 w-[50px]">#</th>
          <th className="text-left py-2 px-3">Nombre</th>
          <th className="text-left py-2 px-3">Oferta Actual</th>
        </tr>
      </thead>
      <tbody>
        {pujas.length > 0 ? (
          pujas
            .slice((paginaActual - 1) * 10, paginaActual * 10)
            .map((p, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3 font-semibold text-gray-600">
                  {(paginaActual - 1) * 10 + (index + 1)}
                </td>
                <td className="py-2 px-3">
                  {p.usuario || `Usuario ${index + 1}`}
                </td>
                <td className="py-2 px-3">
                  Q {p.monto.toLocaleString("es-GT")}
                </td>
              </tr>
            ))
        ) : (
          <tr>
            <td colSpan="3" className="text-center text-gray-500 py-4"> No hay pujas registradas </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>


  {pujas.length > 0 && (
    <p className="text-sm text-gray-500 mt-3 text-center">
      Mostrando{" "}
      {Math.min((paginaActual - 1) * 10 + 1, pujas.length)}–{Math.min(
        paginaActual * 10,
        pujas.length
      )}{" "}
      de {pujas.length} registros
    </p>
  )}

  {Math.ceil(pujas.length / 10) > 1 && (
    <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
      {/* Botón anterior */}
      <button
        onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
        disabled={paginaActual === 1}
        className={`px-4 py-2 rounded-full font-semibold transition ${
          paginaActual === 1
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-[#1A3C5A] text-white hover:bg-[#244e6e]"
        }`}
      >
        Anterior
      </button>

      {Array.from(
        { length: Math.ceil(pujas.length / 10) },
        (_, i) => i + 1
      ).map((num) => (
        <button
          key={num}
          onClick={() => setPaginaActual(num)}
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
        onClick={() =>
          setPaginaActual((prev) =>
            prev < Math.ceil(pujas.length / 10) ? prev + 1 : prev
          )
        }
        disabled={paginaActual >= Math.ceil(pujas.length / 10)}
        className={`px-4 py-2 rounded-full font-semibold transition ${
          paginaActual >= Math.ceil(pujas.length / 10)
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-[#1A3C5A] text-white hover:bg-[#244e6e]"
        }`}
      >
        Siguiente
      </button>
    </div>
  )}
</div>

    </div>
  );
};

export default Subasta;
