const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");

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

router.get("/new", (req, res) => {
  res.render("listing/new");
});

router.post(
  "/",
  validatelisting,
  wrapAsync(async (req, res) => {
    let listing = new Listing(req.body.listing);
    await listing.save();
    res.redirect("/listings");
  }),
);

router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listing/edit", { listing });
  }),
);

router.patch(
  "/:id",
  validatelisting,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  }),
);

router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  }),
);

router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    console.log(listing);
    res.render("listing/show", { listing });
  }),
);

module.exports = router;
