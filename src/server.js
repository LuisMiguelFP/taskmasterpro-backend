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
// ⚠️ CONFIGURACIÓN CORS TEMPORAL (MODO DEPURACIÓN) ⚠️
// ----------------------------------------------------

// Esta configuración permite peticiones desde CUALQUIER ORIGEN (origin: '*')
// y es útil para verificar si el error de CORS se debe a una mala
// configuración de la variable de entorno 'FRONTEND_URL'.
// 
// UNA VEZ RESUELTO EL PROBLEMA, DEBE VOLVERSE A LA CONFIGURACIÓN SEGURA.
const corsOptionsTemp = {
    origin: '*', // Permite todos los orígenes
    credentials: true, // Importante para manejar cookies/tokens
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Asegura que OPTIONS esté incluido para el preflight
};

// 4. Aplica el middleware CORS con las opciones temporales.
app.use(cors(corsOptionsTemp));

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