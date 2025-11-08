// models/ResultadoSubasta.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const ResultadoSubasta = sequelize.define(
  "resultados_subasta",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_vehiculo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    monto_final: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  }
);
