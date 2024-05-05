const express = require('express'); 
const router = express.Router(); 
const { getEnv } = require('../helpers/getEnv');
const multer = require('multer');
const multerGoogleStorage = require('multer-google-storage');
const cloudinary = require('cloudinary').v2;

const upload = multer({
    storage:multerGoogleStorage.storageEngine({
        autoRetry: true,
        bucket: getEnv('GCP_STORAGE_BUCKET_NAME'),
        projectId: getEnv('GCP_PROJECT_ID'),
        keyFilename: `./${getEnv('GCP_KEY_FILENAME')}`,
        filename: (req,file,cb) => {
            cb(null,`uploads/${Date.now()}_${file.originalname}`)
        }
    })
})

cloudinary.config({
    cloud_name: getEnv('CLOUDINARY_CLOUD_NAME'),
    api_key: getEnv('CLOUDINARY_API_KEY'),
    api_secret: getEnv('CLOUDINARY_API_SECRET'),
});

async function uploadCloudinary(filePath) {
    let result;
    try {
        result = await cloudinary.uploader.upload(filePath, {use_filename: true});
        return result.url;
    } catch (err) {
        
        console.log(err)
        return null;
    }        
}
router.post('/upload', upload.single('file'), async (req, res) => {
    const url = await uploadCloudinary(`${getEnv('GCP_STORAGE_BASE_URL')}/${req.file.filename}`);
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
  
module.exports = router;