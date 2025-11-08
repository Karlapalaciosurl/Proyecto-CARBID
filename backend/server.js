import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { sequelize } from "./db.js";
import { Op } from "sequelize";
import multer from "multer";
import { Vehiculo } from "./models/vehiculo.js";
import path from "path";
import { fileURLToPath } from "url";
import { Puja } from "./models/puja.js";
import { Usuario } from "./models/usuario.js";
import bcrypt from "bcrypt";
import "./models/asociaciones.js";
import { iniciarTareasProgramadas } from "./tareasprogramadas.js";
import { Notificacion } from "./models/notificacion.js";
import { ResultadoSubasta } from "./models/resultadosubasta.js";
import { enviarCorreo } from "./utils/mailer.js";
import { firmarJWT, verificarToken } from "./auth.js";

// Estados
const ESTADOS = {
  PENDIENTE: 1,
  ACTIVA: 2,
  FINALIZADA_SIN_CONFIRMAR: 3,
  FINALIZADA_RECHAZADA: 4,
  FINALIZADA_CONFIRMADA: 5,
  FINALIZADA_CON_COMPRA: 6,   
  FINALIZADA_SIN_COMPRA: 7,  
};

//Estados para el historial de subastas
function obtenerTextoEstado(estado) {
  const estados = {
    [ESTADOS.ACTIVA]: "ACTIVA",
    [ESTADOS.FINALIZADA_SIN_CONFIRMAR]: "FINALIZADA SIN CONFIRMAR",
    [ESTADOS.FINALIZADA_RECHAZADA]: "CERRADA SIN ÉXITO",
    [ESTADOS.FINALIZADA_CONFIRMADA]: "CERRADA CON ÉXITO",
    [ESTADOS.FINALIZADA_CON_COMPRA]: "VENTA EXITOSA",
    [ESTADOS.FINALIZADA_SIN_COMPRA]: "VENTA NO EXITOSA",
  };
  return estados[estado] || "DESCONOCIDO";
}


// Configuración de rutas y servidor base
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });


// Get para vehiculos 
app.get("/vehiculos", async (req, res) => {
  try {
    const ahora = new Date();
    const vehiculos = await Vehiculo.findAll({
      where: { fecha_fin: { [Op.gt]: ahora } },
      order: [["fecha_inicio", "ASC"]],
    });
    res.json(vehiculos);
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    res.status(500).json({ message: "Error al obtener vehículos" });
  }
});

// Esto me va a servir para que en a tabla se vea la oferta maxima y cuantos participantes hay
app.get("/estadisticas", async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT 
        id_vehiculo,
        IFNULL(MAX(monto), 0) AS oferta_maxima,
        COUNT(DISTINCT id_usuario) AS participantes
      FROM pujas
      GROUP BY id_vehiculo;
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
});


//Post para ingresar un vehiculo
app.post("/vehiculos", upload.array("imagenes", 10), async (req, res) => {
  try {
    const {
      marca,
      modelo,
      color,
      anio,
      descripcion,
      precio_base,
      fecha_inicio,
      fecha_fin,
      id_usuario,               
    } = req.body;

    const imagenes = (req.files || []).map((f) => f.filename);

    const nuevoVehiculo = await Vehiculo.create({
      marca,
      modelo,
      color,
      anio: anio ? Number(anio) : null,
      descripcion,
      precio_base: precio_base ? Number(precio_base) : null,
      fecha_inicio,
      fecha_fin,
      imagenes: JSON.stringify(imagenes),
      id_usuario: id_usuario ? Number(id_usuario) : null,  
      estado: 1,
    });

    // Socket para notificar que hay un nuevo vehiculo
    io.to("portal").emit("nuevoVehiculo", nuevoVehiculo);

    res.status(201).json({
      message: "Vehículo guardado correctamente",
      vehiculo: nuevoVehiculo,
    });
  } catch (error) {
    console.error("Error al guardar vehículo:", error);
    res.status(500).json({
      message: "Error en el servidor",
      detalle: error.message,
    });
  }
});

// Get para los vehiculo por id 
app.get("/vehiculos/:id",verificarToken, async (req, res) => {
  const vehiculo = await Vehiculo.findByPk(req.params.id);
  if (!vehiculo)
    return res.status(404).json({ message: "Vehículo no encontrado" });
  res.json(vehiculo);
});

// tabla de participantes por vehiculo
app.get("/pujas/:id_vehiculo",verificarToken, async (req, res) => {
  try {
    const pujas = await Puja.findAll({
      where: { id_vehiculo: req.params.id_vehiculo },
      order: [["monto", "DESC"]],
      include: [
        {
          model: Usuario,
          attributes: ["id", "nombre", "apellido"],
          required: false,
        },
      ],
    });

    const respuesta = pujas.map((p) => ({
      id: p.id,
      monto: p.monto,
      id_usuario: p.id_usuario,
      usuario: p.Usuario
        ? `${p.Usuario.nombre} ${p.Usuario.apellido}`
        : "Usuario invitado",
    }));

    res.json(respuesta);
  } catch (error) {
    console.error("Error al obtener pujas:", error);
    res.status(500).json({ message: "Error al obtener pujas" });
  }
});

//Registrar nueva puja
app.post("/pujas", verificarToken, async (req, res) => {
  try {
    const { id_vehiculo, id_usuario, monto } = req.body;

    if (!id_vehiculo || !monto) {
      return res.status(400).json({
        message: "Faltan datos obligatorios: id_vehiculo o monto",
      });
    }

    const vehiculo = await Vehiculo.findByPk(id_vehiculo, {
      attributes: ["estado"],
    });

    if (!vehiculo) {
      return res.status(404).json({ message: "Vehículo no encontrado." });
    }

    // Solo permitir pujas si el estado es 2 
    if (vehiculo.estado !== 2) {
      return res.status(400).json({
        message: "Solo se pueden registrar pujas en subastas activas.",
      });
    }
    const nuevaPuja = await Puja.create({
      id_vehiculo: Number(id_vehiculo),
      id_usuario: id_usuario ? Number(id_usuario) : null,
      monto: Number(monto),
      fecha_puja: new Date(),
    });

    // Calcular oferta máxima y participantes actualizados
    const [resultados] = await sequelize.query(`
      SELECT 
        IFNULL(MAX(monto), 0) AS oferta_maxima,
        COUNT(DISTINCT id_usuario) AS participantes
      FROM pujas
      WHERE id_vehiculo = ${id_vehiculo};
    `);

    const datos = resultados[0];

    // Emitir actualización solo a los que están viendo ese vehículo
    io.to(`subasta_${id_vehiculo}`).emit("pujaActualizada", {
      id_vehiculo: Number(id_vehiculo),
      monto: nuevaPuja.monto,
      id_usuario: nuevaPuja.id_usuario,
    });

    // Actualizar estadísticas solo en el portal
    io.to("portal").emit("actualizacionPuja", {
      id_vehiculo: String(id_vehiculo),
      oferta_maxima: Number(datos.oferta_maxima) || 0,
      participantes: Number(datos.participantes) || 0,
    });

    res.status(201).json({
      message: "Puja registrada correctamente",
      puja: nuevaPuja,
    });
  } catch (error) {
    console.error("Error al guardar puja:", error);
    res.status(500).json({
      message: "Error en el servidor al guardar la puja",
      detalle: error.message,
    });
  }
});

//USUARIOS 

app.post("/usuarios", async (req, res) => {
  try {
    const { nombre, apellido, usuario, correo, password, telefono } = req.body;

     // Validar que no exista un usuario con el mismo nombre de usuario
  const existente = await Usuario.findOne({
  where: {
    [Op.or]: [
      { usuario },
      { correo }
    ]
  }
});

if (existente) {
  return res.status(400).json({
    message: existente.usuario === usuario
      ? "El nombre de usuario ya está en uso."
      : "El correo ya está registrado."
  });
}

    const hash = await bcrypt.hash(password, 10);

    const nuevo = await Usuario.create({
      nombre,
      apellido,
      usuario,
      correo,
      password: hash,
      telefono,
    });

    //generar codigo de verificacion 
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    nuevo.codigo_verificacion = codigo;
    await nuevo.save();

     await enviarCorreo(
      nuevo.correo,
      "Código de verificación - CARBID",
      `
        <h2>Tu código de verificación es:</h2>
        <h1 style="font-size:40px; letter-spacing:5px;">${codigo}</h1>
        <p>Ingresa este código en CARBID para verificar tu cuenta.</p>
      `
    );

    res.status(201).json({
      message: "Usuario registrado correctamente",
      id: nuevo.id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
});

app.post("/verificarcodigo", async (req, res) => {
  try {
    const { correo, codigo } = req.body;

    if (!correo || !codigo) {
      return res.status(400).json({ message: "Faltan datos." });
    }
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    if (usuario.email_verificado) {
      return res.json({ message: "El correo ya está verificado." });
    }
    if (usuario.codigo_verificacion !== codigo) {
      return res.status(400).json({ message: "Código incorrecto." });
    }
    usuario.email_verificado = true;
    usuario.codigo_verificacion = null;
    await usuario.save();

    return res.json({ message: "Correo verificado correctamente." });

  } catch (error) {
    return res.status(500).json({
      message: "Error al verificar código",
      error: error.message,
    });
  }
});


  app.put("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, usuario, correo } = req.body;

    const usuarioDB = await Usuario.findByPk(id);
    if (!usuarioDB) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await usuarioDB.update({
      nombre,
      apellido,
      usuario,
      correo,
    });

    res.json({ message: "Datos del usuario actualizados correctamente." });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({
      message: "Error al actualizar usuario",
      error: error.message,
    });
  }
});

app.put("/usuarios/:id/password", async (req, res) => {
  try {
    const { id } = req.params;
    const { contraseniaActual, contraseniaNueva } = req.body;

    // Buscar usuario
    const usuarioDB = await Usuario.findByPk(id);
    if (!usuarioDB) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Validar contraseña actual
    const esValida = await bcrypt.compare(contraseniaActual, usuarioDB.password);
    if (!esValida) {
      return res
        .status(401)
        .json({ message: "La contraseña actual no es correcta." });
    }

    // Generar nuevo hash y guardar
    const nuevoHash = await bcrypt.hash(contraseniaNueva, 10);
    await usuarioDB.update({ password: nuevoHash });

    res.json({ message: "Contraseña actualizada correctamente." });
  } catch (error) {
    console.error("Error al actualizar contraseña:", error);
    res.status(500).json({
      message: "Error al actualizar contraseña",
      error: error.message,
    });
  }
});



app.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    const user = await Usuario.findOne({ where: { correo } });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    //si no verifico el codigo 
    if (!user.email_verificado) {
  return res.status(400).json({
    message: "Debes verificar tu correo antes de iniciar sesión."
  });
}

    const valido = await bcrypt.compare(password, user.password);
    if (!valido)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    const { password: _, ...usuarioSinPassword } = user.toJSON();
    const token = firmarJWT({
      id: user.id,
      correo: user.correo,
      usuario: user.usuario,
    });
     return res.json({
      message: "Login exitoso",
      token: token,
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al iniciar sesión",
      error: error.message,
    });
  }
});

//notificaciones

app.post("/notificaciones", async (req, res) => {
  try {
    const { id_usuario, mensaje } = req.body;

    if (!id_usuario || !mensaje) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    const nueva = await Notificacion.create({
      id_usuario,
      mensaje,
    });

    res.status(201).json({
      message: "Notificación registrada correctamente",
      notificacion: nueva,
    });
  } catch (error) {
    console.error("Error al registrar notificación:", error);
    res.status(500).json({
      message: "Error al registrar notificación",
      error: error.message,
    });
  }
});

  // get notificaciones por usuario con informacion del vehiculo
app.get("/notificaciones/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const notificaciones = await Notificacion.findAll({
      where: { id_usuario },
      include: [
        {
          model: Vehiculo,
          attributes: ["id", "marca", "modelo", "anio", "id_usuario"], 
        },
      ],
      order: [["fecha", "DESC"]],
      attributes: ["id", "mensaje", "lectura", "fecha", "id_vehiculo", "tipo"],
    });

    res.json(notificaciones);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ message: "Error al obtener notificaciones" });
  }
});


//editar las notificaciones una vez ya la leyeron 
app.put("/notificaciones/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const notificacion = await Notificacion.findByPk(id);
    if (!notificacion) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    await notificacion.update({ lectura: 1 });

    res.json({ message: "Notificación marcada como leída" });
  } catch (error) {
    console.error("Error al actualizar notificación:", error);
    res.status(500).json({ message: "Error al actualizar notificación" });
  }
});
// obtener detalle de subasta del vendedor
app.get("/detallesubastavendedor/:id_vehiculo", async (req, res) => {
  try {
    const { id_vehiculo } = req.params;

    const vehiculo = await Vehiculo.findByPk(id_vehiculo, {
      include: [
        {
          model: ResultadoSubasta,
            as: "resultado_subasta",
          attributes: ["id_usuario", "monto_final", "fecha_registro"],
          include: [
            {
              model: Usuario,
              attributes: ["nombre", "apellido", "correo"],
            },
          ],
        },
      ],
    });

    if (!vehiculo)
      return res.status(404).json({ message: "Vehículo no encontrado" });

    res.json(vehiculo);
  } catch (error) {
    console.error("Error al obtener detalle de subasta del vendedor:", error);
    res.status(500).json({
      message: "Error al obtener detalle de subasta",
      detalle: error.message,
    });
  }
});

// parte para que el vendedor confirme que quiere vender
app.put("/vehiculos/:id/confirmar", async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener vehículo con datos relacionados
    const vehiculo = await Vehiculo.findByPk(id, {
      include: [
        {
          model: ResultadoSubasta,
          as: "resultado_subasta",
          attributes: ["id_usuario", "monto_final"],
          include: [
            {
              model: Usuario,
              attributes: ["id", "nombre", "apellido", "correo"],
            },
          ],
        },
        {
          model: Usuario, // vendedor
          attributes: ["nombre", "apellido", "correo"],
        },
      ],
    });

    if (!vehiculo) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    // Si no hay resultado de subasta
    if (!vehiculo.resultado_subasta) {
      return res.status(400).json({ message: "No hay oferta ganadora que confirmar." });
    }

    // Actualizar estado del vehículo
    await vehiculo.update({ estado: ESTADOS.FINALIZADA_CONFIRMADA });

    // Crear notificación para el comprador
    const compradorId = vehiculo.resultado_subasta.id_usuario;
    const correoVendedor = vehiculo.Usuario?.correo || "correo_no_disponible";

    await Notificacion.create({
      id_usuario: compradorId,
      id_vehiculo: id,
      mensaje: `El vendedor ha confirmado tu compra del vehículo ${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio}.
      Puedes comunicarte con él al correo: ${correoVendedor}`,
    });

    res.json({
      message: "Subasta confirmada y notificación enviada al comprador.",
    });
  } catch (error) {
    console.error("Error al confirmar venta:", error);
    res.status(500).json({
      message: "Error al confirmar venta",
      detalle: error.message,
    });
  }
});

// actualizacion por si quiere rechazar la oferta 
app.put("/vehiculos/:id/rechazar", async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener vehículo con sus relaciones
    const vehiculo = await Vehiculo.findByPk(id, {
      include: [
        {
          model: ResultadoSubasta,
          as: "resultado_subasta",
          attributes: ["id_usuario", "monto_final"],
          include: [
            {
              model: Usuario,
              attributes: ["nombre", "apellido", "correo"],
            },
          ],
        },
      ],
    });

    if (!vehiculo) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    // Si no hay resultado de subasta (nadie ofertó)
    if (!vehiculo.resultado_subasta) {
      return res.status(400).json({ message: "No hay oferta para rechazar." });
    }

    // Actualiza el estado del vehículo a FINALIZADA_RECHAZADA (4)
    await vehiculo.update({ estado: ESTADOS.FINALIZADA_RECHAZADA });

    // Crear notificación para el comprador
    const compradorId = vehiculo.resultado_subasta.id_usuario;
    await Notificacion.create({
      id_usuario: compradorId,
      id_vehiculo: id,
      mensaje: `Lo sentimos. El vendedor ha rechazado tu oferta por el vehículo ${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio}.`,
    });

    res.json({
      message: "Oferta rechazada y notificación enviada al comprador.",
    });
  } catch (error) {
    console.error("Error al rechazar oferta:", error);
    res.status(500).json({
      message: "Error al rechazar oferta",
      detalle: error.message,
    });
  }
});

// si se concreto la venta o no 
app.put("/vehiculos/:id/confirmarventadefinitiva", async (req, res) => {
  try {
    const { id } = req.params;
    const { realizado } = req.body; // true = venta exitosa, false = no concretada

    // Buscar el vehículo
    const vehiculo = await Vehiculo.findByPk(id);
    if (!vehiculo) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    // Determinar nuevo estado
    const nuevoEstado = realizado ? 6 : 7; // 6 = FINALIZADA_CON_COMPRA, 7 = FINALIZADA_SIN_COMPRA

    // Actualizar el estado
    await vehiculo.update({ estado: nuevoEstado });

    res.json({
      message: `Estado actualizado correctamente a ${
        realizado ? "FINALIZADA_CON_COMPRA" : "FINALIZADA_SIN_COMPRA"
      }.`,
      estado: nuevoEstado,
    });
  } catch (error) {
    console.error("Error al confirmar venta definitiva:", error);
    res.status(500).json({
      message: "Error al confirmar venta definitiva",
      detalle: error.message,
    });
  }
});


// traer el historial por usuario
app.get("/historial/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params;

    // si el usuario es vendedor
    const vehiculosVendedor = await Vehiculo.findAll({
      where: { id_usuario },
      include: [
        {
          model: ResultadoSubasta,
          as: "resultado_subasta",
          include: [{ model: Usuario, attributes: ["nombre", "apellido"] }],
        },
      ],
    });

    // el usuario es comprador
    const vehiculosComprador = await Vehiculo.findAll({
      include: [
        {
          model: ResultadoSubasta,
          as: "resultado_subasta",
          where: { id_usuario },
          include: [{ model: Usuario, attributes: ["nombre", "apellido"] }],
        },
      ],
    });

    // usuario participante no ganador
    const vehiculosParticipante = await Vehiculo.findAll({
      where: { estado: { [Op.notIn]: [ESTADOS.PENDIENTE, ESTADOS.ACTIVA] } },
      include: [
        { model: Puja, where: { id_usuario } },
        { model: ResultadoSubasta, as: "resultado_subasta", required: false },
      ],
    });

    // comprador no concretado
    const soloParticipante = vehiculosParticipante.filter(
      (v) => v.resultado_subasta?.id_usuario !== parseInt(id_usuario)
    );

    // unificar 
    const historial = [
      ...vehiculosVendedor.map((v) => ({
        rol: "VENDEDOR",
        estado: v.estado,
        texto_estado: obtenerTextoEstado(v.estado),
        vehiculo: `${v.marca} ${v.modelo} ${v.anio}`,
        oferta_final: v.resultado_subasta?.monto_final || null,
        fecha_cierre: v.fecha_fin,
      })),
      ...vehiculosComprador.map((v) => ({
        rol: "COMPRADOR",
        estado: v.estado,
        texto_estado: obtenerTextoEstado(v.estado),
        vehiculo: `${v.marca} ${v.modelo} ${v.anio}`,
        oferta_final: v.resultado_subasta?.monto_final || null,
        fecha_cierre: v.fecha_fin,
      })),
      ...soloParticipante.map((v) => ({
        rol: "PARTICIPANTE",
        estado: "VIRTUAL",
        texto_estado: "PARTICIPASTE",
        vehiculo: `${v.marca} ${v.modelo} ${v.anio}`,
        oferta_final: v.resultado_subasta?.monto_final || null,
        fecha_cierre: v.fecha_fin,
      })),
    ];

    historial.sort((a, b) => new Date(b.fecha_cierre) - new Date(a.fecha_cierre));

    res.json(historial);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({
      message: "Error al obtener historial",
      detalle: error.message,
    });
  }
});

//prueba para correo
app.get("/probar-correo", async (req, res) => {
  const exito = await enviarCorreo(
    "karlaa.trab@gmail.com",
    "Prueba desde CARBID",
    "<h1>Funciona el correo de verificación de CARBID</h1>"
  );

  if (exito) res.send("CORREO ENVIADO");
  else res.send("ERROR AL ENVIAR CORREO");
});

//Pruebas para el socket
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("verde: Cliente conectado:", socket.id);

  // saber cuando el usuario este metido en el portal para evitar sobrecargas 
  socket.on("joinPortal", () => {
    socket.join("portal");
    console.log(`${socket.id} unido al grupo portal`);
  });

  // cuando el cliente esta en una subasta
  socket.on("joinSubasta", (vehiculoId) => {
    socket.join(`subasta_${vehiculoId}`);
    console.log(`${socket.id} unido a subasta_${vehiculoId}`);
  });

  socket.on("disconnect", () => {
    console.log("rojo: Cliente desconectado:", socket.id);
  });
});

//Probar que el servidor este escuchando correctamente
server.listen(4000, async () => {
  console.log("Servidor activo en puerto 4000 con WebSockets habilitado");
  try {
    await sequelize.authenticate();
    console.log("Conexión verificada correctamente con base de datos");
    iniciarTareasProgramadas();
  } catch (error) {
    console.error("Error de conexión:", error.message);
  }
});
