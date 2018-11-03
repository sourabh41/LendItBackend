var express = require('express');
var router = express.Router();

// get all users, basically just to test db connection
router.get('/', function(req, res, next) {
	req.db.many('select * from users')
		.then(function (data) {
			res.status(200)
				.json({
					status: true,
					data: data,
					message: 'retrieved all users'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});

module.exports = router;
