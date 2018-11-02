var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.many('select * from item, lending where item.owner_id = $1 and item.item_id = lending.item_id', [req.session.rollno])
		.then(function (data) {	
			res.status(200)
				.json({
					status: true,
					data: data,
					message: 'retrieved all requests'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});

module.exports = router;
