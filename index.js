const express = require('express');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const mongoDB = "mongodb://127.0.0.1/insidemaps";

const app = express();
const port = 3123;

/* const uploadImageRouter = require(path.join(__dirname, 'routes', 'uploadImage')); //is this ok like this ?Que1
const statusRouter = require(path.join(__dirname, 'routes', 'status')); */
const pagesRouter = require(path.join(__dirname, 'routes', 'pages'));
const apiRouter = require(path.join(__dirname, 'routes', 'api'));

/* const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'tempimages'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});
const upload = multer({storage: fileStorage});
const multipleUpload = upload.fields([{name: 'uploadimage', maxCount: 5}]); //multiple file selects in same uploadimage input of type multipart/form-data
 */

app.use((req, res, next)=>{  //using REST, so just in case we have different ports and such...
    res.setHeader('Access-Control-Allow-Origin', '*, 127.0.0.1:3123');  //not expecting attacks on image uploading website
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-API-KEY, X-Requested-With, Accept, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    //res.setHeader('HTTP/1.1 200 OK')
    next();
}); 
app.use(express.json());

//app.use(multer({dest: path.join(__dirname, 'tempimages')}).single('uploadimage')); //works!
//app.use(multer({storage: fileStorage}).single('uploadimage'));  //works also

/*
//app.post('/', multipleUpload, uploadImageRouter);
app.use('/', uploadImageRouter);
app.use('/status', statusRouter);
app.use('/about', aboutRouter); */

/* 
app.post('/api', multipleUpload, apiRouter); */
app.use('/api', apiRouter);
app.use('/', pagesRouter);
app.use(express.static(path.join(__dirname, 'frontend')));

//mongoose.connect(mongoDB);
mongoose.connect(mongoDB)
.then(result => {
    app.listen(port, () =>{
        console.log('Server connected on port ' + port);
    });
  })
  .catch(err => {
    console.log(err);
  });

