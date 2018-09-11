'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

//adding knex
const knex = require('../knex');

// Get All (and search by query)
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;

  knex
    .select('notes.id', 'title', 'content')
    .from('notes')
    .modify(queryBuilder => {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .orderBy('notes.id')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

// // Get a single item
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  knex
    .from('notes')
    .where('id', `${id}`)
    .then(results => {
      res.status(200).json(results[0]);
    })
    .catch(err => {
      next(err);
    });
});

// Put update an item
router.put('/:id', (req, res, next) => {
  const { id } = req.params;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex
    .from('notes')
    .where('id', `${id}`)
    .update(updateObj)
    .then(results => {
      res.status(200).json(results);
    })
    .catch(err => {
      next(err);
    });
});

// // Post (insert) an item
router.post('/', (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex
    .from('notes')
    .insert(newItem)
    .returning(['id', 'title', 'content'])
    .then(result => {
      if (result) {
        res
          .location()
          .status(201)
          .json(result);
      }
    })
    .catch(err => {
      next(err);
    });
});

// // Delete an item
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  knex
    .from('notes')
    .where('id', `${id}`)
    .del()
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
