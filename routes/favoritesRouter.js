const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');

const Favorites = require('../models/favorites');
const User = require('../models/user');
const authenticate = require('../authenticate');

//create route handler
const favoritesRouter = express.Router();

//Use middleware to read JSON
favoritesRouter.use(bodyParser.json());

favoritesRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Favorites.find({})
      .populate('user')
      .populate('dishes')
      .then(
        Favorites => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json)');
          res.json(Favorites);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user._id, (err, user) => {
      if (err) {
        return document(err, false);
      } else {
        Favorites.findOne(
          { user: mongoose.Types.ObjectId(user._id) },
          (err, favorite) => {
            if (err) {
              return document(err, false);
            } else {
              Favorites.findOneAndUpdate(
                { user: mongoose.Types.ObjectId(user._id) },
                { $addToSet: { dishes: req.body._id } },
                { upsert: true, returnNewDocument: true }
              )
                .then(
                  user_favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user_favorite);
                  },
                  err => next(err)
                )
                .catch(err => next(err));
            }
          }
        );
      }
    });
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user._id, (err, user) => {
      if (err) {
        return document(err, false);
      } else {
        Favorites.remove({ user: mongoose.Types.ObjectId(user._id) })
          .then(
            resp => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(resp);
            },
            err => next(err)
          )
          .catch(err => next(err));
      }
    });
  });

favoritesRouter
  .route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    console.log(req.user._id);
    Favorites.findOne({ user: req.user._id })
      .then(
        favorite => {
          if (!favorite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({ exists: false, favorite: favorite });
          } else {
            if (favorite.dishes.indexOf(req.params.dishId) < 0) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.json({ exists: false, favorite: favorite });
            } else {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.json({ exists: true, favorite: favorite });
            }
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) return next(err);
      if (!favorite) {
        Favorites.create({ user: req.user._id });
        then(favorite => {
          favorite.dishes.push({ _id: req.params.dishId });
          favorite
            .save()
            .then(favorite => {
              Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then(favorite => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorite);
                })
                .catch(err => next(err));
            })
            .catch(err => next(err));
        }).ctach(err => next(err));
      }
      if (favorite.dishes.indexOf(req.params.dishId) !== -1) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(`Dish ${req.params.dishId} already exists!`);
      }
      favorite.dishes.push(req.body);
      favorite
        .save()
        .then(favorite => {
          Favorites.findById(favorite._id)
            .populate('user')
            .populate('dishes')
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            })
            .catch(err => next(err));
        })
        .catch(err => {
          return next(err);
        });
    });
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) return next(err);

      console.log(favorite);
      const index = favorite.dishes.indexOf(req.params.dishId);

      if (index >= 0) {
        favorite.dishes.splice(index, 1);
        favorite.save();
        favorite
          .save()
          .then(favorite => {
            Favorites.findById(favorite._id)
              .populate('user')
              .populate('dishes')
              .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              });
          })
          .catch(err => {
            return next(err);
          });
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`Dish ${req.params._id} not found`);
      }
    });
  });

module.exports = favoritesRouter;
