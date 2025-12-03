import express from "express";
import { body, validationResult } from "express-validator";
import Item from "../models/Item.js";
import authRequired from "../middleware/authRequired.js";

const router = express.Router();

// 🟦 Obtener items con filtros
router.get("/", authRequired, async (req, res) => {
  try {
    const { priority, status, search } = req.query;

    const where = { userId: req.user.id };

    // Filtro prioridad
    if (priority) where.priority = priority;

    // Filtro estado
    if (status) where.status = status;

    // Búsqueda por título
    if (search) {
      where.title = { like: `%${search}%` };
    }

    const items = await Item.findAll({ where });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener ítems", error: err.message });
  }
});

// 🟩 Crear nuevo item
router.post(
  "/",
  authRequired,
  [body("title").notEmpty().withMessage("El título es obligatorio")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, priority, status, dueDate, tags } = req.body;

      const newItem = await Item.create({
        title,
        description,
        priority,
        status,   // ← ahora sí guardamos estado
        dueDate,
        tags,
        userId: req.user.id,
      });

      res.status(201).json(newItem);
    } catch (err) {
      res.status(500).json({ message: "Error al crear ítem", error: err.message });
    }
  }
);

// 🟨 Actualizar item
router.put("/:id", authRequired, async (req, res) => {
  try {
    const item = await Item.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!item)
      return res.status(404).json({ message: "Item no encontrado" });

    await item.update(req.body);

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar ítem", error: err.message });
  }
});

// 🟥 Eliminar item
router.delete("/:id", authRequired, async (req, res) => {
  try {
    const item = await Item.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!item)
      return res.status(404).json({ message: "Item no encontrado" });

    await item.destroy();

    res.json({ message: "Item eliminado" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar ítem", error: err.message });
  }
});

export default router;
