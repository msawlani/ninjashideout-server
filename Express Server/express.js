const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const commandRouter = require("./commandsRouter");
const timedMessagesRouter = require("./TimedMessagesRouter");

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.DBCONNECTION);

app.use("/commands", commandRouter);
app.use("/timedMessages", timedMessagesRouter);

app.listen(3001, function () {
  console.log("Listening on port 3001");
});
