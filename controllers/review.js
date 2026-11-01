const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.review = async (req, res) => {
  let listing = await Listing.findById(req.params.id);

  if (!listing) {
    req.flash("error", "The listing you are trying to review does not exist!");
    return res.redirect("/listings");
  }

  let new_review = new Review(req.body.review);
  new_review.author = req.user._id;

  listing.reviews.push(new_review);
  await new_review.save();
  await listing.save();

  req.flash("success", "Successfully created a new review!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.delete = async (req, res) => {
  let { id, review_id } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: review_id } });
  await Review.findByIdAndDelete(review_id);

  req.flash("success", "Successfully deleted the review!");
  res.redirect(`/listings/${id}`);
};
