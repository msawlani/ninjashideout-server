const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const cors = require("./cors")
const Commands = require("./commands");

const commandRouter = express.Router();

commandRouter.use(bodyParser.json());

commandRouter
  .route("/")
  .get((req, res, next) => {
    Commands.find(req.query).then((Command) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(Command);
    });
  })
  .post((req, res, next) => {
    Commands.create(req.body).then((command) => {
      console.log("Commands Created ", command);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(command);
    });
  });

commandRouter
  .route("/:id")
  .delete((req, res, next) => {
    Commands.findByIdAndRemove(req.params.id).then((resp) => {
      console.log(req.params.id);
      res.status = 200;
      res.set("Content-Type", "application/json");
      res.json(resp);
    });
  })
  .put((req, res, next) => {
    Commands.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).then((resp) => {
      console.log(req.params.id);
      res.status = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(resp);
    });
  });

module.exports = commandRouter;
