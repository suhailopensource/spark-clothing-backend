import mongoose from "mongoose";

const schema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: [true, "Enter coupon code"],
  },
  amount: {
    type: Number,
    required: [true, "Enter the discount amount"],
  },
});

export const Coupon = mongoose.model("Coupon", schema);
