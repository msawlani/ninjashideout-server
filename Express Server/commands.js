const mongoose = require("mongoose");
const schema = mongoose.Schema;

const commandSchema = new schema({
  command: {
    type: String,
    unique: true,
    required: true,
  },
  active: {
    type: Boolean,
  },
  message: {
    type: String,
    required: true,
  },
});

var Commands = mongoose.model("Command", commandSchema);

module.exports = Commands;
