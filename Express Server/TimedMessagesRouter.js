const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const cors = require("./cors")
const TimedMessages = require("./TimedMessages");

const timedMessagesRouter = express.Router();

timedMessagesRouter.use(bodyParser.json());

timedMessagesRouter
  .route("/")
  .get((req, res, next) => {
    TimedMessages.find(req.query).then((TimedMessages) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(TimedMessages);
    });
  })
  .post((req, res, next) => {
    TimedMessages.create(req.body).then((timedMessage) => {
      console.log("Time message Created: ", timedMessage);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(timedMessage);
    });
  });

// timedMessagesRouter
//   .route("/:name")
//   .delete((req, res, next) => {
//     TimedMessages.deleteOne({ name: req.params.name }).then((resp) => {
//       console.log(req.params.id);
//       res.status = 200;
//       res.setHeader("Content-Type", "application/json");
//       res.json(resp);
//     });
//   })
//   .put((req, res, next) => {
//     TimedMessages.updateOne(
//       { name: req.params.name },
//       { $set: req.body },
//       { new: true }
//     ).then((resp) => {
//       console.log(req.params.id);
//       res.status = 200;
//       res.setHeader("Content-Type", "application/json");
//       res.json(resp);
//     });
//   });

module.exports = timedMessagesRouter;
