const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const viewerSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  kunai: {
    type: Number,
  },
});

const viewer = mongoose.model("viewer", viewerSchema);
module.exports = viewer;
