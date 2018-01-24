const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config/config');
const app = express();
var router = express.Router();
const authRoutes = require('./routes/authRoutes');
const jsonwebtoken = require("jsonwebtoken");
const cors = require('cors');

//Port number
const port = process.env.PORT || 6600;

app.use(function (req, res, next) {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        jsonwebtoken.verify(req.headers.authorization.split(' ')[1], config.secret, function (err, decode) {
            if (err) req.user = undefined;
            req.user = decode;
            next();
        });
    } else {
        req.user = undefined;
        next();
    }
});

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
authRoutes(app);

//start server
app.listen(port, function () {
    console.log('Server started on port ' + port);
});



