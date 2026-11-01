const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner } = require("../middleware.js");

const validatelisting = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errormessage = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errormessage);
  } else {
    next();
  }
};

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const list = await Listing.find({});
    res.render("listing/index", { list });
  }),
);

router.get("/new", isLoggedIn, (req, res) => {
  res.render("listing/new");
});

router.post(
  "/",
  isLoggedIn,
  validatelisting,
  wrapAsync(async (req, res) => {
    let listing = new Listing(req.body.listing);
    listing.owner = req.user._id;
    await listing.save();

    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
  }),
);

router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");

    if (!listing) {
      req.flash("error", "The listing you requested for does not exist!");
      return res.redirect("/listings");
    }

    res.render("listing/show", { listing });
  }),
);

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "The listing you requested to edit does not exist!");
      return res.redirect("/listings");
    }

    res.render("listing/edit", { listing });
  }),
);

router.patch(
  "/:id",
  isLoggedIn,
  isOwner,
  validatelisting,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
  }),
);

router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);

    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
  }),
);

module.exports = router;
