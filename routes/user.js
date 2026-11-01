const express = require("express");
const router = express.Router();
const passport = require("passport");

const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

router
  .route("/signup")
  .get(userController.render_signup)
  .post(userController.signup);

router
  .route("/login")
  .get(userController.render_login)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login,
  );

router.get("/logout", userController.logout);

module.exports = router;
