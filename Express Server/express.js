const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const commandRouter = require("./commandsRouter");
const timedMessagesRouter = require("./TimedMessagesRouter");
const kunaiSystemRouter = require("./kunaiSystemRouter");
const fetch = require("node-fetch");

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.DBCONNECTION);

app.use("/commands", commandRouter);
app.use("/timedMessages", timedMessagesRouter);
app.use("/kunaiSystem", kunaiSystemRouter);
app.get("/api/users", async (req, res) => {
  const clientId = process.env.STREAMER_CLIENT_ID;
  const accessToken = req.headers.authorization;

  const response = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      "Client-ID": clientId,
      Authorization: accessToken,
    },
  });

  if (response.ok) {
    const data = await response.json();
    res.json(data);
  } else {
    res.status(500).json({ error: "Failed to fetch user information" });
  }
});

app.listen(3001, function () {
  console.log("Listening on port 3001");
});
