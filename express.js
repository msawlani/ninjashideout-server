const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const commandRouter = require("./commandsRouter");

app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb+srv://admin:Ninja%401234@ninjashideoutbot.hjs33os.mongodb.net/Ninjashideout"
);

app.use("/commands", commandRouter);

app.listen(3001, function () {
  console.log("Listening on port 3001");
});
