const express = require('express');
const bodyParser = require('body-parser');

const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');

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
    Dishes.find({})
      .then(
        dishes => {
          res.json(dishes);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Dishes.create(req.body)
      .then(
        dish => {
          console.log('Dish Created: ', dish);
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.deleteOne({})
      .then(
        resp => {
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

//mount http routes for dishId
dishRouter
  .route('/:dishId')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  })
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      'POST operation not supported on /dishes/ ' + req.params.dishId + '/'
    );
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findByIdAndUpdate(
      req.params.dishId,
      {
        $set: req.body
      },
      { new: true }
    )
      .then(
        dish => {
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
      .then(
        resp => {
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

//mount http routes for comments
dishRouter
  .route('/:dishId/comments')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  })
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null) {
            res.json(dish.comments);
          } else {
            err = new Error(`Dish ${req.params.dishId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null) {
            dish.comments.push(req.body);
            dish.save().then(
              dish => {
                res.json(dish);
              },
              err => next(err)
            );
          } else {
            err = new Error(`Dish ${req.params.dishId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /dishes/${req.params.dishId}/comments`
    );
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish !== null) {
            for (var i = dish.comments.length - 1; i >= 0; i--) {
              dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save().then(
              dish => {
                res.json(dish);
              },
              err => next(err)
            );
          } else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

//route for commentId
dishRouter
  .route('/:dishId/comments/:commentId')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  })
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.json(dish.comments.id(req.params.commentId));
          } else if (dish == null) {
            err = new Error(`Dish ${req.params.dishId} not found`);
            err.status = 404;
            return next(err);
          } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /dishes/${req.params.dishId}/comments/${req.params.commentId}`
    );
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            if (req.body.rating) {
              dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
              dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish.save().then(
              dish => {
                res.json(dish);
              },
              err => next(err)
            );
          } else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
          } else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            dish.comments.id(req.params.commentId).remove();
            dish.save().then(
              dish => {
                res.json(dish);
              },
              err => next(err)
            );
          } else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
          } else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = dishRouter;
