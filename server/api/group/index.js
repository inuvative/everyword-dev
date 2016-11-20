'use strict';

var express = require('express');
var controller = require('./group.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.get('/:id/feed', controller.getFeed);
router.get('/:id/feedcount',controller.getFeedCount);
router.get('/:id/members', controller.showMembers);
router.put('/:id/members', controller.updateMembers);
router.put('/:id/members/delete', controller.removeMembers);
router.get('/:id/invited', controller.showInvited);
router.get('/:id/requests', controller.showRequests);

module.exports = router;