'use strict';

const knex = require('../knex');

// let searchTerm = 'gaga';
// knex
//   .select('notes.id', 'title', 'content')
//   .from('notes')
//   .modify(queryBuilder => {
//     if (searchTerm) {
//       queryBuilder.where('title', 'like', `%${searchTerm}%`);
//     }
//   })
//   .orderBy('notes.id')
//   .then(results => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.error(err);
//   });

//Get Note By Id accepts an ID. It returns the note as an object not an array
// let id = '1002';

// knex
//   .select()
//   .from('notes')
//   .where('id', `${id}`)
//   .then(results => {
//     console.log(results[0]);
//   }).catch(err => {
//     console.error(err);
//   });

//Update Note By Id accepts an ID and an object with the desired updates. It returns the updated note as an object

// let id = '1002';
// let title = 'something someone wrote in';
// let content = 'this is what they wrote';

// knex
//   .from('notes')
//   .where('id', `${id}`)
//   .update({
//     title: `${title}`,
//     content: `${content}`
//   })
//   .returning(['title', 'id', 'content'])
//   .then(res => console.log(res[0]))
//.catch(err => {
//     console.error(err);
//   });

//Create a Note accepts an object with the note properties and inserts it in the DB. It returns the new note (including the new id) as an object.

// let title = 'New one #2';
// let content = 'this is what they wrote';

// knex
//   .from('notes')
//   .insert({
//     title: `${title}`,
//     content: `${content}`
//   })
//   .returning(['title', 'id', 'content'])
//   .then(res => console.log(res[0]))
//   .catch(err => {
//     console.error(err);
//   });

//Delete Note By Id accepts an ID and deletes the note from the DB.

let id = '2001';

knex
  .from('notes')
  .where('id', `${id}`)
  .del()
  .then(res => console.log(res));
