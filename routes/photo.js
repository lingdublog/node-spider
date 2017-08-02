var express = require('express');
var router = express.Router();
var photoController = require('../controllers/photo');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/list', photoController.list);
router.get('/detail', photoController.detail);
router.get('/comment', photoController.comment);
router.get('/more', photoController.more);

module.exports = router;
