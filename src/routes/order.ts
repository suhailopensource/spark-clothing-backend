import express from "express";

import { adminOnly } from "../middleware/auth.js";
import {
  allOrders,
  deleteOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  processOrders,
} from "../controller/order.js";

const app = express.Router();

app.post("/new", newOrder);

app.get("/all", adminOnly, allOrders);

app.get("/my", myOrders);

app
  .route("/:id")
  .get(getSingleOrder)
  .put(adminOnly, processOrders)
  .delete(adminOnly, deleteOrder);

export default app;
