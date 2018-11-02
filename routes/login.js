var express = require('express');
var LDAP = require('ldap-client');
var router = express.Router();

/* POST login request. */
router.post('/', function(req, res, next) {
	var username = req.body.username;
	var password = req.body.password;

	var ldap = new LDAP({
		uri: 'ldap://ldap.iitb.ac.in',
	}, function(err) {
		if (err) next(err);
	});

	fb_options = {
		base: 'dc=iitb,dc=ac,dc=in',
		filter: '(uid=' + username + ')',
		password: password
	};

	ldap.findandbind(fb_options, function(err, data) {
		ldap.close();
		if (err) next(err);
		else {
			req.session.rollno = data['employeeNumber'][0];
			res.status(200).json({
				status: true,
				data: {
					username: username,
					rollno: data['employeeNumber'][0],
					name: data['givenName'][0] + ' ' + data['sn'][0]
				},
				message: 'logged in'
			});
		}
	});
});

module.exports = router;
