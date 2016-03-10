var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*router.get('/index', function(req, res, next) {
    res.render('index', { title: 'Express' });
});*/

router.get('/login', function(req, res, next) {
  res.render('logIn', { title: 'Express' });
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Express' });
});

router.get('/chat', function(req, res, next) {
  res.render('chat', { title: 'Express' });
});

router.get('/dashboard', function(req, res, next) {
    res.render('dashboard', { title: 'Express' });
});

module.exports = router;
