// import the express
const express = require("express");
const auth = require("../middleware/auth");

// import userRouter
const userController = require("../controllers/userController");

// use express router
const userRouter = express.Router();

// define endpoints
userRouter.post("/register", userController.register);
userRouter.post("/verify/:token", userController.verify);
userRouter.post("/login", userController.login);

// protected routes
userRouter.get("/me", auth.isAuth, userController.me);
userRouter.put("/me", auth.isAuth, userController.update);
userRouter.delete("/me", auth.isAuth, userController.delete);
userRouter.get("/logout", auth.isAuth, userController.logout);

// routes for admin

module.exports = userRouter;
