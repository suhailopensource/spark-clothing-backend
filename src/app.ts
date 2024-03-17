import express from "express";
import userRoute from "./routes/user.js";
import productRoute from "./routes/product.js";
import dashboardRoute from "./routes/stats.js";
import orderRoute from "./routes/order.js";
import paymentRoute from "./routes/payment.js";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middleware/error.js";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";

config({
  path: "./.env",
});

const port = process.env.PORT || 4000;
const mongo_uri: string = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";

connectDB(mongo_uri);

export const stripe = new Stripe(stripeKey);
export const myCache = new NodeCache();

const app = express();
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/dashboard", dashboardRoute);
app.use("/api/v1/payment", paymentRoute);

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`serve running http://localhost:${port}/`);
});
