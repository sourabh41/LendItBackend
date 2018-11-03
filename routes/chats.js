var express = require('express');
var router = express.Router();

// messages of a specific chat 
router.get('/', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.many('select * from post where post.thread_id = $1', [req.query.thread_id])
		.then(function (data) {	
			res.status(200)
				.json({
					status: true,
					data: data,
					message: 'retrieved all messages in requested chat'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});


// all conversations of a user
router.get('/all', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.many('select * from conversation, item where conversation.item_id = item.item_id and (item.owner_id = $1 or conversation.borrower_id = $1)', [req.session.rollno])
		.then(function (data) {	
			res.status(200)
				.json({
					status: true,
					data: data,
					message: 'retrieved all conversations of current user'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});

module.exports = router;
