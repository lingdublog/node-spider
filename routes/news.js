var express = require('express');
var router = express.Router();
var newsController = require('../controllers/news');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/list', newsController.list);
router.get('/detail', newsController.detail);
router.get('/comment', newsController.comment);

module.exports = router;
