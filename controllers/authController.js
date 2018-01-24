'use strict';

const bcrypt = require('bcryptjs');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const request = require('request-promise');

// todo fill in backup URL
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:6601/users';

exports.register = function (req, res) {
    var promise = bcrypt.genSalt(10);
    promise.then(function (salt) {
        return bcrypt.hash(req.body.password, salt);
    }, function (err) {
        return res.status(500).json({success: false, msg: 'Failed to create user', error: err});
    }).then(function (hash) {
        req.body.password = hash;
        return request.post(userServiceUrl + '/register', req.body);
    }, function (err) {
        return res.status(500).json({success: false, msg: 'Failed to create user', error: err});
    }).then(function (user) {
        return res.json({success: true, msg: 'User created', data: user});
    }, function (err) {
        return res.status(500).json({success: false, msg: 'Failed to create user', error: err});
    });
};

exports.authenticate = function (req, res) {
    const name = req.body.name;
    const password = req.body.password;
    var user;
    // getUserByName
    var promise = request.get(userServiceUrl + '/' + name);
    promise.then(function (usr) {
        if (!usr) {
            return res.status(404).json({success: false, msg: 'User not found'});
        }
        user = usr;
        return bcrypt.compare(password, usr.password);
    }, function (err) {
        return res.status(500).json({success: false, msg: 'Failed to get user', error: err});
    }).then(function (isMatch) {
        if (isMatch) {
            const token = jwt.sign({data: user}, config.secret, {
                expiresIn: 604800
            });
            return res.json({
                success: true,
                token: 'JWT ' + token,
                user: user
            });
        }
        else {
            return res.status(403).json({success: false, msg: 'Wrong password'});
        }
    }, function (err) {
        return res.status(500).json({success: false, msg: 'Failed to match passwords', error: err});
    });
};

