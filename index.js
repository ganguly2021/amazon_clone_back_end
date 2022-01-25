// library include
require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const port = process.env.PORT;
const api_version = process.env.API_VERSION;
const database = require("./database");
const path = require("path");

const {
  decryptJWT,
  validateJWTUser,
  handleJWTError,
} = require("./middlewares/auth");

// user routes
const userRoutes = require("./routes/users");

// middleware
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options("*", cors());

// handle JSON web Token
app.use(decryptJWT());
app.use(handleJWTError);
app.use(validateJWTUser);

// set static directory
app.use("/public", express.static(__dirname + "/public"));

// API Routes setup
app.use(`${api_version}/users`, userRoutes);

// route
app.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    message: "Amazon Clone REST API Home Page.",
  });
});

// Start Server
app.listen(port, () => {
  console.log("Server running at port : " + port);
});
