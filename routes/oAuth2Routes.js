const express = require("express");
const { googleAuthCallBack } = require("../controllers/oAuth2Controller");

const oAuth2Router = express.Router();

oAuth2Router.get("/auth/google/callback", googleAuthCallBack);

module.exports = oAuth2Router;
