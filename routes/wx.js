var express = require('express');
var router = express.Router();
var wxController = require('../controllers/wx');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/list', wxController.list);
router.get('/detail', wxController.detail);

module.exports = router;
