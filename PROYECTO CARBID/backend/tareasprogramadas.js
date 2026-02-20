import cron from "node-cron";
import { Op } from "sequelize";
import { Vehiculo } from "./models/vehiculo.js";
import { Puja } from "./models/puja.js";
import { ResultadoSubasta } from "./models/resultadosubasta.js";
import { Notificacion } from "./models/notificacion.js";
import { sequelize } from "./db.js"; 
const ESTADOS = {
  PENDIENTE: 1,
  ACTIVA: 2,
  FINALIZADA_SIN_CONFIRMAR: 3,
  FINALIZADA_RECHAZADA: 4,
  FINALIZADA_CONFIRMADA: 5,
};

async function verificarYActualizarSubastas() {
  const ahora = new Date();

  // buscar si hay subastas pendientes de ser activadas 
  const pendientes = await Vehiculo.count({
    where: {
      estado: ESTADOS.PENDIENTE,
      fecha_inicio: { [Op.lte]: ahora },
      fecha_fin: { [Op.gt]: ahora },
    },
  });

  if (pendientes > 0) {
    console.log(`Activando ${pendientes} subasta(s) pendientes`);
    await Vehiculo.update(
      { estado: ESTADOS.ACTIVA },
      {
        where: {
          estado: ESTADOS.PENDIENTE,
          fecha_inicio: { [Op.lte]: ahora },
          fecha_fin: { [Op.gt]: ahora },
        },
      }
    );
  }

  // cerrar las subastas que ya hayan pasado su fecha fin
  const porCerrar = await Vehiculo.findAll({
    where: {
      estado: ESTADOS.ACTIVA,
      fecha_fin: { [Op.lte]: ahora },
    },
    attributes: ["id", "marca", "modelo", "id_usuario"],
  });

  if (porCerrar.length > 0) {
    console.log(`Cerrando ${porCerrar.length} subasta(s) activas`);

    for (const v of porCerrar) {
      const mejorPuja = await Puja.findOne({
        where: { id_vehiculo: v.id },
        order: [["monto", "DESC"]],
        attributes: ["id_usuario", "monto"],
      });

      await Vehiculo.update(
        { estado: ESTADOS.FINALIZADA_SIN_CONFIRMAR },
        { where: { id: v.id } }
      );

      // insertar el mejor posto el resultados_subasta
      await ResultadoSubasta.findOrCreate({
        where: { id_vehiculo: v.id },
        defaults: {
          id_usuario: mejorPuja ? mejorPuja.id_usuario : null,
          monto_final: mejorPuja ? mejorPuja.monto : null,
          fecha_registro: new Date(),
        },
      });

      // Notificaciones automaticas para el vendedor y el ganador
      try {
        const fechaActual = new Date();
        const notificaciones = [];

        // vendedor
        notificaciones.push({
          id_usuario: v.id_usuario,
          id_vehiculo: v.id,
          mensaje: `Tu subasta del ${v.marca} ${v.modelo} ha finalizado.`,
          lectura: 0,
          fecha: fechaActual,
          tipo: 1,
        });

        // el mejor posto
        if (mejorPuja && mejorPuja.id_usuario) {
          notificaciones.push({
            id_usuario: mejorPuja.id_usuario,
            id_vehiculo: v.id,
            mensaje: `Fuiste el mejor postor de la subasta del ${v.marca} ${v.modelo}. El vendedor decidirá si acepta tu oferta.`,
            lectura: 0,
            fecha: fechaActual,
            tipo: 2,
          });
        }

        //insertarlas todas
        if (notificaciones.length > 0) {
          await Notificacion.bulkCreate(notificaciones);
          console.log(
            `→ ${notificaciones.length} notificación(es) generadas para subasta #${v.id}`
          );
        }
      } catch (e) {
        console.error("Error al crear notificaciones:", e.message);
      }
    }
  }

  // borrar las notificaciones que lleven mas de 3 dias 
  const haceTresDias = new Date();
  haceTresDias.setDate(haceTresDias.getDate() - 3);

  const notificacionesViejas = await Notificacion.findAll({
    where: { fecha: { [Op.lt]: haceTresDias } },
    attributes: ["id"],
  });

  if (notificacionesViejas.length > 0) {
    const idsAEliminar = notificacionesViejas.map((n) => n.id);
    const eliminadas = await Notificacion.destroy({ where: { id: idsAEliminar } });
    console.log(
      `🧹 Eliminadas ${eliminadas} notificaciones antiguas (${idsAEliminar.length} registros)`
    );
  }

// notificar a vendedores con estado 5
const vehiculosConfirmados = await Vehiculo.findAll({
  where: {
    estado: ESTADOS.FINALIZADA_CONFIRMADA,
    notificado_confirmacion: false,
  },
  attributes: ["id", "marca", "modelo", "id_usuario"],
});

if (vehiculosConfirmados.length > 0) {
  console.log(`${vehiculosConfirmados.length} vehículo(s) confirmados nuevos encontrados`);

  for (const v of vehiculosConfirmados) {
    try {
      // verificar si sigue sin notificar
      const vehiculoActual = await Vehiculo.findByPk(v.id);
      if (!vehiculoActual || vehiculoActual.notificado_confirmacion) {
        console.log(`⏭️ Vehículo #${v.id} ya fue notificado, se omite.`);
        continue;
      }

      // marcarlo como notificado
      await Vehiculo.update(
        { notificado_confirmacion: true },
        { where: { id: v.id } }
      );

      await Notificacion.create({
        id_usuario: v.id_usuario,
        id_vehiculo: v.id,
        mensaje: `¿Lograste finalizar tu venta del ${v.marca} ${v.modelo}? Déjanos saber si completaste la entrega.`,
        lectura: 0,
        fecha: new Date(),
        tipo: 3,
      });

      console.log(`Notificación enviada y vehículo #${v.id} marcado como notificado`);
    } catch (e) {
      console.error(`Error al crear notificación de confirmación: ${e.message}`);
    }
  }
}



}

// Tarea programada cada 5 segundos
let ultimaEjecucion = Date.now();

const tarea = cron.schedule("*/5 * * * * *", async () => {
  const ahora = Date.now();
  const diferencia = ahora - ultimaEjecucion;

  if (diferencia > 15000) {
    console.log("Sistema suspendido o bloqueado, ejecutando revisión completa...");
    await verificarYActualizarSubastas();
    ultimaEjecucion = ahora;
    return;
  }

  try {
    const inicio = Date.now();
    await verificarYActualizarSubastas();
    const duracion = Date.now() - inicio;
    if (duracion > 1000) console.log(`⏱Tarea tomó ${duracion} ms`);
  } catch (err) {
    console.error("Error en tarea automática:", err.message);
  }

  ultimaEjecucion = ahora;
});


(async () => {
  console.log("Revisión inicial al iniciar el servidor...");
  await verificarYActualizarSubastas();
})();

console.log("Tareas automáticas iniciadas (cada 5 segundos)");

process.on("SIGINT", () => {
  console.log("Deteniendo tarea programada (SIGINT)...");
  tarea.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Deteniendo tarea programada (SIGTERM)...");
  tarea.stop();
  process.exit(0);
});

export { verificarYActualizarSubastas as iniciarTareasProgramadas };

