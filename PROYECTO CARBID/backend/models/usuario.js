import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
      usuario: { 
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    correo: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email_verificado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
  },
  codigo_verificacion: {
      type: DataTypes.STRING(6),
      allowNull: true,
  },
  },
  {
    tableName: "usuarios", 
    timestamps: false,
  }
);
