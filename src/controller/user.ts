import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { newUserRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middleware/error.js";
import { invalidateCache } from "../utils/features.js";

export const newUser = TryCatch(
  async (
    req: Request<{}, {}, newUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, photo, _id, dob, gender } = req.body;

    let user = await User.findById(_id);

    if (user) {
      return res.status(200).json({
        success: true,
        message: `Welcome ${user.name}`,
      });
    }

    if (!_id || !name || !email || !photo || !dob || !gender) {
      return next(new ErrorHandler("please add all fields", 400));
    }

    user = await User.create({
      name,
      email,
      photo,
      _id,
      dob: new Date(dob),
      gender,
    });

    await invalidateCache({ admin: true });

    res.status(200).json({
      success: true,
      message: `Welcome ${user.name}`,
    });
  }
);

export const getAllUsers = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find({});

    res.status(200).json({
      success: true,
      users,
    });
  }
);

export const getUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return next(new ErrorHandler("Invalid Id", 400));
    }

    res.status(200).json({
      success: true,
      user,
    });
  }
);
export const deleteUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return next(new ErrorHandler("Invalid Id", 400));
    }

    await user.deleteOne();

    await invalidateCache({ admin: true });

    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  }
);
