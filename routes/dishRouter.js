const express = require('express');
const bodyParser = require('body-parser');

//create route handler
const dishRouter = express.Router();

//Use middleware to read JSON
dishRouter.use(bodyParser.json());

//mount http routes for dishes
dishRouter
  .route('/')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  })
  .get((req, res, next) => {
    res.end('Will send all the dishes to you!');
  })
  .post((req, res, next) => {
    res.end(
      `Will add the dish: ${req.body.name} with the details: ${req.body.description}`
    );
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
  })
  .delete((req, res, next) => {
    res.end('Deleting all dishes');
  });

// mount http routes for dishId
dishRouter
  .route('/:dishId')
  .all((req, res, next) => {
    res.setHeader('Content-Type', 'text/plain');
    next();
  })
  .get((req, res, next) => {
    res.end(`Will send details of dish: ${req.params.dishId} to you!`);
  })
  .post((req, res, next) => {
    res.end(`POST operation not supported on ${req.params.dishId}`);
  })
  .put((req, res, next) => {
    res.write(`Updating the dish: ${req.params.dishId} \n`);
    res.end(
      `Will update the dish: ${req.body.name} with details ${req.body.description}`
    );
  })
  .delete((req, res, next) => {
    res.end(`Deleting dish: ${req.params.dishId}`);
  });

module.exports = dishRouter;
