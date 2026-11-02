const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const { q } = req.query;
  let query = {};

  if (q && q.trim() !== "") {
    const searchRegex = new RegExp(q.trim(), "i");
    query = {
      $or: [
        { title: searchRegex },
        { location: searchRegex },
        { country: searchRegex },
      ],
    };
  }

  const list = await Listing.find(query);
  res.render("listing/index", { list, searchQuery: q });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listing/new");
};

module.exports.createListing = async (req, res, next) => {
  console.log("\n--- [START] CREATE LISTING SUBMISSION ---");
  console.log("1. Checking Multer file upload (Cloudinary)...");
  console.log(
    "   req.file:",
    req.file
      ? { path: req.file.path, filename: req.file.filename }
      : "NO FILE DETECTED",
  );

  console.log("2. Checking Mapbox Geocoding Token...");
  console.log(
    "   MAP_TOKEN starts with:",
    process.env.MAP_TOKEN
      ? process.env.MAP_TOKEN.substring(0, 10) + "..."
      : "UNDEFINED",
  );

  let geometry = {
    type: "Point",
    coordinates: [77.209, 28.6139], // Default fallback [lng, lat] (New Delhi)
  };

  try {
    const geoResponse = await geocodingClient
      .forwardGeocode({
        query: `${req.body.listing.location}, ${req.body.listing.country}`,
        limit: 1,
      })
      .send();

    console.log("3. Mapbox geocoding call succeeded!");
    if (
      geoResponse.body &&
      geoResponse.body.features &&
      geoResponse.body.features.length > 0
    ) {
      geometry = geoResponse.body.features[0].geometry;
      console.log("   Coordinates retrieved:", geometry.coordinates);
    } else {
      console.warn(
        "   No features returned by Mapbox for this location. Using fallback.",
      );
    }
  } catch (geoErr) {
    console.error("MAPBOX ERROR DETECTED:");
    console.error("   Status / Message:", geoErr.message);
    if (geoErr.statusCode) console.error("   Status code:", geoErr.statusCode);
  }

  try {
    const url = req.file.path;
    const filename = req.file.filename;

    let listing = new Listing(req.body.listing);
    listing.owner = req.user._id;
    listing.image = { url, filename };
    listing.geometry = geometry;

    const savedDoc = await listing.save();
    console.log("4. Listing saved successfully with ID:", savedDoc._id);

    req.flash("success", "Successfully created a new listing!");
    res.redirect(`/listings/${savedDoc._id}`);
  } catch (dbErr) {
    console.error("MONGOOSE SAVE ERROR:", dbErr);
    next(dbErr);
  }
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

  let originalImageUrl = listing.image.url;
  let originalImageThumbnail = originalImageUrl.replace(
    "/upload",
    "/upload/w_250,h_200,c_fill",
  );

  res.render("listing/edit", { listing, originalImageThumbnail });
};

module.exports.edit = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    const url = req.file.path;
    const filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Successfully updated the listing!");
  res.redirect(`/listings/${id}`);
};

module.exports.delete = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);

  req.flash("success", "Successfully deleted the listing!");
  res.redirect("/listings");
};
