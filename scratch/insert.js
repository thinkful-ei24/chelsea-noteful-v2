'use strict';

const noteId = 99;
const result = [34, 56, 78, 100].map(tagId => ({
  note_id: noteId,
  tag_id: tagId
}));
console.log(result);
