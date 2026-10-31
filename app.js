require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");

const ExpressError = require("./utils/ExpressError.js");
const { logger } = require("./middleware.js");

const listing_router = require("./routes/listing.js");
const review_router = require("./routes/review.js");

const app = express();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(logger);
app.use(cookieParser());

const session_option = {
  secret: "mySuperSecretKey", // Used to cryptographically sign the session ID cookie
  resave: false, // Forces session to be saved back to the session store, even if modified
  saveUninitialized: true, // Forces an uninitialized session to be saved to the store (useful for login/auth)
  store: MongoStore.create({
    mongoUrl: MONGO_URL,
    touchAfter: 24 * 3600, // time period in seconds to lazy update sessions
  }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie lifespan (7 days)
    httpOnly: true, // Protects against XSS attacks
  },
};

app.use(session(session_option));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success"); // For success messages
  res.locals.error = req.flash("error");     // For error messages
  next();
});

app.use("/listings", listing_router);
app.use("/listings/:id/reviews", review_router);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", engine);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
};

app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "Hi, I am root" });
});

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error", { statuscode: statusCode, message });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
};

startServer();
