var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  // This redirects to the specified page, by default sending HTTP status code "302 Found"
  res.redirect('/catalog');
});

module.exports = router;
