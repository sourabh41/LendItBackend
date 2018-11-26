var express = require('express');
var router = express.Router();

// borrowings (asked by current user)
router.get('/borrowings', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.any('select item.name as item_name, lending.item_id, lending.borrower_id, lending.request_timestamp, lending.status, users.name as owner_name from lending, item, users where lending.item_id = item.item_id and item.owner_id = users.rollno and lending.borrower_id = $1 order by request_timestamp desc', [req.session.rollno])
		.then(function (data) {	
			res.status(200)
				.json({
					status: true,
					data: data,
					message: 'retrieved all borrowings of current user'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});

router.get('/borrowing', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.one('select item.name as item_name, photo.photo as photo, lending.item_id, lending.borrower_id, lending.request_timestamp, lending.start_timestamp, lending.end_timestamp, lending.status, lending.user_review_stars, lending.user_review_title, lending.user_review_content, users.name as owner_name, users.rollno as owner_id from lending, item left outer join photo on item.item_id = photo.item_id, users where lending.item_id = item.item_id and item.owner_id = users.rollno and lending.item_id = $1 and lending.borrower_id = $2 and abs(lending.request_timestamp - $3) < 0.1 limit 1', [req.query.item_id, req.query.borrower_id, req.query.request_timestamp])
		.then(function (data) {
			req.db.any('select * from item_review where item_id=$1 and user_id=$2', [data.item_id, req.session.rollno])
				.then(function (data1) {
					if (data1.length == 0)
						data['reviewed'] = false;
					else
						data['reviewed'] = true;
					res.status(200)
						.json({
							status: true,
							data: data,
							message: 'retrieved requested borrowing'
						});
				})
				.catch(function (err) {
					return next(err);
				});
		})
		.catch(function (err) {
			return next(err);
		});
});

// lendings (asked to current user)
router.get('/lendings', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.any('select item.name as item_name, lending.item_id, lending.borrower_id, lending.request_timestamp, lending.status, users.name as borrower_name from lending, item, users where lending.item_id = item.item_id and lending.borrower_id = users.rollno and item.owner_id = $1 order by request_timestamp desc', [req.session.rollno])
		.then(function (data) {	
			res.status(200)
				.json({
					status: true,
					data: data,
					message: 'retrieved all lendings for current user'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});

router.get('/lending', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.one('select item.name as item_name, photo.photo as photo, lending.item_id, lending.borrower_id, lending.request_timestamp, lending.start_timestamp, lending.end_timestamp, lending.status, lending.user_review_stars, lending.user_review_title, lending.user_review_content, users.name as borrower_name from lending, item left outer join photo on item.item_id = photo.item_id, users where lending.item_id = item.item_id and users.rollno = lending.borrower_id and lending.item_id = $1 and lending.borrower_id = $2 and abs(lending.request_timestamp - $3) < 0.1 limit 1', [req.query.item_id, req.query.borrower_id, req.query.request_timestamp])
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

router.post('/update', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	var query;
	if (req.body.status == 'LENDED') {
		query = 'update lending set status=$1, start_timestamp=extract(epoch from now()) where item_id = $2 and borrower_id = $3 and abs(request_timestamp - $4) < 0.1';
	} else if (req.body.status == 'RETURNED') {
		query = 'update lending set status=$1, end_timestamp=extract(epoch from now()) where item_id = $2 and borrower_id = $3 and abs(request_timestamp - $4) < 0.1';
	} else {
		query = 'update lending set status=$1 where item_id = $2 and borrower_id = $3 and abs(request_timestamp - $4) < 0.1';
	}
	req.db.none(query, [req.body.status, req.body.item_id, req.body.borrower_id, req.body.request_timestamp])
		.then(function () {	
			res.status(200)
				.json({
					status: true,
					message: 'lending updated'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});

router.post('/add', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}

	req.db.one('select count(*) as num_items from item where owner_id=$1',[req.session.rollno])
	.then(function(data){
		if(data['num_items']>=2){
			req.db.one('select count(*) as count from lending where item_id=$1 and borrower_id=$2 and (status = $3 or status = $4 or status = $5)',[req.body.item_id,req.session.rollno,'PENDING', 'APPROVED','LENDED'])
			.then(function(data1){
				if(data1['count'] > 0){
					res.status(200)
						.json({
							status: false,
							message: 'Request already in progress'
						});
				}
				else{
					req.db.none('insert into lending (item_id, borrower_id) values ($1, $2)', [req.body.item_id, req.session.rollno])
						.then(function () {	
							res.status(200)
								.json({
									status: true,
									message: 'lending created'
								});
						})
						.catch(function (err) {
							return next(err);
						});
				}
			})
			.catch(function (err) {
				return next(err);
			});

			
		}
		else{
			res.status(200)
				.json({
					status: false,
					message: 'List atleast 2 items to start borrowing'
				});
		}
	})
	.catch(function (err) {
		return next(err);
	});
	
});

router.post('/review', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.none('update lending set user_review_stars=$1, user_review_title=$2, user_review_content=$3 where item_id = $4 and borrower_id = $5 and abs(request_timestamp - $6) < 0.1', [req.body.stars, req.body.title, req.body.content,  req.body.item_id, req.body.borrower_id, req.body.request_timestamp])
		.then(function () {	
			res.status(200)
				.json({
					status: true,
					message: 'review added'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});

module.exports = router;
