// import the express
const express = require("express");
const auth = require("../middleware/auth");
const upload = require("../utils/multerConfig");

// import userRouter
const userController = require("../controllers/userController");

// use express router
const userRouter = express.Router();

// define endpoints
userRouter.post("/register", userController.register);
userRouter.get("/verify/:token", userController.verify);
userRouter.post(
  "/verified/create-password/:userId",
  userController.createPassword
);
userRouter.post("/login", userController.login);

// protected routes
userRouter.get("/me", auth.isAuth, userController.me);
userRouter.put("/me", auth.isAuth, userController.update);
userRouter.delete("/me", auth.isAuth, userController.delete);
userRouter.get("/logout", auth.isAuth, userController.logout);
userRouter.post(
  "/upload",
  auth.isAuth,
  upload.single("file"),
  userController.upload
);

userRouter.get("/images", auth.isAuth, userController.getAllImages);
userRouter.get(
  "/images/:imageId",
  auth.isAuth,
  userController.getPresignedImageUrl
);

userRouter.get(
  "/images/delete/:imageId",
  auth.isAuth,
  userController.deleteUploadedImage
);

userRouter.get("/maps/:imageId", auth.isAuth, userController.getLocation);

// routes for admin

module.exports = userRouter;
