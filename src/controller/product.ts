import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middleware/error.js";
import { Product } from "../models/product.js";
import {
  BaseQuery,
  SearchRequestQuery,
  newProductRequestBody,
} from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import NodeCache from "node-cache";
import { invalidateCache } from "../utils/features.js";

export const newProduct = TryCatch(
  async (
    req: Request<{}, {}, newProductRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, category, stock, price } = req.body;
    const photo = req.file;

    if (!photo) {
      return next(new ErrorHandler("Please upload product Photo", 400));
    }

    if (!name || !category || !stock || !price) {
      rm(photo.path, () => {
        console.log("deleted");
      });

      return next(new ErrorHandler("Please enter all product details", 400));
    }

    await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo?.path,
    });

    await invalidateCache({ product: true, admin: true });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
    });
  }
);

export const getLatestProducts = TryCatch(async (req, res, next) => {
  let products = [];

  if (myCache.has("latest-products")) {
    products = JSON.parse(myCache.get("latest-products") as string);
  } else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    myCache.set("latest-products", JSON.stringify(products));
  }

  invalidateCache({ product: true, admin: true });

  res.status(200).json({
    success: true,
    products,
  });
});
export const getAllCategory = TryCatch(async (req, res, next) => {
  let categories;

  if (myCache.has("categories")) {
    categories = JSON.parse(myCache.get("categories") as string);
  } else {
    categories = await Product.distinct("category");
    myCache.set<string>("categories", JSON.stringify(categories));
  }

  res.status(200).json({
    success: true,
    categories,
  });
});

export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products;

  if (myCache.has("all-products")) {
    products = JSON.parse(myCache.get("all-products") as string);
  } else {
    products = await Product.find({});
    myCache.set<string>("all-products", JSON.stringify(products));
  }
  res.status(200).json({
    success: true,
    products,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  let product;

  if (myCache.has(`product-${id}`)) {
    product = JSON.parse(myCache.get<NodeCache.Key>(`product-${id}`) as string);
  } else {
    product = await Product.findById(id);
    if (!product) {
      return next(new ErrorHandler("Invalid Product ID", 400));
    }
    myCache.set(`product-${id}`, JSON.stringify(product));
  }

  res.status(200).json({
    success: true,
    product,
  });
});
export const deleteProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;

  const product = await Product.findById(id);
  if (!product) {
    return next(new ErrorHandler("Invalid Product ID", 400));
  }

  rm(product.photo!, () => {
    console.log("Product Photo Deleted");
  });
  await product.deleteOne();
  await invalidateCache({
    product: true,
    admin: true,
    productId: String(product._id),
  });

  res.status(200).json({
    success: true,
    message: "Product deleted sucessfully",
  });
});

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, category, stock, price } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);

  if (!product) {
    return next(new ErrorHandler("Invalid Product ID", 400));
  }

  if (photo) {
    rm(product.photo!, () => {
      console.log("old photo deleted succesfully");
    });

    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (category) product.category = category;
  if (stock) product.stock = stock;
  if (price) product.price = price;

  await product.save();
  await invalidateCache({
    product: true,
    admin: true,
    productId: String(product._id),
  });

  res.status(200).json({
    success: true,
    message: "Product updated sucessfully",
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, price, category, sort } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: BaseQuery = {};

    if (search) {
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    }
    if (category) {
      baseQuery.category = category;
    }

    if (price) {
      baseQuery.price = {
        $lte: Number(price),
      };
    }
    const productsPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, filteredOnlyProducts] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    const totalPage = Math.ceil(filteredOnlyProducts.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);
