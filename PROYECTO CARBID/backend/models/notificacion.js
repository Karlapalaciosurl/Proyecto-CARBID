import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

//1 = VENDEDOR 2 = COMPRADOR 3 = CONFIRMAR
export const Notificacion = sequelize.define(
  "notificaciones",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0, 
    },
    lectura: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "notificaciones",
  }
);
