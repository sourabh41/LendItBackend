var express = require('express');
var LDAP = require('ldap-client');
var router = express.Router();

/* POST login request. */
router.get('/', function(req, res, next) {
	if (req.session.rollno == null) {
		res.status(200)
			.json({
				status: false,
				message: 'not logged in'
			});
		return;
	}
	req.session.rollno = null;
	res.status(200)
		.json({
			status: true,
			message: 'logged out successfully'
		});
});

module.exports = router;
