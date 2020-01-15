const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');

const Leaders = require('../models/leaders'); //access to Schema

const leaderRouter = express.Router(); //create route

leaderRouter.use(bodyParser.json()); //read json with middleware

// Route to leaders
leaderRouter
  .route('/')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  })
  .get((req, res, next) => {
    Leaders.find({})
      .then(
        leaders => {
          res.json(leaders);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Leaders.create(req.body)
      .then(
        leader => {
          console.log('Leader Created: ', leader);
          res.json(leader);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operations not supported on /leaders`);
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Leaders.deleteOne({})
      .then(
        resp => {
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

// Route to leaderId
leaderRouter
  .route('/:leaderId')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  })
  .get((req, res, next) => {
    Leaders.findById(req.params.leaderId)
      .then(
        leader => {
          res.json(leader);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /leaders/${req.params.leaderId}`);
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Leaders.findByIdAndUpdate(
      req.params.leaderId,
      {
        $set: req.body
      },
      { new: true }
    )
      .then(
        leader => {
          res.json(leader);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Leaders.findByIdAndRemove(req.params.leaderId)
      .then(
        resp => {
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = leaderRouter;
