'use strict';

var express = require('express');
var controller = require('./devotional.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/show/:id', controller.show);
router.get('/find/:day', controller.findByDay);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.get('/votd',controller.verseOftheDay)

module.exports = router;