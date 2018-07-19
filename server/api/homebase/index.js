'use strict';

var express = require('express');
var controller = require('./homebase.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.get('/:id/comments', controller.getComments);
router.get('/:id/following', controller.getFollowing);
router.get('/:id/followers', controller.getFollowers);
router.get('/:id/groups', controller.getGroups);
router.get('/:id/tags', controller.getTags);
router.get('/:id/likes', controller.getLikes);
router.get('/:id/messages', controller.getMessages);
router.get('/:id/feed', controller.getFeed);
router.put('/:id/follow',controller.follow);
router.put('/:id/unfollow',controller.unfollow);
//router.put('/:id/feed', controller.updateFeed);

module.exports = router;