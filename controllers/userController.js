const User = require("../models/user");
const Visitors = require("../models/reuniteSeekerLogs");
const sendEmailToVerifyEmail = require("../utils/email");
const crypto = require("crypto");

const BlockedToken = require("../models/blockedToken");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  JWT_SECRET,
  TOKEN_EXPIRES,
  AWS_BUCKET_NAME,
} = require("../utils/config");

const s3 = require("../utils/awsConfig");
const exifParser = require("exif-parser");

const userController = {
  register: async (req, res) => {
    try {
      const email = req.body.email;
      const phone = req.body.phone;

      let checkUniquePhone;
      let checkUniqueEmail;

      const user = await User.findOne({ email, phone });

      if (!user) {
        checkUniquePhone = await User.findOne({ phone });
        checkUniqueEmail = await User.findOne({ email });
        if (checkUniquePhone || checkUniqueEmail) {
          return res
            .status(400)
            .json({ message: "Either Phone number or email is not unique." });
        }
      } else {
        if (user.isEmailVerified && user.isPasswordSet && !user.isActive) {
          return res.status(400).json({ message: "Account might be deleted." });
        }

        if (user.isEmailVerified && user.isPasswordSet && user.isActive) {
          return res.status(400).json({ message: "User already exists." });
        }
      }

      let newUser;
      let emailToken;

      if (user && !user.isActive && !user.isAccountDeleted) {
        emailToken = user.createEmailVerificationToken();
        await user.save();
      } else {
        newUser = new User(req.body);
        emailToken = newUser.createEmailVerificationToken();

        await newUser.save();
      }

      const verificationURL = `https://reuniteme.netlify.app/users/verify/${emailToken}`;
      const message = `Please use the link below to verify your account.\n\n${verificationURL}\n\nThis link will be valid only for 30 minutes.`;

      if (user) {
        await sendEmailToVerifyEmail({
          email: user.email,
          subject: "Verify your ReUniteME account",
          message: message,
        });
        await user.save();
      } else {
        await sendEmailToVerifyEmail({
          email: newUser.email,
          subject: "Verify your ReUniteME account",
          message: message,
        });
        await newUser.save();
      }

      res.status(201).json({
        status: "success",
        message: `${
          newUser ? "User created successfully." : ""
        }Please verify your account by the link sent to your email`,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },

  verify: async (req, res) => {
    try {
      const { token } = req.params;

      const hashedEmailToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await User.findOne({
        emailVerificationToken: hashedEmailToken,
        emailVerificationTokenExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid link or it has expired" });
      }

      if (user.isEmailVerified && user.isPasswordSet) {
        return res
          .status(200)
          .json({ message: "Your email verification already completed." });
      }

      user.isEmailVerified = true;

      user.emailVerificationToken = undefined;
      user.emailVerificationTokenExpires = undefined;
      await user.save();

      const userId = user._id.toString();

      res.status(201).json({
        message: "Your account verified successfully!",

        redirectTo: `create-password/${userId}`,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  createPassword: async (req, res) => {
    try {
      const { password } = req.body;

      const userId = req.params.userId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (!user.isEmailVerified) {
        return res
          .status(400)
          .json({ messagge: "Your email is not verfied yet!" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      user.passwordHash = passwordHash;
      user.isActive = true;
      user.isPasswordSet = true;

      await user.save();

      res.status(200).json({ message: "Password created successfully!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: "Invalid Credentials." });
      }

      if (user.isPasswordSet && !user.isActive && user.isAccountDeleted) {
        return res
          .status(400)
          .json({ message: "Your account might be deleted." });
      }

      if (!user.isActive && !user.isPasswordSet) {
        return res
          .status(400)
          .json({ message: "Your account is not verified." });
      }

      const isPasswordCorrect = await bcrypt.compare(
        password,
        user.passwordHash
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid Credentials." });
      }

      const token = jwt.sign(
        {
          id: user._id,
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
      // res.cookie("token", token, {
      //   path: "/",                  // ✅ Good
      //   httpOnly: true,             // ✅ Good (prevents JS access)
      //   secure: true,               // ✅ Required for SameSite=None
      //   sameSite: "None",           // ✅ Required for cross-site
      //   // domain: "reuniteme.netlify.app", // ✅ Better to leave this commented
      //   expires: new Date(Date.now() + 24 * 3600 * 1000), // ✅ 1-day expiry
      // });
      res.status(200).json({ message: "login successful", token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  me: async (req, res) => {
    try {
      const userId = req.userId;

      const user = await User.findOne({ _id: userId, isActive: true }).select(
        "-__v -passwordHash -emailVerificationToken -emailVerificationTokenExpires  -whoDeleted -key"
      );

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const email = req.body.email;

      const user = await User.findOne({
        email,
        isActive: true,
        isEmailVerified: true,
      });

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      const emailToken = user.createEmailVerificationToken();

      const verificationURL = `https://reuniteme.netlify.app/users/password/reset/verify/${emailToken}`;

      const message = `Please use the link below to reset password for your account.\n\n${verificationURL}\n\nThis link will be valid only for 30 minutes.\n\nIf it is not initiated by you, then you can ignore this email.`;

      await sendEmailToVerifyEmail({
        email: user.email,
        subject: "Password reset link for your ReUniteME account",
        message: message,
      });

      await user.save();

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

      const user = await User.findOne({
        emailVerificationToken: hashedEmailToken,
        emailVerificationTokenExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid link or the link has expired." });
      }
      user.emailVerificationToken = undefined;
      user.emailVerificationTokenExpires = undefined;
      user.isRequestedPasswordReset = true;
      await user.save();

      const userId = user._id.toString();

      console.log(userId);

      res.status(200).json({
        message: "Your account verified successfully!",
        redirectTo: userId,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;

      const userId = req.params.userId;

      const user = await User.findOne({
        _id: userId,
        isRequestedPasswordReset: true,
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "User not found or unauthorized request" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      user.isRequestedPasswordReset = false;

      user.passwordHash = passwordHash;

      await user.save();

      res.status(200).json({ message: "Password reset done successfully!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const userId = req.userId;

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
  // delete: async (req, res) => {
  //   try {
  //     const userId = req.userId;

  //     const user = await User.findById(userId);

  //     if (!user) {
  //       return res.status(400).json({ message: "User not found" });
  //     }

  //     if (user.isActive && !user.isAccountDeleted) {
  //       user.isActive = false;
  //       user.isAccountDeleted = true;

  //       user.whoDeleted.push({
  //         userId: userId,
  //         role: "User",
  //       });

  //       await user.save();

  //       res.clearCookie("token");

  //       res.status(204).json({ message: "User deleted successfully!" });
  //     } else if (!user.isActive && user.isAccountDeleted) {
  //       res.status(200).json({ message: "Account was already deleted" });
  //     } else {
  //       res.status(200).json({ message: "Invalid operation" });
  //     }
  //   } catch (error) {
  //     res.status(500).json({ message: error.message });
  //   }
  // },

  logout: async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    // if (!decoded || !decoded.exp) {
    //   return res.status(400).json({ message: "Invalid token, cannot determine expiry" });
    // }

    const expiresAt = new Date(decoded.exp * 1000); // Convert exp to Date

    await BlockedToken.create({ token, expiresAt });

    res.status(204).send();
  },

  upload: async (req, res) => {
    try {
      const userId = req.userId;
      const { name, address, phone, description } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (user.userCategory !== "communityUploader") {
        return res
          .status(400)
          .json({ message: "You are not authorized to upload!" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { originalname, mimetype, size, buffer } = req.file;
      const key = `${userId}/${originalname}`;
      const bucketName = AWS_BUCKET_NAME;

      // extraction of gps location data from the image
      const parser = exifParser.create(buffer);
      const result = parser.parse();

      let latitude, longitude;

      if (!result.tags.GPSLatitude || !result.tags.GPSLongitude) {
        return res.status(400).json({
          message:
            "The picture that you try to upload has not contained co-ordinates. Make sure your camera is enabled with location",
        });
      }

      latitude = result.tags.GPSLatitude;
      longitude = result.tags.GPSLongitude;

      const params = {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      };

      try {
        const s3Data = await s3.upload(params).promise();

        await User.findOneAndUpdate(
          { _id: userId },
          {
            $push: {
              contributions: {
                bucket: bucketName,
                key: s3Data.Key,
                fileName: s3Data.Key.split("/")[1],
                fileType: mimetype,
                fileSize: size,
                location: { latitude, longitude },
                name,
                address,
                phone,
                description,
              },
            },
          },
          { new: true, upsert: true }
        );

        res.status(200).json({ message: "Image uploaded successfully!" });
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  getAllImages: async (req, res) => {
    try {
      const userId = req.userId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

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

      // Extract all contributions from the result
      const allContributions = result[0]?.allContributions || [];

      // generating signed urls
      await Promise.all(
        allContributions.map(async (contribution) => {
          const params = {
            Bucket: contribution.bucket,
            Key: contribution.key,
            Expires: 60 * 60,
          };

          const url = await s3.getSignedUrlPromise("getObject", params);

          contribution["url"] = url;
          (contribution["fileType"] = contribution.fileType),
            (contribution["fileSize"] = contribution.fileSize),
            (contribution["fileName"] = contribution.key.split("/")[1]);
        })
      );

      const filteredContributions = allContributions.map(
        ({ bucket, key, ...rest }) => rest
      );

      res.status(200).send(filteredContributions);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  getPresignedImageUrl: async (req, res) => {
    try {
      const userId = req.userId;
      const { imageId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      const contributed = user.contributions.find(
        (contribution) => contribution._id.toString() === imageId
      );

      if (!contributed) {
        return res.status(404).json({ message: "Image not found" });
      }

      const params = {
        Bucket: contributed.bucket,
        Key: contributed.key,
        Expires: 60 * 60,
      };

      const url = await s3.getSignedUrlPromise("getObject", params);

      res.status(200).json({ url });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteUploadedImage: async (req, res) => {
    try {
      const userId = req.userId;

      const imageId = req.params.imageId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (user.userCategory !== "communityUploader") {
        return res.status(400).json({
          message: "You are not an authorized user to delete contributions.",
        });
      }

      const contributionIndex = user.contributions.findIndex(
        (contribution) => contribution._id.toString() === imageId
      );

      if (!contributionIndex === -1) {
        return res.status(404).json({ message: "Image not found" });
      }

      const contribution = user.contributions[contributionIndex];

      const params = {
        Bucket: contribution.bucket,
        Key: contribution.key,
      };

      await s3.deleteObject(params).promise();

      user.contributions.splice(contributionIndex, 1);

      await user.save();

      res.status(204).json({ message: "Image deleted successfully!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getLocationForReuniteSeeker: async (req, res) => {
    try {
      const userId = req.userId;

      const contributionId = req.params.contributionId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (!user.userCategory === "reuniteSeeker") {
        return res.status(400).json({
          message: "User is not authorized!",
        });
      }

      req.body["visitorsId"] = userId.toString();
      req.body["contributionId"] = contributionId;

      const visitor = new Visitors(req.body);
      await visitor.save();

      res.status(200).json({ message: "Success!" });
    } catch (error) {
      console.log(error);
    }
  },

  getStatus: async (req, res) => {
    try {
      const userId = req.userId;
      const contributionId = req.params.contributionId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (!user.userCategory === "reuniteSeeker") {
        return res.status(400).json({
          message: "User is not authorized!",
        });
      }

      // const isContribution = await Visitors.findOne({
      //   contributionId: contributionId,
      // });

      // if (!isContribution) {
      //   return res.status(400).json({ message: "Invalid contribution id." });
      // }

      let contribution = await Visitors.findOne({
        contributionId: contributionId,
        visitorsId: userId,
        meetingDate: { $gte: Date.now() },
        checking: true,
      });

      if (!contribution) {
        contribution = await Visitors.findOne({
          contributionId: contributionId,
          visitorsId: { $ne: userId },
          meetingDate: { $gt: Date.now() },
          checking: true,
        });
      }

      // if (!contribution) {
      //   return res.status(400).json({ message: "Forbidden" });
      // } else {
      //   res.status(200).json({
      //     message: contribution,
      //   });
      // }

      res.status(200).json({
        message: contribution,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const userId = req.userId;
      const contributionId = req.params.contributionId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (!user.userCategory === "reuniteSeeker") {
        return res.status(400).json({
          message: "User is not authorized!",
        });
      }

      const contribution = await Visitors.findOne({
        contributionId: contributionId,
        visitorsId: userId,
        meetingDate: { $gte: Date.now() },
        checking: true,
      });

      if (!contribution) {
        return res.status(400).json({
          message: "Contribution not found or meeting date has passsed",
        });
      }

      if (req.body.status !== "not-rescued") {
        contribution.checking = false;
        contribution.status = "rescued";

        await contribution.save();

        const updateResult = await User.updateOne(
          { "contributions._id": contributionId },
          {
            $set: {
              "contributions.$.status": req.body.status,
            },
          }
        );

        if (updateResult.nModified === 0) {
          return res
            .status(400)
            .json({ message: "contribution status update failed" });
        }

        return res
          .status(200)
          .json({ message: "Status updated successfully!" });
      }

      contribution.checking = false;

      await contribution.save();

      res.status(200).json({ message: "Status updated successfully!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getLocation: async (req, res) => {
    try {
      const userId = req.userId;

      const imageId = req.params.imageId;

      const user = await User.findOne({
        _id: userId,
        userCategory: "communityUploader",
      });

      if (!user) {
        return res.status(400).json({ message: "Unauthorized!" });
      }

      const contributionIndex = user.contributions.findIndex(
        (contribution) => contribution._id.toString() === imageId
      );

      if (!contributionIndex === -1) {
        return res.status(404).json({ message: "Image not found" });
      }

      const contribution = user.contributions[contributionIndex];

      const { latitude, longitude } = contribution.location;

      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

      res.status(200).json({ url: googleMapsUrl });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },
  updateContribution: async (req, res) => {
    try {
      const userId = req.userId;

      const { contributionId } = req.params;

      const { name, address, phone, description } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (user && user.userCategory !== "communityUploader") {
        return res
          .status(400)
          .json({ message: "You are not authorized to update contributions." });
      }

      const contribution = user.contributions.find(
        (contribution) => contribution._id.toString() == contributionId
      );

      if (!contribution) {
        return res.status(400).json({ message: "No information found" });
      }

      if (name) contribution.name = name;
      if (address) contribution.address = address;
      if (phone) contribution.phone = phone;
      if (description) contribution.description = description;

      if (req.file) {
        const { originalname, mimetype, size, buffer } = req.file;
        const key = `${userId}/${originalname}`;
        const bucketName = AWS_BUCKET_NAME;

        const parser = exifParser.create(buffer);
        const result = parser.parse();

        if (!result.tags.GPSLatitude || !result.tags.GPSLongitude) {
          return res.status(400).json({
            message:
              "The picture that you tried to upload did not have location information. Make sure camera is enabled with location",
          });
        }

        latitude = result.tags.GPSLatitude;
        longitude = result.tags.GPSLongitude;

        // deleting old file in S3

        if (contribution.key) {
          deleteParams = {
            Bucket: bucketName,
            Key: contribution.key,
          };

          try {
            await s3.deleteObject(deleteParams).promise();
          } catch (error) {
            console.log("Error deleting old file from s3:", error);
            return res
              .status(500)
              .json({ message: "Error deleting old file from s3" });
          }
        }

        // uploadfing new file to S3

        const uploadParams = {
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          contentType: mimetype,
        };

        try {
          const s3Data = await s3.upload(uploadParams).promise();

          // updating contribution with new file info
          contribution.bucket = bucketName;
          contribution.key = s3Data.Key;
          contribution.fileType = mimetype;
          contribution.fileSize = size;
          contribution.location = { latitude, longitude };
        } catch (error) {
          console.log("Error uploading new file to S3:", error);
          res.status(500).json({ message: "Error uploading new file to S3" });
        }
      }

      await user.save();

      res
        .status(200)
        .json({ message: "Reunite seeker information updated successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = userController;
