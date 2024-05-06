//app.js
const express = require('express')
const app = express()
require('dotenv').config()
const Env = require('./helpers/getEnv')
const {getEnv} = Env
const router = require('./routers/router')
const upload = require('./routers/upload')
const jwt = require('jsonwebtoken')
const secretKey = getEnv('SECRET');
const cors = require('cors')

function authenticateToken(req, res, next) {
    if (req.method === 'GET') {
        // If it's a GET request, skip token verification and move to the next middleware
        next();
        return;
    }else if (req.path === '/api/v1/login' || req.path === '/refresh-token') {
        next();
        return;
    }
    if (!req.headers.authorization) {
        return res.status(403).send({ error: 'No credentials sent!' });
    }
    let token = req.headers.authorization;
    token = token.split(" ")
    try {
        const decoded = jwt.verify(token[1], secretKey);  
        req.user = decoded;
        next(); 
    } catch(err) {
        console.log('JWT verification failed', err);
        res.send(err)
    }
  }

app.use(cors())
app.use(express.json())
app.post('/refresh-token',(req,res)=>{
    const token = jwt.sign({email:req.body.email}, secretKey, {expiresIn: 30 * 60 })
    return res.json({
        token
    }) 
})
app.use(authenticateToken)
app.use(express.urlencoded({ extended: true }));
app.use(router)
app.use("/",upload)

module.exports = app;