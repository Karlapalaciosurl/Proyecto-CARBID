import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Vehiculo = sequelize.define(
  "vehiculos", // 👈 nombre exacto de tu tabla
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    marca: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    modelo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    precio_base: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    imagenes: {
      type: DataTypes.TEXT,
      allowNull: true, // almacenará JSON con nombres de archivos
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "usuarios",
        key: "id",
      },
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1, // 1 = Pendiente
      comment:
        "1=Pendiente, 2=Activa, 3=Finalizada sin confirmar, 4=Finalizada rechazada, 5=Finalizada con éxito",
    },
    notificado_confirmacion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment:
        "Indica si ya se notificó al vendedor cuando la subasta fue confirmada",
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);
