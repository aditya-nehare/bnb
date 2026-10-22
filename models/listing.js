const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default:
        "https://4kwallpapers.com/images/wallpapers/404-not-found-cute--18164.jpg",
      set: (v) =>
        v === ""
          ? "https://4kwallpapers.com/images/wallpapers/404-not-found-cute--18164.jpg"
          : v,
    },
  },
  price: Number,
  location: String,
  country: String,
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
