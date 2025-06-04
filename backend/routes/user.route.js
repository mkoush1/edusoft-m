import express from "express";
import {
  getUsers,
  createUser,
  deleteUser,
  updateUser,
} from "../controllers/user.controller.js";
import { getAllStudents, deleteStudent, updateStudent } from '../controllers/supervisor.controller.js';

const userRoutes = express.Router();

userRoutes.get("/", getUsers);
userRoutes.post("/", createUser);
userRoutes.delete("/:id", deleteUser);
userRoutes.patch("/:id", updateUser);
userRoutes.get('/students', getAllStudents);
userRoutes.delete('/students/:id', deleteStudent);
userRoutes.put('/students/:id', updateStudent);

export default userRoutes;
