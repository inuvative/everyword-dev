'use strict';

var express = require('express');
var controller = require('./biblesvc.controller');
var router = express.Router();

router.get('/', controller.getBooks);
router.get('/:testament', controller.getBooks);
router.get('/:book/:chapter', controller.index);
router.get('/:version/:book/:chapter', controller.changeVersion);
router.post('/:book/:chapter', controller.index);
router.post('/:version/:book/:chapter', controller.changeVersion);
//router.get('/:version/:testament/:book/:chapter/:offset', controller.getOffsetChapter);

//router.post('/', controller.create);
//router.put('/:id', controller.update);
//router.patch('/:id', controller.update);
//router.delete('/:id', controller.destroy);

module.exports = router;
