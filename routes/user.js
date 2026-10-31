const express = require("express");
const router = express.Router();
const passport = require("passport");

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
      req.flash("success", "Welcome back");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});

router.get("/login", (req, res) => {
  res.render("users/login")
})

router.post(
  "/login",
  // Passport automatically checks the DB and compares the hashed password
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true, // Automatically flashes an error if login fails
  }),
  async (req, res) => {
    // If execution reaches here, the user is successfully authenticated
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
  },
);

module.exports = router;
