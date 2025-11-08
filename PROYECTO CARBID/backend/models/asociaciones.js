import { Usuario } from "./usuario.js";
import { Puja } from "./puja.js";
import { Vehiculo } from "./vehiculo.js";
import { ResultadoSubasta  } from "./resultadosubasta.js";
import { Notificacion } from "./notificacion.js";

Usuario.hasMany(Puja, { foreignKey: "id_usuario" });
Puja.belongsTo(Usuario, { foreignKey: "id_usuario" });
Usuario.hasMany(Vehiculo, { foreignKey: "id_usuario" });
Vehiculo.belongsTo(Usuario, { foreignKey: "id_usuario" });
Vehiculo.hasMany(Puja, { foreignKey: "id_vehiculo"});
Puja.belongsTo(Vehiculo, { foreignKey: "id_vehiculo" });
Vehiculo.hasOne(ResultadoSubasta, { foreignKey: "id_vehiculo", as: "resultado_subasta"});
ResultadoSubasta.belongsTo(Vehiculo, { foreignKey: "id_vehiculo" });
Usuario.hasMany(ResultadoSubasta, { foreignKey: "id_usuario" });
ResultadoSubasta.belongsTo(Usuario, { foreignKey: "id_usuario" });
Usuario.hasMany(Notificacion, { foreignKey: "id_usuario" });
Notificacion.belongsTo(Usuario, { foreignKey: "id_usuario" });
Vehiculo.hasMany(Notificacion, { foreignKey: "id_vehiculo" });
Notificacion.belongsTo(Vehiculo, { foreignKey: "id_vehiculo" });

