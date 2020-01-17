const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');

const Promotions = require('../models/promotions'); //access to Schema

const promoRouter = express.Router(); //create route

promoRouter.use(bodyParser.json()); //read json with middleware

//http routes for Promos
promoRouter
  .route('/')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  })
  .get((req, res, next) => {
    Promotions.find({})
      .then(
        promos => {
          res.json(promos);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.create(req.body)
      .then(
        promo => {
          console.log('Promotion Created: ', promo);
          res.json(promo);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotions.deleteOne({})
        .then(
          resp => {
            res.json(resp);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

//http routes for promoId
promoRouter
  .route('/:promoId')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  })
  .get((req, res, next) => {
    Promotions.findById(req.params.promoId)
      .then(
        promo => {
          res.json(promo);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /promotions/${req.params.promoId}`
    );
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndUpdate(
      req.params.promoId,
      {
        $set: req.body
      },
      { new: true }
    )
      .then(
        promo => {
          res.json(promo);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotions.findByIdAndRemove(req.params.promoId)
        .then(
          resp => {
            res.json(resp);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

module.exports = promoRouter;
