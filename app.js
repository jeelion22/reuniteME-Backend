const express = require("express");

const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");

const cors = require("cors");

const app = express();

const cookieParser = require("cookie-parser");

const morgan = require("morgan");

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(cookieParser());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.head("/api", (req, res) => {
  res.send("Welcome to the ReUniteME's login portal");
});

app.use("/api/users", userRouter);
app.use("/api/admins", adminRouter);

module.exports = app;
