var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/fafifu', (req, res) => {
  res.send('fafifu was wes wos');
})

module.exports = router;
