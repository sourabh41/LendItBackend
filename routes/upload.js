var express = require('express');
var router = express.Router();
var path = require('path');

// File Uploading
var multer = require('multer');

var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
    	
        callback(null, "./public/images/Items");
    },
    filename: function(req, file, callback) {
        callback(null,file.originalname+"_"+file.fieldname);
    }
});

var upload = multer({
    storage: Storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
});


router.post('/', function(req, res, next) {
	/*if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}*/

	
	// req.body.name is fieldname (name field in Form)

	upload.array(req.body.item_id,10)(req, res, function(err) {
		 //console.log(req.file);
         if (err) {
             return res.json({
				status: false,
				message: 'File Upload Failed'
			});
         }
         else{
         	req.db.none('insert into photo (item_id,photo) values ($1,$2)',[req.body.item_id,req.files[0].originalname])
         		.then(function () {
         	        res.status(200)
         	        	.json({
         	        		status: true,
         	        		message: 'Photos Uploaded Successfully'
         	        	});		    
         	        })
         	    .catch(function (err) {
         			return next(err);
         		});
         	
         }
     });
});

module.exports = router;