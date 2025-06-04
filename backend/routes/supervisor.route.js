import express from "express";
import {
  createSupervisor,
  getSupervisors,
  getSupervisorById,
  updateSupervisor,
  deleteSupervisor,
  getAllUsers,
  deleteUser,
  updateUser,
  sendSupervisorReport,
} from "../src/controllers/supervisor.controller.js";

const supervisorRoutes = express.Router();

supervisorRoutes.post("/", createSupervisor);
supervisorRoutes.get("/", getSupervisors);
supervisorRoutes.get("/:id", getSupervisorById);
supervisorRoutes.put("/:id", updateSupervisor);
supervisorRoutes.delete("/:id", deleteSupervisor);
// supervisorRoutes.get("/users", (req, res, next) => {
//   console.log('Route /api/supervisors/users hit');
//   next();
// }, getAllUsers);
// supervisorRoutes.delete("/users/:id", deleteUser);
// supervisorRoutes.put("/users/:id", updateUser);
supervisorRoutes.post('/:supervisorId/report', sendSupervisorReport);

export default supervisorRoutes;
