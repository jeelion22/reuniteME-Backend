const User = require("../models/user");
const sendEmailToVerifyEmail = require("../utils/email");
const crypto = require("crypto");
const sendOTP = require("../utils/sendOTP");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, TOKEN_EXPIRES } = require("../utils/config");
const { config } = require("dotenv");

const userController = {
  register: async (req, res) => {
    try {
      const { firstname, lastname, email, phone } = req.body;
      const user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({
          message: user.isEmailVerified
            ? "User already exists"
            : "Your account is not verified!",
        });
      }

      const newUser = new User({
        firstname,
        lastname,
        email,
        phone,
      });

      const emailToken = newUser.createEmailVerificationToken();

      await newUser.save();

      const verificationURL = `${req.protocol}://${req.get(
        "host"
      )}/api/users/verify/${emailToken}`;
      const message = `Please use the link below to verify your account.\n\n${verificationURL}\n\nThis link will be valid only for 30 minutes.`;

      await sendEmailToVerifyEmail({
        email: newUser.email,
        subject: "Verify your ReUniteME account",
        message: message,
      });

      await newUser.save();

      res.status(201).json({
        status: "success",
        message:
          "User created successfully. Please verify your account by the link sent to your email",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message:
          "There was an error processing your request. Please try again later.",
      });
    }
  },

  verify: async (req, res) => {
    try {
      const { token } = req.params;

      const { password } = req.body;

      const hashedEmailToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await User.findOne({
        emailVerificationToken: hashedEmailToken,
        emailVerificationTokenExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid link or has expired" });
      }

      if (user.isEmailVerified) {
        return res
          .status(200)
          .json({ message: "Email verification already completed." });
      }

      user.isEmailVerified = true;
      user.isActive = true;
      await user.save();

      const passwordHash = await bcrypt.hash(password, 10);

      user.passwordHash = passwordHash;

      await user.save();

      res.status(201).json({ message: "User verify successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email, isActive: true });

      if (!user) {
        return res.status(400).json({ message: "Invalid Credentials." });
      }

      const isPasswordCorrect = await bcrypt.compare(
        password,
        user.passwordHash
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({ messsage: "Invalid Credentials." });
      }

      const token = jwt.sign(
        {
          username: email,
          id: user._id,
          name: user.firstname,
        },
        JWT_SECRET
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + 24 * 3600 * 1000),
      });
      res.status(200).json({ message: "login successful", token });
    } catch (error) {
      res.status(500).json({ message: error.message });
      console.log(error);
    }
  },
  me: async (req, res) => {
    try {
      const userId = req.userId;

      const user = await User.findOne({ _id: userId, isActive: true }).select(
        "-__v -passwordHash -emailVerificationToken -emailVerificationTokenExpires -_id -whoDeleted"
      );

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const userId = req.userId;

      const { phone } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      let updatedUser;

      if (phone && phone != user.phone) {
        if (user.prevPhones) {
          user.prevPhones.push(user.phone);
          user.phone = phone;
          updatedUser = await user.save();
        } else {
          user.prevPhones = [];
          user.prevPhones.push(user.phone);
          user.phone = phone;
          updatedUser = await user.save();
        }

        res
          .status(200)
          .json({ message: `Phone number ${phone} updated successfully` });
      } else {
        res
          .status(200)
          .json({ message: `Phone number ${phone} already exists.` });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const userId = req.userId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (user.isActive) {
        user.isActive = false;

        user.whoDeleted.push({
          userId: userId,
          role: "User",
        });

        await user.save();

        res.clearCookie("token");

        res.status(204).json({ message: "User deleted successfully!" });
      } else {
        res.status(200).json({ message: "Account was already deleted" });
      }
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




};

module.exports = userController;
