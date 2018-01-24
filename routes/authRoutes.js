'use strict';

module.exports = function (app) {
    var AuthController = require('../controllers/authController');

    app.route('/auth/register')
        .post(AuthController.register);

    app.route('/auth/authenticate')
        .post(AuthController.authenticate);
};