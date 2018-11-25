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
	req.db.any('select item.item_id, item.name as item_name, owner_id, description, available,title,content,temp.name as reviewer_name,stars from item left join (select * from item_review, users where user_id=users.rollno) as temp on item.item_id = temp.item_id where item.item_id = $1', [req.query.item_id])
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
	req.db.any('with temp as (select item_id, avg(stars) as stars, count(stars) as count from item_review group by item_id), temp2 as (select item.item_id, item.name, item.type, item.owner_id, item.available, temp.stars, temp.count from item left outer join temp on item.item_id=temp.item_id) select temp2.item_id, temp2.name as item_name, temp2.type, temp2.available, temp2.stars, temp2.count, users.name, min(photo.photo) as photo from temp2 left outer join photo on photo.item_id=temp2.item_id, users where users.rollno = temp2.owner_id and temp2.owner_id != $1 group by temp2.item_id,item_name,type,available,stars,count,users.name;', [req.session.rollno])
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
	req.db.any('with temp as (select item_id, avg(stars) as stars, count(stars) as count from item_review group by item_id), temp2 as (select item.item_id, item.name, item.type, item.owner_id, item.available, temp.stars, temp.count from item left outer join temp on item.item_id=temp.item_id) select temp2.item_id, temp2.name as item_name, temp2.type, temp2.available, temp2.stars, temp2.count, users.name, min(photo.photo) as photo from temp2 left outer join photo on photo.item_id=temp2.item_id, users where users.rollno = temp2.owner_id and temp2.owner_id = $1 group by temp2.item_id,item_name,type,available,stars,count,users.name;', [req.session.rollno])
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

router.get('/images', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.any('select photo from photo where item_id = $1', [req.query.item_id])
		.then(function (data) {	
			res.status(200)
				.json({
					status: true,
					data: data,
					message: 'retrieved photos of given item'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});


module.exports = router;
