import express from "express";
import {
  deleteProduct,
  getAdminProducts,
  getAllCategory,
  getAllProducts,
  getLatestProducts,
  getSingleProduct,
  newProduct,
  updateProduct,
} from "../controller/product.js";
import { adminOnly } from "../middleware/auth.js";
import { singleUpload } from "../middleware/multer.js";

const app = express.Router();

app.post("/new", adminOnly, singleUpload, newProduct);
app.get("/latest", getLatestProducts);
app.get("/all", getAllProducts);
app.get("/categories", getAllCategory);
app.get("/admin-products", adminOnly, getAdminProducts);
app
  .route("/:id")
  .put(adminOnly, singleUpload, updateProduct)
  .get(getSingleProduct)
  .delete(adminOnly, deleteProduct);

export default app;
