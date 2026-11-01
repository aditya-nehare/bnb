const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { validatelisting, isLoggedIn, isOwner } = require("../middleware.js");

const listingController = require("../controllers/listing.js");

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    validatelisting,
    wrapAsync(listingController.createListing),
  );

router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .patch(
    isLoggedIn,
    isOwner,
    validatelisting,
    wrapAsync(listingController.edit),
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.delete),
  );

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListingForm),
);

module.exports = router;
