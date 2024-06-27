const express = require("express");
const auth = require("../middleware/auth");

const adminController = require("../controllers/adminController");

const adminRouter = express.Router();

// admin endpoints
adminRouter.post("/login", adminController.login);
adminRouter.get("/me", auth.isAuthAdmin, adminController.me);
adminRouter.get("/logout", auth.isAuthAdmin, adminController.logout);

// end points for accessing users information
adminRouter.get(
  "/users",
  auth.isAuthAdmin,
  auth.isAdminPermittedToRead,
  adminController.getAllUsers
);

adminRouter.get(
  "/users/all-contributions",
  auth.isAuthAdmin,
  auth.isAdminPermittedToRead,
  adminController.getAllContributions
);
adminRouter.get(
  "/users/plot-info",
  auth.isAuthAdmin,
  auth.isAdminPermittedToRead,
  adminController.getUsersPlotsInfo
);
adminRouter.get(
  "/users/:userId",
  auth.isAuthAdmin,
  auth.isAdminPermittedToRead,
  adminController.getUserById
);
adminRouter.put(
  "/users/update/:userId",
  auth.isAuthAdmin,
  auth.isAdminPermittedToUpdate,
  adminController.updateUserById
);
adminRouter.delete(
  "/users/:userId",
  auth.isAuthAdmin,
  auth.isAdminPermittedToDelete,
  adminController.deleteUserById
);

adminRouter.get(
  "/users/activate/:userId",
  auth.isAuthAdmin,
  auth.isAdminPermittedToUpdate,
  adminController.activateUser
);

adminRouter.put("/password/reset", adminController.forgotPassword);

adminRouter.get(
  "/password/reset/verify/:token",
  adminController.verifyPasswordResetLink
);
adminRouter.put("/password/reset/:adminId", adminController.resetPassword);

module.exports = adminRouter;
