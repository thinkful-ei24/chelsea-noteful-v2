'use strict';

//requirements
const express = require('express');
const router = express.Router();
const knex = require('../knex');

//GET all tags

router.get('/', (req, res, next) => {
  knex
    .select('id', 'name')
    .from('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

// GET tag by id

router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  knex
    .first('id', 'name') //first removes the need to call results[0] later on - returns obj w/o array
    .from('tags')
    .where('id', `${id}`)
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

// POST create tag

router.post('/', (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `Name` in request body');
    err.status = 400;
    return next(err);
  }

  const newTag = { name };

  knex
    .insert(newTag)
    .into('tags')
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

// PUT update tag

router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body.');
    err.status = 400;
    return next(err);
  }

  const updateTag = { name };

  knex
    .from('tags')
    .update(updateTag)
    .where('id', `${id}`)
    .returning(['id', 'name'])
    .then(([result]) => {
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

// DELETE tag by id

router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  knex
    .del()
    .where('id', `${id}`)
    .from('tags')
    .then(() => {
      res.sendStatus(204).end();
    })
    .catch(err => {
      next(err);
    });
});

//export routers!
module.exports = router;
