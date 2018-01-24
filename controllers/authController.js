'use strict';

const bcrypt = require('bcryptjs');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const request = require('request-promise');

// todo fill in backup URL
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:6601/users';

exports.registerUser = function (req, res) {
    var promise = bcrypt.genSalt(10);
    promise.then(function (salt) {
        return bcrypt.hash(req.body.password, salt);
    }, function (err) {
        return res.status(500).json({success: false, msg: 'Failed to create user', error: err});
    }).then(function (hash) {
        req.body.password = hash;
        return requestAddUser(req.body);
    }, function (err) {
        return res.status(500).json({success: false, msg: 'Failed to create user', error: err});
    }).then(function (user) {
        return res.json({success: true, msg: 'User created', data: user});
    }, function (err) {
        return res.status(500).json({success: false, msg: 'Failed to create user', error: err});
    });
};

exports.authenticateUser = function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    var user;

    var promise = requestGetUserByEmail(email);
    promise.then(function (usr) {
        if (!usr) {
            return res.status(404).json({success: false, msg: 'User not found'});
        }
        user = JSON.parse(usr).data;
        return bcrypt.compare(password, user.password);
    }, function (err) {
        res.status(500).json({success: false, msg: 'Failed to get user', error: err});
    }).then(function (isMatch) {
        if (isMatch) {
            const token = jwt.sign({data: user}, config.secret, {
                expiresIn: 604800
            });
            res.json({
                success: true,
                token: 'JWT ' + token,
                user: user
            });
        }
        else {
            res.status(403).json({success: false, msg: 'Wrong password'});
        }
    }, function (err) {
        res.status(500).json({success: false, msg: 'Failed to match passwords', error: err});
    });
};

exports.updateUser = function (req, res) {
    var promise;
    if (req.body.password) {
        promise = bcrypt.genSalt(10);
        promise.then(function (salt) {
            return bcrypt.hash(req.body.password, salt);
        }, function (err) {
            return res.status(500).json({success: false, msg: 'Failed to update user (salt)', error: err});
        }).then(function (hash) {
            req.body.password = hash;
            return requestUpdateUser(req.params.id, req.body);
        }, function (err) {
            return res.status(500).json({success: false, msg: 'Failed to update user (updateWsalt)', error: err});
        }).then(function () {
            return res.json({success: true, msg: 'User updated'});
        }, function (err) {
            return res.status(500).json({success: false, msg: 'Failed to update user (pass)', error: err});
        });
    } else {
        promise = requestUpdateUser(req.params.id, req.body);
        promise.then(function () {
            return res.json({success: true, msg: 'User updated'});
        }, function (err) {
            return res.status(500).json({success: false, msg: 'Failed to update user (Npass)', error: err});
        });
    }
};

exports.getProfile = function (req, res) {
    return (req.user) ? res.json({user: req.user.data}) : res.json({});
};

const requestAddUser = function (body) {
    const options = {
        url: userServiceUrl,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
    return request.post(options);
};

const requestGetUserByEmail = function(email){
    const options = {
        url: userServiceUrl +  '/withpassword/' + email
    };
    return request(options);
};

const requestUpdateUser = function(id, body){
    const options = {
        url: userServiceUrl + '/' + id,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
    return request.put(options);
};