import mongoose from "mongoose";
import { InvalidateCacheProps, OrderItemType } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/product.js";

export const connectDB = (mongo_uri: string) => {
  mongoose
    .connect(mongo_uri, {
      dbName: "typemernstack",
    })
    .then((data) =>
      console.log(`database connected sucessfully at ${data.connection.host}`)
    );
};

export const invalidateCache = async ({
  product,
  orders,
  admin,
  userId,
  orderId,
  productId,
}: InvalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = [
      "latest-products",
      "categories",
      "all-products",
    ];

    if (typeof productId === "string") productKeys.push(`product-${productId}`);
    if (typeof productId === "object")
      productId.forEach((i) => productKeys.push(`product-${i}`));

    myCache.del(productKeys);
  }
  if (orders) {
    const orderKeys: string[] = [
      "all-orders",
      `order-${orderId}`,
      `my-orders-${userId}`,
    ];

    myCache.del(orderKeys);
  }
  if (admin) {
    myCache.del([
      "admin-stats",
      "admin-pie-charts",
      // "admin-bar-charts",
      // "admin-line-charts",
    ]);
  }
};

export const reduceStock = async (orderItems: OrderItemType[]) => {
  for (let index = 0; index < orderItems.length; index++) {
    const order = orderItems[index];

    const product = await Product.findById(order.productId);
    if (!product) throw new Error("Product Not Found");
    product.stock -= order.quantity;
    await product.save();
  }
};

export const changePercentage = (
  lastMonthNumber: number,
  thisMonthNumber: number
) => {
  if (lastMonthNumber === 0) return thisMonthNumber * 100;
  const percent = (thisMonthNumber / lastMonthNumber) * 100;
  return Number(percent.toFixed(0));
};
