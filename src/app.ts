import express from "express";
import userRoute from "./routes/user.js";
import productRoute from "./routes/product.js";
import dashboardRoute from "./routes/stats.js";
import orderRoute from "./routes/order.js";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middleware/error.js";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";

config({
  path: "./.env",
});

const port = process.env.PORT || 4000;
const mongo_uri: string = process.env.MONGO_URI || "";

connectDB(mongo_uri);

export const myCache = new NodeCache();

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/dashboard", dashboardRoute);

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`serve running http://localhost:${port}/`);
});
