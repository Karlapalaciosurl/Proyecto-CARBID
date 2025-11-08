import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import { Usuario } from "./usuario.js"; 

export const Puja = sequelize.define(
  "Puja",
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
      allowNull: true,
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fecha_puja: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    
  },
  {
    tableName: "pujas", 
    timestamps: false,  
    
  }
);
