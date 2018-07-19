'use strict';

var express = require('express');
var controller = require('./dailyreading.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:date', controller.readingsOfDay);
router.get('/group/:groupid',controller.showGroupReading);
router.post('/', controller.create);
router.post('/add', controller.addReadings)
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;