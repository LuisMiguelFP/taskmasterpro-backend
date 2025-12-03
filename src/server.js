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
// ✅ CORS CONFIGURACIÓN SEGURA BASADA EN ENV ✅
// ----------------------------------------------------
const frontendUrls = process.env.FRONTEND_URL;

const allowedOrigins = frontendUrls 
  ? frontendUrls.split(',').map(url => url.trim()).filter(Boolean) 
  : []; 

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`❌ Origen Bloqueado por CORS: ${origin}. Lista permitida: ${allowedOrigins.join(', ')}`);
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
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

// ----------------------------------------------------
// 🔥 MANEJADOR DE RUTAS NO ENCONTRADAS (404 JSON) 🔥
// Si Express llega a este punto, significa que ninguna ruta coincidió.
app.use((req, res) => {
    // Aseguramos que cualquier error 404 en /api/* devuelva JSON y no HTML.
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ 
            message: `Ruta de API no encontrada: ${req.method} ${req.originalUrl}. Verifica la URL.` 
        });
    }
    // Para cualquier otra ruta que no sea API, devolvemos un 404 simple.
    res.status(404).json({ message: "Recurso no encontrado" });
});
// ----------------------------------------------------


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
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
        });

    } catch (error) {
        console.error("❌ Error al conectar con la base de datos:", error);
    }
})();