'use strict';

// adding express
const express = require('express');

//adding knex
const knex = require('../knex');

// Create an router instance (aka "mini-app")
const router = express.Router();

//Read
router.get('/', (req, res, next) => {
  // connecting SQL calls to database
  console.log('hi');
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

//Create

//Update

//Delete

module.exports = router;
