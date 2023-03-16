const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timedMessagesSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  remaining: {
    type: String,
  },
  lines: {
    type: String,
    required: true,
  },
});
const timedMessages = mongoose.model("timedMessages", timedMessagesSchema);
module.exports = timedMessages;
