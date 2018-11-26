var express = require('express');
var router = express.Router();
var pgp = require('pg-promise');

var path = require('path');
var multer = require('multer');
var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./public/images/items");
    },
    filename: function(req, file, callback) {
        callback(null, Date.now()+"_"+file.originalname);
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
	

	req.db.one('select item.item_id, item.name as item_name, item.owner_id,item.description,item.available, users.name as owner_name from item,users where item.item_id = $1 and item.owner_id = users.rollno',[req.query.item_id])
		.then(function (item_data) {	
			req.db.any('select item_review.item_id, item_review.user_id, item_review.stars, item_review.title, item_review.content, users.name as reviewer_name from item_review,users where item_id = $1 and item_review.user_id = users.rollno',[req.query.item_id])
				.then(function (review) {
					res.status(200)
						.json({
							status:true,
							data:item_data,
							review:review,
							message : "Item Details Retrieved"
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
router.post('/add',function(req,res,next){
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}

	upload.array("item_image", 5)(req, res, function(err) {
		//console.log(req.files);
		//console.log(req.body);
		//console.log(err);
       	if (err) {
            res.status(200)
    			.json({
    				status: false,
    				message: 'unable to upload'
    			});
    		return;
        }
        req.db.none('insert into item (name,type,owner_id,description,available) values ($1,$2,$3,$4,$5)', [req.body.item_name, req.body.type, req.session.rollno, req.body.description, req.body.available])
        	.then(function() {
        		if (req.files != null && req.files.length > 0) {
        			req.db.one('select item_id from item where name=$1 and type=$2 and owner_id=$3 and description=$4 and available=$5 order by item_id desc limit 1;',[req.body.item_name,req.body.type,req.session.rollno, req.body.description, req.body.available])
						.then(function(data){
							var query = 'insert into photo values (' + data['item_id'] + ", '" + req.files[0].path.substring(6) + "')";
							for (var i = 1; i < req.files.length; i++) {
								query += ', (' + data['item_id'] + ", '" + req.files[i].path.substring(6) + "')";
							}
							console.log(query);
				         	req.db.none(query)
				         		.then(function () {
				         	        res.status(200)
				         	        	.json({
				         	        		status: true,
				         	        		message: 'item added successfully'
				         	        	});		    
				         	        })
				         	    .catch(function (err) {
				         			return next(err);
				         		});
						})
						.catch(function (err) {
		         			return next(err);
		         		});
        		} else {
        			res.status(200)
         	        	.json({
         	        		status: true,
         	        		message: 'item added successfully'
         	        	});		
        		}

        	})
        	.catch(function (err) {
				return next(err);
			});
    	}
	);

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


router.post('/review', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.none('insert into item_review values ($1, $2, $3, $4, $5)', [req.body.item_id, req.session.rollno, req.body.stars, req.body.title, req.body.content])
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




router.post('/updatestatus', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.none('update item set available=$1 where item_id=$2', [req.body.status, req.body.item_id])
		.then(function () {	
			res.status(200)
				.json({
					status: true,
					message: 'status updated'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});


router.get('/types', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.one('select enum_range(enum_first(null::item_type),null::item_type)')
		.then(function (data) {	
			res.status(200)
				.json({
					status: true,
					data: data,
					message: 'item types retrieved'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});


router.post('/addtype', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.db.none('alter type item_type add value $1', [req.body.type])
		.then(function () {	
			res.status(200)
				.json({
					status: true,
					message: 'added item type'
				});
		})
		.catch(function (err) {
			return next(err);
		});
});


module.exports = router;
