'use strict';

module.exports = function (app) {
    var AuthController = require('../controllers/authController');

    app.route('/auth/profile')
        .get(AuthController.getProfile);

    app.route('/auth/register')
        .post(AuthController.registerUser);

    app.route('/auth/login')
        .post(AuthController.authenticateUser);

    app.route('/auth/update/:id')
        .put(AuthController.updateUser);
};