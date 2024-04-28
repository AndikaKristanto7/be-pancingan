const express = require('express')
const app = express()
require('dotenv').config()
const router = require('./router.js')
const port = process.env.STATUS === 'development' ? process.env.DEV_PORT : process.env.PROD_DEV

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require("path");

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


app.listen(port,() => {
    console.log(`Listening @ port ${port}`)
})