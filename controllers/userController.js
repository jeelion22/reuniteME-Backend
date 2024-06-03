const User = require("../models/user");
const sendEmailToVerifyEmail = require("../utils/email");
const crypto = require("crypto");
const sendOTP = require("../utils/sendOTP");
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

      const verificationURL = `${req.protocol}://localhost:5173/users/verify/${emailToken}`;
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
          .json({ message: "Your email verification already completed." });
      }

      user.isEmailVerified = true;
      user.isActive = true;
      await user.save();

      const userId = user._id.toString();

      res.status(201).json({
        message: "Your account verified successfully!",

        redirectTo: `create-password/${userId}`,
      });
      console.log(userId);
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

      const passwordHash = await bcrypt.hash(password.password, 10);

      user.passwordHash = passwordHash;

      await user.save();

      res.status(200).json({ message: "Password created successfully!" });
    } catch (error) {
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
        return res.status(400).json({ message: "Invalid Credentials." });
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

  upload: async (req, res) => {
    try {
      const userId = req.userId;
      const { name, address, phone, description } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
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

        const updatedUser = await User.findOneAndUpdate(
          { _id: userId },
          {
            $push: {
              contributions: {
                bucket: bucketName,
                key: s3Data.Key,
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

      const images = await Promise.all(
        user.contributions.map(async (contribution) => {
          const params = {
            Bucket: contribution.bucket,
            Key: contribution.key,
            expires: 60 * 60, //for an hour validity
          };

          const url = await s3.getSignedUrlPromise("getObject", params);

          return {
            url,
            fileType: contribution.fileType,
            fileSize: contribution.fileSize,
            fileName: contribution.key.split("/")[1],
          };
        })
      );

      res.status(200).json({ images });
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
      console.log(error);
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

      res.status(200).json({ message: "Image deleted successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  getLocation: async (req, res) => {
    try {
      const userId = req.userId;

      const imageId = req.params.imageId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
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
