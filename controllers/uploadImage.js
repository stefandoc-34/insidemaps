const path = require('path');
const ResizingJob = require(path.join(__dirname, '..', 'models', 'resizingJob'));
const s3Controller = require(path.join(__dirname, '..', 'awsUtils', 's3'));
const sqsUtils = require(path.join(__dirname, '..', 'awsUtils', 'sqsUtil'));
const s3BucketName = 'im-homework';
const s3UrlBeginningPath = 'https://im-homework.s3.amazonaws.com/';
module.exports.getResizedImage = (req, res, next) => {
    console.log('Main get received.');
    ResizingJob.findOne({imageid: req.params.imageid})
    .then(resizingImage => {
        if(resizingImage) {
            console.log(resizingImage);
            s3Controller.findFileBasedOnIdInS3Files(req.params.imageid)  //we might not need this if we have DB
            .then( filename => {
                if(!filename) {
                    res.status(404).json({message: 'file not found'});
                }
                res.status(200).json({url: s3UrlBeginningPath + filename });
            }).catch(err=>{console.log(err); res.status(500).json({message: 'error happened'});});
        } else {
            res.status(404).json({message: 'sorry, file is not found'});
        }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({message: 'error happened'});
    });
    
};

module.exports.postUpload = (req, res, next) => {
    //expecting possible multiple files here processed by multer in index.js
    //res.sendFile(path.join(__dirname, '..', 'frontend', 'build','index.html'));
/*     if(req.files) {
        const imageid = req.body.imageid;
        const resolution = req.body.resolution;
        console.log('Files successfully uploaded');
        console.log(req.files);
        //const filename = req.files.uploadimage[0].originalname;
        const filename = req.files.uploadimage[0].filename; //full new filename
        let filepath = req.files.uploadimage[0].path;
        filepath = filepath.replaceAll('\\', '\\\\');
        console.log(filepath);
    }


    res.status(200).json({b:'b'}); */
   
    if(req.files) {
        const imageid = req.body.imageid;
        const resolution = req.body.resolution;
        if(!imageid)  {
            res.status(422).json({message: 'error in uploading files to server'});
        }
        console.log(req.files);
        //const filename = req.files.uploadimage[0].originalname;
        const filename = req.files.uploadimage[0].filename; //full new filename
        console.log('upload ext: ' + path.extname(filename));
        if(path.extname(filename) != '.jpg' && path.extname(filename) != '.png' ) {            
           return res.status(422).json({message: 'file with wrong extension uploaded, only jpg and png allowed'});
        }
        
        let filepath = req.files.uploadimage[0].path;
        filepath = filepath.replaceAll('\\', '\\\\');
        console.log('Filename is: ' + filename + ' filepath: ' + filepath);
        const resizingJob = new ResizingJob({
            imageid: req.body.imageid,
            status: 'uploading',
            originalname: filename,
            //extension: path.extname(filename)
          });
        resizingJob.save();
        console.log('Files info successfully uploaded to DB');
         s3Controller.uploadFile(filepath, filename)
         .then(result => {
            console.log('Upload result ' + result);
            console.log('Uploaded file to S3 with name: '+ filename + ' and path: ' +  filepath);
            //the data should be extracted as a global file maybe  !War2
            const imagedata =  `{"imageName": "${filename}", "resolution": "${resolution}", "imageId": "${imageid}", "processed": "false"}`;
            sqsUtils.sendMessageToQueue(false, imagedata);
            ResizingJob.findOneAndUpdate({imageid: imageid}, {status: 'uploaded'})
            .then(()=>{
                res.status(200).json({message: 'submitted'});
            })
            .catch(err=>{
                console.log(err); 
                res.status(500).json({message: err + 'some error happened'});
            });
            //res.send("File uploaded on S3!");
        })
        .catch(err=> {
            console.log(err);
            res.status(500).json({message: err + 'some error happened'});
            //res.send('Some error happened, file could not be uploaded');
        }); 
        
    } else {
        //res.send("Files upload error, file cannot be found");
        res.status(422).json({message: 'error - no files received'});
    }
    //res.sendFile(path.join(__dirname, '..', 'frontend', 'build','index.html'));
 /**/
}; 

module.exports.putResizedImage = (req, res, next) => {
    //more checks needed here (what if someone uses put that is not a Worker?)!   //!War5
    console.log(req.params.imageid);
    //expecting not the message: {"imageName": "imageNameValue", "resolution": "3", "imageId": "imageIdValue", "processed": "false"}
    //but: {"imageName": "imageName", "resolution": "1", "processed": "false"}
    console.log("Put arrived " + req.body.imageName);
    console.log(req.body.processed);
    const imageId = req.params.imageid;
    const imageName = req.body.imageName;
    const resolution = req.body.resolution;
    const processed = req.body.processed;
    if(processed !== true) { 
        console.log('Some error happened, with the communication.'); 
        //throw new Error('Problem in comm.');
        return;
    }
    //s3Controller.readFile( path.join(__dirname, '..', 'tempimages'), imageName);
    s3Controller.findFileBasedOnIdInS3Files(req.params.imageid)
    .then( filename => {
        if(!filename) {
            res.status(200).json({message: 'file not found'});
        }
        const filepath = path.join(__dirname, '..', 'tempimages', filename); // + '\\' + filename
        console.log('Stored filepath is ' + filepath);
        s3Controller.readFile(filepath, filename) //this is to store the file on the server, but should be removed !War4
        .then(()=> { 
            ResizingJob.findOneAndUpdate({imageid: req.params.imageid}, {status: 'resized'})
            .then(()=>{
                console.log('Got resized image from S3 '+ filename);
                res.status(200).json({message: 'submitted'});
            })
            .catch(err=>{
                console.log(err);         
                res.status(500).json({message: err + 'some error happened'
            });
        });  
        }).catch(err=>{
            console.log(err); 
            res.status(200).json({message: 'error on saving'});
        });
    }).catch(err=>{
        console.log(err); 
        res.status(500).json({message: 'error happened'});
    });
    
    //res.sendFile(path.join(__dirname, '..', 'frontend', 'build','index.html'));
    
}; 

/* async function findFileBasedOnIdInS3Files (imageid){   //(filepath, storedFilename) {
    const uploadParams = {
      Bucket: s3BucketName,
     }
     const objs = await s3.listObjectsV2({ Bucket: s3BucketName}).promise();
     for(el in objs.Contents) {
      console.log(objs.Contents[el].Key);
      if(imageid === path.basename(objs.Contents[el].Key)) {
        return imageid + path.extname(imageName);
      }
     }
     
     console.log(objs);
     return '';
     
  } */
  