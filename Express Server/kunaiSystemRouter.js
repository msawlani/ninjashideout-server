const express = require("express");
const bodyParser = require("body-parser");
const Viewer = require("./kunaiSystem");

const kunaiSystemRouter = express.Router();

kunaiSystemRouter.use(bodyParser.json());

kunaiSystemRouter
  .route("/")
  .get((req, res, next) => {
    Viewer.find(req.query).then((viewer) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(viewer);
    });
  })
  .post((req, res, next) => {
    Viewer.create(req.body).then((viewer) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(viewer);
    });
  });

kunaiSystemRouter
  .route("/:viewer")
  .get((req, res, next) => {
    Viewer.find(req.query).then((viewer) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(viewer);
    });
  })
  .put((req, res, next) => {
    Viewer.findOneAndUpdate(
      { username: req.params.viewer },
      { $set: req.body },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).then((resp) => {
      console.log(req.params.viewer);
      res.status = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(resp);
    });
  });

module.exports = kunaiSystemRouter;
