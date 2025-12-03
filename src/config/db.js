import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Detectar si la base requiere SSL (Railway, Supabase, Neon)
const sslConfig = process.env.DB_SSL === "true" 
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
  : {};

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,

    dialectOptions: {
      ...sslConfig, // añade SSL solo si lo habilitas
    },
  }
);

export default sequelize;
