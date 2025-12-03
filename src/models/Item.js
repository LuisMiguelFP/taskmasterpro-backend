import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Item = sequelize.define(
  "Item",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    priority: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "medium",
      validate: {
        isIn: [["low", "medium", "high"]],
      },
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: [["pending", "in_progress", "completed"]],
      },
    },

    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "items",
  }
);

export default Item;
