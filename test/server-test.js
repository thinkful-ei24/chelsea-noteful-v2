'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const knex = require('../knex');

const expect = chai.expect;
chai.use(chaiHttp);

// describe.skip can be added to not run it each time
//describe.only will only run tests that have .only

describe('Sanity check', function() {
  it('true should be true', function() {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function() {
    expect(2 + 2).to.equal(4);
  });
});

describe('Static Server', function() {
  it('GET request "/" should return the index page', function() {
    return chai
      .request(app)
      .get('/')
      .then(function(res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
});

describe('Noteful API', function() {
  const seedData = require('../db/seedData');

  beforeEach(function() {
    return seedData('./db/noteful.sql');
  });

  afterEach(function() {
    console.log('afterEach ran');
  });

  after(function() {
    return knex.destroy(); // destroy the connection
  });

  describe('GET /api/notes', function() {
    it('should return the default of 10 Notes ', function() {
      return chai
        .request(app)
        .get('/api/notes')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(10);
        });
    });

    it('should return correct search results for a valid query', function() {
      return chai
        .request(app)
        .get('/api/notes?searchTerm=about%20cats')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(4);
          expect(res.body[0]).to.be.an('object');
        });
    });
  });

  describe('404 handler', function() {
    const badPath = '/a';

    it('should respond with 404 when given a bad path', function() {
      return chai
        .request(app)
        .get(badPath)
        .then(function(res) {
          expect(res).to.have.status(404);
        });
    });
  });

  describe('GET /api/notes', function() {
    it('should return an array of objects where each item contains id, title, and content', function() {
      return chai.request(app).get('/api/notes', function(res) {
        expect(res.body).to.be.a('array');
        expect(res.body[0]).to.be.a('object');
        expect(res.body[0]).to.include.keys('id', 'title', 'content');
      });
    });

    it('should return an empty array for an incorrect searchTerm', function() {
      return chai
        .request(app)
        .get('/api/notes?searchTerm=asdfjskdfjkweacax')
        .then(function(res) {
          expect(res.body).to.be.a('array').that.is.empty;
        });
    });
  });

  describe.only('GET /api/notes/:id', function() {
    it('should return correct note when given an id', function() {
      return chai
        .request(app)
        .get('/api/notes')
        .then(function(res) {
          const id = res.body[0].id;
          return chai
            .request(app)
            .get(`/api/notes/${id}`)
            .then(function(res) {
              expect(res.body.id).to.equal(id);
            });
        });
    });

    it('should respond with a 404 for an invalid id', function() {
      return chai
        .request(app)
        .get('/api/notes/asdfasdfawe')
        .then(function(res) {
          expect(res).to.have.status(404);
        });
    });
  });

  describe('POST /api/notes', function() {
    it.only('should create and return a new item when provided valid data', function() {
      const newNote = {
        title: 'My newest note',
        content: 'Something really special here',
        tags: [2, 1]
      };
      return chai
        .request(app)
        .post('/api/notes')
        .send(newNote)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('content', 'id', 'title', 'tags');
          expect(res.body.id).to.not.equal(null);
          expect(res.body.tags).to.be.a('array');
        });
    });

    it('should return an error when missing "title" field', function() {
      const newNote = {
        content: 'This is some text for my note'
      };

      return chai
        .request(app)
        .post('/api/notes')
        .send(newNote)
        .then(function(res) {
          expect(res).to.throw(Error);
        });
    });
  });

  describe.skip('PUT /api/notes/:id', function() {
    it('should update the note', function() {});

    it('should respond with a 404 for an invalid id', function() {});

    it('should return an error when missing "title" field', function() {});
  });

  describe.skip('DELETE  /api/notes/:id', function() {
    it('should delete an item by id', function() {});
  });
});
