var express = require('express');
var router = express.Router();


// Specific item by item_id
router.get('/', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.one('select * from item where item_id = $1', [req.query.item_id])
		.then(function (data) {	
			res.status(200)
				.json({
					status: true,
					data: data,
					message: 'retrieved requested item'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});


// For all items
router.get('/all', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.any('select * from item where item.owner_id != $1', [req.session.rollno])
		.then(function (data) {
			res.status(200)
				.json({
					status: true,
					data: data,
					message: 'retrieved all items except those added by current user'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});


// For items added by current user
router.get('/my', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.any('select * from item where item.owner_id = $1', [req.session.rollno])
		.then(function (data) {	
			res.status(200)
				.json({
					status: true,
					data: data,
					message: 'retrieved all items added by current user'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});



// To add a new item
router.post('/add', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.none('insert into item (name,type,owner_id,description,available) values ($1,$2,$3,$4,$5)', [req.body.name, req.body.type, req.session.rollno, req.body.description, req.body.available])
		.then(function () {
	        res.status(200)
	        	.json({
	        		status: true,
	        		message: 'item added'
	        	});		    
	        })
	    .catch(function (err) {
			return next(err);
		});
});


module.exports = router;
