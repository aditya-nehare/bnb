const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const list = await Listing.find({});
  res.render("listing/index", { list });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listing/new");
};

module.exports.createListing = async (req, res) => {
  let listing = new Listing(req.body.listing);
  listing.owner = req.user._id;
  await listing.save();

  req.flash("success", "Successfully created a new listing!");
  res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "The listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  res.render("listing/show", { listing });
};

module.exports.editListingForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "The listing you requested to edit does not exist!");
    return res.redirect("/listings");
  }

  res.render("listing/edit", { listing });
};

module.exports.edit = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  req.flash("success", "Successfully updated the listing!");
  res.redirect(`/listings/${id}`);
};

module.exports.delete = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);

  req.flash("success", "Successfully deleted the listing!");
  res.redirect("/listings");
};
