var express = require('express');
var router = express.Router();

// one specific lending //TODO
router.get('/', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.one('select * from lending, item where lending.item_id = item.item_id and lending.item_id = $1 and lending.borrower_id = $2 and lending.request_timestamp = $3', [req.query.item_id, req.query.borrower_id, req.query.request_timestamp])
		.then(function (data) {	
			res.status(200)
				.json({
					status: true,
					data: data,
					message: 'retrieved requested lending'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});

// lendings asked by current user
router.get('/all', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.any('select * from lending, item, users where lending.borrower_id = users.rollno and  lending.item_id = item.item_id and lending.borrower_id = $1', [req.session.rollno])
		.then(function (data) {	
			res.status(200)
				.json({
					status: true,
					data: data,
					message: 'retrieved all lendings of current user'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});

// lending requests for current user
router.get('/requests', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.any('select * from lending, item where lending.item_id = item.item_id and item.owner_id = $1', [req.session.rollno])
		.then(function (data) {	
			res.status(200)
				.json({
					status: true,
					data: data,
					message: 'retrieved all lending requests for current user'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});

module.exports = router;
