const express = require("express");

const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");
const oAuth2Router = require("./routes/oAuth2Routes");

const cors = require("cors");

const app = express();

const cookieParser = require("cookie-parser");

const morgan = require("morgan");

app.use(
  cors({
    origin: ["https://reuniteme.netlify.app", "http://localhost:5173"],
  })
);

app.use(cookieParser());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api", oAuth2Router);

app.get("/api", (req, res) => {
  res.json({ message: "Welcome to the ReUniteME's API end points!" });
});

app.use("/api/users", userRouter);
app.use("/api/admins", adminRouter);

module.exports = app;
