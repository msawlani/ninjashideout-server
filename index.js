require = require("esm")(module /*,options*/);
require("dotenv").config();

module.exports = require("./Express Server/express.js");
module.exports = require("./Bot/tmibot.js");
