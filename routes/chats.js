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
	req.db.any('select * from post where post.thread_id = $1', [req.query.thread_id])
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
	req.db.any('select thread_id, borrower_id, u1.name as borrower_name, item.item_id, item.name as item_name, item.owner_id, u2.name as owner_name from conversation, item,users as u1,users as u2 where conversation.borrower_id = u1.rollno and item.owner_id = u2.rollno and conversation.item_id = item.item_id and (item.owner_id = $1 or conversation.borrower_id = $1)', [req.session.rollno])
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


// send new message

router.post('/new',function(req,res,next){
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.none('insert into post (thread_id,sender_id,text) values($1,$2,$3)',[req.body.thread_id,req.session.rollno,req.body.text])
		.then(function () {
         	res.status(200)
         	    .json({
         	       	status: true,
         	   		message: 'Message sent'
              	});		    
         	})
         	.catch(function (err) {
         		return next(err);
        });


});

module.exports = router;
