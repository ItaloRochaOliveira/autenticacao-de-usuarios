import express from "express";
import { UserBusiness } from "../business/UserBusiness";
import { UserController } from "../controller/UserController";
import { UserDatabase } from "../database/UserDatabase";
import { IdGerator } from "../services/IdGerator";
import { TokenManage } from "../services/TokenManage";

export const userRouter = express.Router();

const userController = new UserController(
  new UserBusiness(new UserDatabase(), new IdGerator(), new TokenManage())
);

userRouter.get("/", userController.getUsers);

userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
