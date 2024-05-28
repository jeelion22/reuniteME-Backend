const express = require("express");

const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");

const cors = require("cors");

const app = express();

const cookieParser = require("cookie-parser");

const morgan = require("morgan");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use((req, res, next) => {
  req.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

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
