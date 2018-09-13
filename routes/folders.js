'use strict';

// adding express
const express = require('express');
// Create an router instance (aka "mini-app")
const router = express.Router();

//adding knex
const knex = require('../knex');

//GET all
router.get('/', (req, res, next) => {
  // using knex will connect SQL calls to database
  knex
    .select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

//GET folder by id
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  knex
    .first('id', 'name')
    .where('id', `${id}`)
    .from('folders')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

//Create folder

router.post('/', (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `Name` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = { name };

  knex
    .insert(newItem)
    .into('folders')
    .returning(['id', 'name'])
    .then(results => {
      const result = results[0];
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      next(err);
    });
});

//Update folder

router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body.');
    err.status = 400;
    return next(err);
  }

  const updateItem = { name };

  knex
    .from('folders')
    .update(updateItem)
    .where('id', `${id}`)
    .returning(['id', 'name'])
    .then(([result]) => {
      if (result) {
        res.status(200).json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

//Delete folder

router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  knex
    .del()
    .where('id', `${id}`)
    .from('folders')
    .then(() => {
      res.sendStatus(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
