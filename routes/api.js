const express = require('express');
const path = require('path');
const router = express.Router();
const multer = require('multer');
const uploadController = require(path.join(__dirname, '..', 'controllers', 'uploadImage'));
const statusController = require(path.join(__dirname, '..', 'controllers', 'status'));

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'tempimages'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});
const upload = multer({storage: fileStorage});
const multipleUpload = upload.fields([{name: 'uploadimage', maxCount: 5}]); //multiple file selects in same uploadimage input of type multipart/form-data


//starting with api route: '/api'
router.post('/images', multipleUpload, uploadController.postUpload);
router.get('/images/:imageid', uploadController.getResizedImage);
router.put('/images/:imageid', uploadController.putResizedImage);

router.post('/status', statusController.updateStatus);
router.get('/status', statusController.getStatus);

module.exports = router;