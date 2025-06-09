const Admin = require("../models/admin");
const User = require("../models/user");
const config = require("../utils/config");

const bcrypt = require("bcrypt");
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const s3 = require("../utils/awsConfig");
const sendEmailToVerifyEmail = require("../utils/email");
const crypto = require("crypto");
const BlockedToken = require("../models/blockedToken");

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
        permissions: config.ADMIN_PERMISSIONS.split(","),
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
        return res
          .status(400)
          .json({ message: "Invalid credentials or account may be deleted." });
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
        config.ADMIN_JWT_SECRET,
        { expiresIn: "1h" }
      );

      // res.cookie("token", token, {
      //   httpOnly: true,
      //   secure: true,
      //   sameSite: "None",
      //   expires: new Date(Date.now() + 24 * 3600 * 1000),

      // });
      res.status(200).json({ message: "login successful", token });
    } catch (error) {
      
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
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const email = req.body.email;

      const admin = await Admin.findOne({
        email,
        status: "active",
        role: "admin",
      });

      if (!admin) {
        return res.status(400).json({ message: "Admin not found" });
      }

      const emailToken = admin.createEmailVerificationToken();

      const verificationURL = `https://reuniteme.netlify.app/admins/password/reset/verify/${emailToken}`;

      const message = `Please use the link below to reset the password for your account.\n\n${verificationURL}\n\nThis link will be valid only for 30 minutes.\n\nIf it is not initiated by you, then you can ignore this email.`;

      await sendEmailToVerifyEmail({
        email: admin.email,
        subject: "Password reset link for your ReUniteME account",
        message: message,
      });

      await admin.save();

      res.status(200).json({
        status: "success",
        message:
          "Password reset link successfully sent to your resgistered email address.",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  verifyPasswordResetLink: async (req, res) => {
    try {
      const { token } = req.params;

      const hashedEmailToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const admin = await Admin.findOne({
        emailVerificationToken: hashedEmailToken,
        emailVerificationTokenExpires: { $gt: Date.now() },
      });

      if (!admin) {
        return res
          .status(400)
          .json({ message: "Invalid link or the link has expired." });
      }
      admin.emailVerificationToken = null;
      admin.emailVerificationTokenExpires = null;
      admin.isRequestedPasswordReset = true;
      await admin.save();

      const adminId = admin._id.toString();

      res.status(200).json({
        message: "Your account verified successfully!",
        redirectTo: adminId,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;

      const adminId = req.params.adminId;

      const admin = await Admin.findOne({
        _id: adminId,
        isRequestedPasswordReset: true,
      });

      if (!admin) {
        return res
          .status(400)
          .json({ message: "Admin not found or unauthorized request" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      admin.isRequestedPasswordReset = false;

      admin.passwordHash = passwordHash;

      await admin.save();

      res.status(200).json({ message: "Password reset done successfully!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  logout: async (req, res) => {
    try {
      // res.clearCookie("token", {httpOnly: true, secure: true, sameSite: 'None'});
      const token = req.headers.authorization?.split(" ")[1];

      const decoded = jwt.verify(token, config.ADMIN_JWT_SECRET);
      const expiresAt = new Date(decoded.exp * 1000);
      await BlockedToken.create({ token, expiresAt });
      res.status(204).send();
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
          contribution["fileName"] = contribution.key.split("/")[1];
        })
      );

      const contributions = allContributions.map(
        ({ bucket, key, ...rest }) => rest
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

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      if (["reuniteSeeker", "both"].includes(user.userCategory)) {
        user.firstname = req.body.firstname;
        user.lastname = req.body.lastname;
        user.phone = req.body.phone;
        user.address = req.body.address;
        user.authorizedIdType = req.body.authorizedIdType;
        user.authorizedIdNo = req.body.authorizedIdNo;

        await user.save();

        return res.status(200).json({
          message: "User's profile information updated successfully!",
        });
      } else {
        user.firstname = req.body.firstname;
        user.lastname = req.body.lastname;
        user.phone = req.body.phone;

        await user.save();

        return res.status(200).json({
          message: "User's profile information updated successfully!",
        });
      }
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
        (user.isAccountDeleted = true),
          user.whoDeleted.push({
            userId: config.username,
            role: "Admin",
          });
        await user.save();

        res.status(204).json({ message: "User deleted successfully!" });
      } else {
        res.status(200).json({ message: "Account was already deleted" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  activateUser: async (req, res) => {
    try {
      const userId = req.params.userId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (user.isEmailVerified && !user.isActive && user.isAccountDeleted) {
        user.isActive = true;
        user.isAccountDeleted = false;
        await user.save();

        return res
          .status(200)
          .json({ message: "User activated successfully!" });
      } else {
        return res.status(400).json({ message: "User can not be activated" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getUsersPlotsInfo: async (req, res) => {
    try {
      const usersCreatedAtCount = await User.aggregate([
        {
          $project: {
            accountRegisteredDate: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$accountRegisteredAt",
              },
            },
          },
        },
        {
          $group: {
            _id: "$accountRegisteredDate",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            count: 1,
          },
        },
        {
          $sort: { date: 1 },
        },
      ]);

      const totalUsersCount = await User.aggregate([
        {
          $group: {
            _id: null,
            totalActive: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
            },
            totalNonActive: {
              $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalActive: 1,
            totalNonActive: 1,
          },
        },
      ]);

      const contributionData = await User.aggregate([
        {
          $match: {
            contributions: { $ne: [] },
          },
        },
        {
          $unwind: "$contributions",
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$contributions.uploadDate",
                },
              },
            },
            totalUploads: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id.date",
            totalUploads: 1,
          },
        },
        {
          $sort: { date: 1 },
        },
      ]);

      const rescuedCount = await User.aggregate([
        {
          $match: {
            "contributions.status": "rescued",
          },
        },
        {
          $unwind: "$contributions",
        },
        {
          $match: {
            "contributions.status": "rescued",
          },
        },
        {
          $count: "rescuedCount",
        },
      ]);

      const notRescuedCount = await User.aggregate([
        {
          $match: {
            "contributions.status": "not-rescued",
          },
        },
        {
          $unwind: "$contributions",
        },
        {
          $match: {
            "contributions.status": "not-rescued",
          },
        },
        {
          $count: "notRescuedCount",
        },
      ]);

      const usersCount = {
        usersCreatedAtCount,
        totalActiveUsers: totalUsersCount[0]?.totalActive || 0,
        totalNonActiveUsers: totalUsersCount[0]?.totalNonActive || 0,
        contributionData,
        totalRescued: rescuedCount[0]?.rescuedCount || 0,
        totalNotRescued: notRescuedCount[0]?.notRescuedCount || 0,
      };

      res.status(200).json(usersCount);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createAdminByRootAdmin: async (req, res) => {
    try {
      const newAdminData = req.body;

      const admin = await Admin.findOne({
        username: newAdminData.username,
        email: newAdminData.email,
      });

      if (admin) {
        return res.status(400).json({ message: "Admin already exists" });
      }

      const hashedPassword = await bcrypt.hash(newAdminData.password, 10);

      newAdminData["passwordHash"] = hashedPassword;

      const newAdmin = new Admin(newAdminData);

      await newAdmin.save();

      res.status(201).json({ message: "Admin created successfully!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getAllAdmins: async (req, res) => {
    try {
      const allAdmins = await Admin.find().select(
        "-__v -passwordHash -emailVerificationToken -emailVerificationTokenExpires  -contributions"
      );
      res.status(200).json(allAdmins);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  updateAdmin: async (req, res) => {
    try {
      const adminId = req.params.adminId;

      const adminData = req.body;

      const admin = await Admin.findOne({ _id: adminId });

      if (!admin) {
        return res.status(400).json({ message: "Admin not found" });
      }

      admin.username = adminData.username;
      admin.firstname = adminData.firstname;
      admin.lastname = adminData.lastname;
      admin.email = adminData.email;
      admin.phone = adminData.phone;
      admin.role = adminData.role;
      admin.permissions = adminData.permissions;
      admin.status = adminData.status;

      await admin.save();

      res
        .status(200)
        .json({ message: "Admin information updated successfully!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteAdmin: async (req, res) => {
    try {
      const adminId = req.params.adminId;

      const admin = await Admin.findOne({
        _id: adminId,
        status: { $ne: "deleted" },
      });

      if (!admin) {
        return res.status(400).json({ message: "Admin was already deleted" });
      }

      admin.status = "deleted";
      await admin.save();

      res.status(204).json({ message: "Admin was deleted successfully!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = adminController;
