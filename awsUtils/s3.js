const path = require('path');
const fs = require('fs');
const {configObject} = require(path.join('..', 'credentials'));
const S3 = require('aws-sdk/clients/s3');
//const { S3Client, AbortMultipartUploadCommand } = require('@aws-sdk/client-s3');

const s3BucketName = 'im-homework';
const region = configObject.region;
const accessKeyId = configObject.credentials.accessKeyId;
const secretAccessKey = configObject.credentials.secretAccessKey;

 const s3 = new S3({
    region, accessKeyId, secretAccessKey
}); 

module.exports.uploadFile = async (filepath, storedFilename) => {
    const fileStream = fs.createReadStream(filepath);

    const uploadParams = {
        Bucket: s3BucketName,
        Body: fileStream,
        Key: storedFilename,
    }
    //console.log(region + ' ' + accessKeyId + ' ' + secretAccessKey);
    //console.log( filepath + '  ' + storedFilename);
    return s3.putObject(uploadParams).promise(); 
};

module.exports.readFile = async (filepath, storedFilename) => {
    const downloadParams = {
        Bucket: s3BucketName,
        Key: storedFilename,
    }
    const result = await s3.getObject( downloadParams ).promise(); 
    console.log(result);
    console.log(result.ContentLength);
    console.log(result.Body);
    fs.writeFile(filepath + '\\' + storedFilename, result.Body, (err)=>{console.log(err);});
};

module.exports.findFileBasedOnIdInS3Files = async (imageid) => {   //(filepath, storedFilename) {

    let objs = await s3.listObjectsV2({ Bucket: s3BucketName}).promise();
    for(el in objs.Contents) {
        let fullfilename = objs.Contents[el].Key;
        console.log(fullfilename + ' ' + imageid + ' ' + fullfilename.slice(0, -4) ) ;

        if(imageid === fullfilename.slice(0, -4)) {
          console.log('Found fullFilename');
          return fullfilename;
        }
       }
    console.log('Found nothing for imageid: ' + imageid);
    return ''  ; 

    /* s3.listObjectsV2({ Bucket: s3BucketName}).promise().then(objs => {
        for(el in objs.Contents) {
            let fullfilename = objs.Contents[el].Key;
            console.log(fullfilename + ' ' + imageid + ' ' + path.basename(fullfilename) ) ;

            if(imageid === path.basename(fullfilename)) {
              console.log('Found fullFilename');
              return fullfilename;
            }
           }
           console.log('Found nothing for imageid: ' + imageid);
        return ''   
     }).catch(err => {console.log('error on reading files'); throw new Error("Got file list reading error " + err)});
     
     return ''; //must return promise
     */ 
  }