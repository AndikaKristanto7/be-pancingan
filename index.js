const express = require('express')
const app = express()
require('dotenv').config()
const router = require('./router.js')
const port = process.env.STATUS === 'development' ? process.env.DEV_PORT : process.env.PROD_DEV
const jwt = require('jsonwebtoken')

const secretKey = process.env.SECRET;
function authenticateToken(req, res, next) {
    if (req.method === 'GET') {
        // If it's a GET request, skip token verification and move to the next middleware
        next();
        return;
    }else if (req.path === '/api/v1/login') {
        next();
        return;
    }
    
    const token = req.headers.token;
    try {
        const decoded = jwt.verify(token, secretKey);  
        req.user = decoded;
        console.log(token)
        next(); 
    } catch(err) {
        console.log('JWT verification failed', err);
        res.send(err)
    }
  }
app.use(function (req, res, next) {

    
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', process.env.FE_URL);

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(express.json())
app.use(authenticateToken)
app.use(router)
// Add headers before the routes are defined


app.listen(port,() => {
    console.log(`Listening @ port ${port}`)
})