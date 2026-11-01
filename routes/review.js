const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");

const {
  validate_review,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");

const reviewController = require("../controllers/review.js");

router
  .route("/")
  .post(isLoggedIn, validate_review, wrapAsync(reviewController.review));

router
  .route("/:review_id")
  .delete(isLoggedIn, isReviewAuthor, wrapAsync(reviewController.delete));

module.exports = router;
