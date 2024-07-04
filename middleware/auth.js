const jwt = require("jsonwebtoken");
const config = require("../utils/config");
const User = require("../models/user");
const Admin = require("../models/admin");
const auth = {
  isAuth: (req, res, next) => {
    try {
      const token = req.cookies.token;

      console.log(token);

      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      try {
        const decodedToken = jwt.verify(token, config.JWT_SECRET);
        req.userId = decodedToken.id;

        next();
      } catch (error) {
        res.status(401).json({ message: "Invalid token" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  isAuthAdmin: (req, res, next) => {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      try {
        const decodedToken = jwt.verify(token, config.ADMIN_JWT_SECRET);
        req.adminId = decodedToken.id;
        next();
      } catch (error) {
        res.status(401).json({ message: "Invalid token" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  isAdminPermittedToRead: async (req, res, next) => {
    try {
      const adminId = req.adminId;

      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const admin = await Admin.findById(adminId);

      if (!admin) {
        return res.status(400).json({ message: "Admin not found" });
      }

      if (admin.role !== "admin" || !admin.permissions.includes("read")) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  isAdminPermittedToUpdate: async (req, res, next) => {
    try {
      const adminId = req.adminId;

      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const admin = await Admin.findById(adminId);

      if (!admin) {
        return res.status(400).json({ message: "Admin not found" });
      }

      if (admin.role !== "admin" || !admin.permissions.includes("update")) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  isAdminPermittedToDelete: async (req, res, next) => {
    try {
      const adminId = req.adminId;

      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const admin = await Admin.findById(adminId);

      if (!admin) {
        return res.status(400).json({ message: "Admin not found" });
      }

      if (admin.role !== "admin" || !admin.permissions.includes("delete")) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = auth;
