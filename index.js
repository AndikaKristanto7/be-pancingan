const express = require('express')
const app = express()
require('dotenv').config()
const Env = require('./helpers/Env')
const newEnv = new Env()
const router = require('./router.js')


const jwt = require('jsonwebtoken')

const secretKey = newEnv.getEnv('SECRET') ?? 'secret';

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require("path");
const cors = require('cors')

// const storage = multer({ dest: 'uploads/' })

const upload = multer({ dest: 'uploads/' })

cloudinary.config({
    cloud_name: 'dhjpdj4ru',
    api_key: '569671138772217',
    api_secret: 'aEuMEJ-wWMHr_isys4a4ldcVPvw',
});

async function uploadCloudinary(filePath) {
    let result;
    try {
        result = await cloudinary.uploader.upload(filePath, {use_filename: true});
        fs.unlinkSync(filePath);
        return result.url;
    } catch (err) {
        fs.unlinkSync(filePath);
        return null;
    }        
}

function authenticateToken(req, res, next) {
    if (req.method === 'GET') {
        // If it's a GET request, skip token verification and move to the next middleware
        next();
        return;
    }else if (req.path === '/api/v1/login') {
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


app.use(function (req, res, next) {

    
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', newEnv.getEnv('FE_URL') ?? 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(cors())
app.use(express.json())
app.post('/test-env',(req,res)=>{
    let key = req.body.key
    res.send(newEnv.getEnv(key))
})
app.use(authenticateToken)
app.use(express.urlencoded({ extended: true }));
//API Upload Pictures
    //Upload Picture
    app.post('/picture', upload.single('file'), async (req, res) => {
        const url = await uploadCloudinary(req.file.path);

        if (url) {
            return res.json({
                message: 'Upload success',
                url: url,
            });
        } else {
            return res.json({
                message: 'Upload failed'
            });
        }
    });
app.use(router)
// Add headers before the routes are defined

const port = newEnv.getEnv("APP_PORT") ?? "8080"
app.listen(port,() => {

    console.log(`Listening @ port ${port}`)
})