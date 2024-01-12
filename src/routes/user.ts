import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  newUser,
} from "../controller/user.js";
import { adminOnly } from "../middleware/auth.js";

const app = express.Router();

app.post("/new", newUser);

app.get("/all", adminOnly, getAllUsers);

app.get("/:id", getUser).delete("/:id", adminOnly, deleteUser);

export default app;
