import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";

// Modelos
import User from "./models/User.js";
import Item from "./models/Item.js";

// Rutas
import authRoutes from "./routes/auth.js";
import itemRoutes from "./routes/items.js";

dotenv.config();

const app = express();


// ----------------------------------------------------
// 🔥 CORS CONFIG CORREGIDA PARA MÚLTIPLES ORÍGENES 🔥
// ----------------------------------------------------

// 1. Obtiene la variable de entorno que contendrá las URLs separadas por comas.
const frontendUrls = process.env.FRONTEND_URL;

// 2. Procesa la cadena: la divide por comas, elimina espacios y URLs vacías (falsy values).
const allowedOrigins = frontendUrls 
  ? frontendUrls.split(',').map(url => url.trim()).filter(Boolean) 
  : []; // Inicializa como un array vacío si la variable no está definida.

// 3. Añade el entorno local explícitamente para desarrollo.
allowedOrigins.push("http://localhost:5173"); 


app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
// ----------------------------------------------------
// ----------------------------------------------------


app.use(express.json());

// Relaciones
User.hasMany(Item, { foreignKey: "userId", onDelete: "CASCADE" });
Item.belongsTo(User, { foreignKey: "userId" });

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Servidor funcionando correctamente 🚀" });
});

// Puerto
const PORT = process.env.PORT || 5001;

// ------------- SINCRONIZACIÓN ------------------
(async () => {
  try {
    const FORCE_DB = process.env.FORCE_DB === "true";

    await sequelize.sync({ force: FORCE_DB });

    if (FORCE_DB) {
      console.log("🔥 Tablas REGENERADAS (FORCE = TRUE)");
    } else {
      console.log("✅ Base de datos sincronizada (sin borrar tablas).");
    }

    // 🔥 CORRECCIÓN IMPORTANTE PARA DEPLOY
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error);
  }
})();