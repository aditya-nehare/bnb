const express = require("express");
const router = express.Router();
const passport = require("passport");

const User = require("../models/user.js");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req, res) => {
  res.render("users/signup");
});

router.post("/signup", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    let newUser = new User({ email, username });

    let registeredUser = await User.register(newUser, password);

    // Automatically log the user in after signing up
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to App");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true, // Automatically flashes an error if login fails
  }),
  async (req, res) => {
    // If execution reaches here, the user is successfully authenticated
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl;
    console.log(redirectUrl);
    res.redirect(redirectUrl);
  },
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
});

module.exports = router;
