'use strict';

var express = require('express');
var controller = require('./annotation.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

router.post('/:book/:chapter/:verse/count/:user', controller.annotationCount)
router.get('/:book/:chapter/:verse/comments', controller.findComments);
router.post('/:book/:chapter/:verse/footnotes', controller.findFootnotes);
router.get('/:book/:chapter/:verse/references', controller.findReferences);
router.get('/:book/:chapter/:verse/media', controller.findMedia);
router.get('/:id/find',controller.findAnnotation);

module.exports = router;