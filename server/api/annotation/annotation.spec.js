'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('Annotations endpoint tests', function() {
  describe('GET /api/annotations', function() {
	  it('should respond with JSON array', function(done) {
	    request(app)
	      .get('/api/annotations')
	      .expect(200)
	      .expect('Content-Type', /json/)
	      .end(function(err, res) {
	        if (err) return done(err);
	        res.body.should.be.instanceof(Array);
	        done();
	      });
	  });
  });
  describe('Retrieve Footnotes annotation', function() {
	  it('should respond with JSON array', function(done) {
	    request(app)
	      .post('/api/annotations/Genesis/1/1/footnotes')
	      .send({text : 'In the beginning God created the heaven and the earth.'})
	      .expect(200)
	      .expect('Content-Type', /json/)
	      .end(function(err, res) {
	        if (err) return done(err);
	        res.body.should.be.instanceof(Array);
	        done();
	      });
	  });
  });
});