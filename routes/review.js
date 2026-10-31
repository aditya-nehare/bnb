const express = require("express");
const router = express.Router({ mergeParams: true });
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

const validate_review = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errormessage = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errormessage);
  } else {
    next();
  }
};

router.post(
  "/",
  validate_review,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      req.flash("error", "The listing you are trying to review does not exist!");
      return res.redirect("/listings");
    }

    let new_review = new Review(req.body.review);

    listing.reviews.push(new_review);
    await new_review.save();
    await listing.save();

    req.flash("success", "Successfully created a new review!");
    res.redirect(`/listings/${listing._id}`);
  }),
);

router.delete(
  "/:review_id",
  wrapAsync(async (req, res) => {
    let { id, review_id } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: review_id } });
    await Review.findByIdAndDelete(review_id);

    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/listings/${id}`);
  }),
);

module.exports = router;
