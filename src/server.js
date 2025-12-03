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
// ✅ CORS CONFIG CORREGIDA Y APLICADA CORRECTAMENTE ✅
// ----------------------------------------------------

// 1. Obtiene la variable de entorno que contendrá las URLs separadas por comas.
//    (Asegúrate de que en Railway tu FRONTEND_URL sea algo como: "https://tu-frontend.vercel.app,http://localhost:5173")
const frontendUrls = process.env.FRONTEND_URL;

// 2. Procesa la cadena: la divide por comas, elimina espacios y URLs vacías.
//    He eliminado la línea de localhost aquí, ya que se asume que FRONTEND_URL lo incluye para desarrollo.
const allowedOrigins = frontendUrls 
  ? frontendUrls.split(',').map(url => url.trim()).filter(Boolean) 
  : []; 

// 3. Define la función para la verificación de origen.
const corsOptions = {
    // 🔥 CAMBIO CRÍTICO: Usamos una función para verificar si el origen es permitido.
    origin: function (origin, callback) {
        // Permitir solicitudes sin origen (como Postman o curl, o si el origen no está definido)
        // Esto es útil para herramientas y peticiones de servidor a servidor.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Bloquear el acceso si el origen no está permitido.
            console.log(`❌ Origen Bloqueado: ${origin}`);
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true,
};

// 4. Aplica el middleware CORS con las opciones seguras.
//    Tu amigo con iPhone (Safari) ahora solo podrá acceder si su origen está en 'allowedOrigins'.
app.use(cors(corsOptions));

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

    // 🔥 CORRECCIÓN ADICIONAL PARA DEPLOY EN RAILWAY (bindeando a 0.0.0.0)
    // Railway (y otros servicios en la nube) asignan dinámicamente el puerto.
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error);
  }
})();