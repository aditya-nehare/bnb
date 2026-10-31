const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  }
  // You do NOT need to define username and password here.
  // The plugin automatically adds 'username', 'hash', and 'salt'.
});

// Inject the plugin into the schema
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
