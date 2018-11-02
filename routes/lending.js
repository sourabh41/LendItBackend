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
	req.db.many('select * from lending, item where lending.item_id = $1 and lending.borrower_id = $2 and lending.request_timestamp = $3 and lending.item_id = item.item_id', [req.query.item_id, req.session.rollno, req.query.request_timestamp])
		.then(function (data) {	
			res.status(200)
				.json({
					status: true,
					data: data,
					message: 'retrieved all chats'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});

module.exports = router;
