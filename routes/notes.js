'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

//adding knex
const knex = require('../knex');

//import hydration module from /utils/hydrateNotes.js
const hydrateNotes = require('../utils/hydrateNotes');

// Get All (and search by query)
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;

  knex
    .select(
      'notes.id',
      'title',
      'content',
      'folders.id as folderId',
      'tags.id as tagId', // pass to hydrateNotes later
      'tags.name as tagName' //pass to hydrateNotes later
    )
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
    .modify(queryBuilder => {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .modify(queryBuilder => {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
      }
    })
    .modify(queryBuilder => {
      if (tagId) {
        queryBuilder.where('tag_id', tagId);
      }
    })
    .orderBy('notes.id')
    .then(results => {
      const hydrated = hydrateNotes(results);
      res.json(hydrated);
    })
    .catch(err => {
      next(err);
    });
});

// // Get a single item
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  // const { folderId } = req.body;

  //validate id can't be anything other than numbers
  // if (typeof id !== 'number') {
  //   const err = new Error('Must be a valid id');
  //   err.status = 404;
  //   return next(err);
  // }

  knex
    .select(
      'notes.id',
      'title',
      'content',
      'folders.id as folderId',
      'tags.id as tagId',
      'tags.name as tagName'
    )
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
    .where('notes.id', id)
    .then(result => {
      console.log(result.length);
      if (result) {
        const hydrated = hydrateNotes(result)[0];
        res.status(200).json(hydrated);
      }
    })
    .catch(err => {
      console.log('made it here');
      next(err);
    });
});

// Put update an item
router.put('/:id', (req, res, next) => {
  const noteId = req.params.id;
  const { title, content, folderId, tags = [] } = req.body;

  /***** Never trust users. Validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const updateItem = {
    title: title,
    content: content,
    folder_id: folderId ? folderId : null
  };

  knex('notes')
    .update(updateItem)
    .where('id', noteId)
    .then(() => {
      return knex
        .del()
        .from('notes_tags')
        .where('note_id', noteId);
    })
    .then(() => {
      const tagsInsert = tags.map(tagId => ({
        note_id: noteId,
        tag_id: tagId
      }));
      return knex.insert(tagsInsert).into('notes_tags');
    })
    .then(() => {
      // Using the noteId, select the note and the folder info
      return knex
        .select(
          'notes.id',
          'title',
          'content',
          'folder_id as folderId',
          'folders.name as folderName',
          'tags.id as tagId',
          'tags.name as tagName'
        )
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', noteId);
    })
    .then(result => {
      if (result.length === 1) {
        //hydrate results
        const [hydrated] = hydrateNotes(result);
        res.json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

// // Post (insert) an item
router.post('/', (req, res, next) => {
  const { title, content, folderId, tags = [] } = req.body;
  console.log('HERE');
  console.log(folderId);
  const newItem = {
    title: title,
    content: content
  };

  let noteId;

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  // Insert new note into notes table
  knex
    .insert(newItem)
    .into('notes')
    .returning('id')
    .then(([id]) => {
      // Insert related tags into notes_tags table
      noteId = id;

      const tagsInsert = tags.map(tagId => ({
        note_id: noteId,
        tag_id: tagId
      }));
      return knex.insert(tagsInsert).into('notes_tags');
    })
    .then(() => {
      return knex
        .select(
          'notes.id',
          'title',
          'content',
          'folder_id as folderId',
          'folders.name as folderName',
          'tags.id as tagId',
          'tags.name as tagName'
        )
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', noteId);
    })

    .then(result => {
      if (result) {
        //hydrate results
        const hydrated = hydrateNotes(result)[0];
        //respond with a location header, a 201 status and a note obj
        res
          .location(`${req.originalUrl}/${hydrated.id}`)
          .status(201)
          .json(hydrated);
      } else {
        next();
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
