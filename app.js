const express = require("express");

const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");

const cors = require("cors");

const app = express();

const cookieParser = require("cookie-parser");

const morgan = require("morgan");



app.use(
  cors({
    origin:  ["https://reuniteme.netlify.app",],
  
  })
);

// app.use((req, res, next) => {
//   req.header("Access-Control-Allow-Origin", "https://reuniteme.netlify.app");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

app.use(cookieParser());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/api", (req, res) => {
  res.json({ message: "Welcome to the ReUniteME's API end points!" });
});

app.use("/api/users", userRouter);
app.use("/api/admins", adminRouter);

module.exports = app;
