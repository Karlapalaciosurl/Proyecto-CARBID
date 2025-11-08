import { Sequelize } from "sequelize";

export const sequelize = new Sequelize("carbid_db", "root", "Admon456*", {
  host: "localhost",
  port: 3307, 
  dialect: "mysql",
  timezone: "-06:00", // Guatemala
  dialectOptions: {
    dateStrings: true,  // devuelve fechas como texto (sin problemas de zona horaria)
    typeCast: true      // convierte correctamente a Date cuando corresponda
  },
  logging: false,
});

try {
  await sequelize.authenticate();
  console.log("Conexión exitosa a la base de datos");
} catch (error) {
  console.error("Error al conectar con la base de datos:", error);
}
