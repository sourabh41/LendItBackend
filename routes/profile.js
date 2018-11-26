var express = require('express');
var router = express.Router();

// File Uploading
var path = require('path');
var multer = require('multer');
var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./public/images/dps");
    },
    filename: function(req, file, callback) {
        callback(null,file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({
    storage: Storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('only jpg/png images are allowed'))
        }
        callback(null, true)
    },
});

/* GET profile page. */
router.get('/', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.any('select * from users where users.rollno = $1', [req.session.rollno])
		.then(function (data) {	
			res.status(200)
				.json({
					status: true,
					data: data,
					message: 'retrieved profile of current user'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});


router.post('/create', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	upload.single(req.session.rollno)(req, res, function(err) {
         if (err) {
             return res.json({
				status: false,
				message: 'failed to upload dp'
			});
         } else{
         	req.db.none('insert into users values ($1, $2, $3, $4, $5);',[req.session.rollno, req.body.name, (req.file != null) ? req.file.path.substring(6) : "", req.body.address1, req.body.address2])
         		.then(function () {
         	        res.status(200)
         	        	.json({
         	        		status: true,
         	        		message: 'profile created successfully'
         	        	});		    
         	        })
         	    .catch(function (err) {
         			return next(err);
         		});
         	
         }
     });
});


router.post('/edit', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	upload.single(req.session.rollno)(req, res, function(err) {
         if (err) {
             return res.json({
				status: false,
				message: 'failed to upload dp'
			});
         } else {
         	var query;
         	var params;
         	if (req.file == null) {
         		query = 'update users set address1 = $1, address2 = $2 where rollno = $3';
         		params = [req.body.address1, req.body.address2, req.session.rollno];
         	} else {
         		query = 'update users set address1 = $1, address2 = $2, dp = $3 where rollno = $4';
         		params = [req.body.address1, req.body.address2, req.file.path.substring(6), req.session.rollno];
         	}
         	req.db.none(query, params)
         		.then(function () {
         	        res.status(200)
         	        	.json({
         	        		status: true,
         	        		message: 'profile created successfully'
         	        	});		    
         	        })
         	    .catch(function (err) {
         			return next(err);
         		});
         	
         }
     });
});


router.get('/reviews', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.one('select avg(user_review_stars) as stars, count(user_review_stars) as count from lending where borrower_id = $1', [req.session.rollno])
		.then(function (data) {	
			req.db.any('select user_review_stars,user_review_title,user_review_content,owner_id from lending natural join item where borrower_id = $1 and user_review_stars is not null', [req.session.rollno])
				.then(function (data1) {
					res.status(200)
						.json({
							status: true,
							data: {
								stars: data.stars,
								count: data.count,
								reviews: data1
							},
							message: 'retrieved reviews of current user'
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

module.exports = router;