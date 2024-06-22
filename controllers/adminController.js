const Admin = require("../models/admin");
const User = require("../models/user");
const config = require("../utils/config");

const bcrypt = require("bcrypt");
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const s3 = require("../utils/awsConfig");

const adminController = {
  createAdmin: async function () {
    try {
      // check if admin already exists
      const isAdmin = await Admin.findOne({ username: config.ADMIN_USERNAME });

      if (isAdmin) {
        console.log("Admin already exists.");
        return;
      }

      const hashedPassword = await bcrypt.hash(config.ADMIN_PASSWORD, 10);

      const admin = new Admin({
        username: config.ADMIN_USERNAME,
        firstname: config.ADMIN_FIRST_NAME,
        lastname: config.ADMIN_LAST_NAME,
        email: config.ADMIN_EMAIL_ADDR,
        phone: config.ADMIN_PHONE,
        passwordHash: hashedPassword,
      });
      await admin.save();
      console.log("Admin created successfully!");
    } catch (error) {
      console.log("Error in creating admin", error);
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const admin = await Admin.findOne({ email, status: "active" });

      if (!admin) {
        return res.status(400).json({ message: "Invalid credentials." });
      }

      const isPasswordCorrect = await bcrypt.compare(
        password,
        admin.passwordHash
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }

      const token = jwt.sign(
        {
          username: email,
          id: admin._id,
          name: admin.firstname,
        },
        config.ADMIN_JWT_SECRET
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + 24 * 3600 * 1000),
      });
      res.status(200).json({ message: "login successful", token });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  me: async (req, res) => {
    try {
      const adminId = req.adminId;

      const admin = await Admin.findOne({
        _id: adminId,
        status: "active",
      }).select("-passwordHash -_id -__v");

      if (!admin) {
        return res.status(400).json({ message: "admin not found" });
      }
      res.status(200).json({ admin });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie("token");
      res.status(200).json({ message: "logout successful!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // access all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select(
        "-__v -passwordHash -emailVerificationToken -emailVerificationTokenExpires  -contributions"
      );
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getAllContributions: async (req, res) => {
    try {
      const result = await User.aggregate([
        {
          $match: {
            contributions: { $ne: [] },
          },
        },
        {
          $unwind: "$contributions",
        },
        {
          $addFields: {
            "contributions.uploadedBy": {
              $concat: ["$firstname", " ", "$lastname"],
            },
          },
        },

        {
          $group: {
            _id: null,
            allContributions: {
              $push: "$contributions",
            },
          },
        },
        {
          $project: {
            _id: 0,
            allContributions: 1,
          },
        },
      ]);

      const allContributions = result[0]?.allContributions || [];

      await Promise.all(
        allContributions.map(async (contribution) => {
          const params = {
            Bucket: contribution.bucket,
            Key: contribution.key,
            Expires: 60 * 60,
          };

          const url = await s3.getSignedUrlPromise("getObject", params);
          contribution["imgUrl"] = url;
          contribution["fileName"] = contribution.key.split("/")[1]
        })
      );

      const contributions = allContributions.map(
        ({bucket, key, ...rest}) => rest
      );

      res.status(200).json({ message: contributions });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  getUserById: async (req, res) => {
    try {
      const userId = req.params.userId;

      if (!userId) {
        return res.status(400).json({ message: "Invalid user id" });
      }

      const user = await User.findById(userId).select(
        "-__v -passwordHash -emailVerificationToken -emailVerificationTokenExpires -_id"
      );
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateUserById: async (req, res) => {
    try {
      const userId = req.params.userId;

      if (!userId) {
        return res.status(400).json({ message: "Invalid user id" });
      }

      const { firstname, lastname, userCategory } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      if (firstname) {
        user.firstname = firstname;
      }
      if (lastname) {
        user.lastname = lastname;
      }

      if (userCategory) {
        user.usercategory = userCategory;
      }

      await user.save();

      res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  deleteUserById: async (req, res) => {
    try {
      const userId = req.params.userId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (user.isActive) {
        user.isActive = false;
        user.whoDeleted.push({
          userId: config.username,
          role: "Admin",
        });
        await user.save();

        res.status(204).json({ message: "User deleted successfully!" });
      } else {
        res.status(200).json({ message: "Account was already deleted" });
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = adminController;
