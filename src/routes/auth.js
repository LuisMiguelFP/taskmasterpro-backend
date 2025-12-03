import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// 📝 Registro de usuario
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("Debe ser un correo válido"),
    body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      res.status(201).json({ message: "Usuario registrado correctamente", user: newUser });
    } catch (error) {
      res.status(500).json({ message: "Error al registrar usuario", error });
    }
  }
);

// 🔐 Inicio de sesión
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Correo inválido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: "Usuario no encontrado" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ message: "Inicio de sesión exitoso", token });
    } catch (error) {
      res.status(500).json({ message: "Error al iniciar sesión", error });
    }
  }
);

export default router;
 
