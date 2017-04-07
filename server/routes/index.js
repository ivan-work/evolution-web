var router = require('express').Router();
var path = require('path');

// Rest API
//require(path.join(__dirname, './', 'todos'))(router);
//require(path.join(__dirname, './', 'users'))(router);

// Homepage/Client
router.get('/', function(req, res, next) {
  res.send("ok");
});



module.exports = function(app, passport) {
	// set authentication routes
	//require('./authentication.js')(app, passport);

	// set other routes
	app.use('/api', router);
};
