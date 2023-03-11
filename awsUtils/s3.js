const path = require('path');
const fs = require('fs');
const util = require('util');
const S3 = require('aws-sdk/clients/s3');
const {configObject} = require(path.join(__dirname, 'credentials'));

const s3BucketName = 'im-homework';
const region = configObject.region;
const accessKeyId = configObject.credentials.accessKeyId;
const secretAccessKey = configObject.credentials.secretAccessKey;

 const s3 = new S3({
    region, accessKeyId, secretAccessKey
}); 

const asyncReadFile = util.promisify(fs.readFile);

module.exports.uploadFile = async (filepath, filename) => {
    const fileData = await asyncReadFile(filepath);

    const uploadParams = {
        Bucket: s3BucketName,
        Body: fileData,
        Key: filename,
    }
    return s3.putObject(uploadParams).promise(); 
};

module.exports.readFile = async (filepath, filename) => {
    const downloadParams = {
        Bucket: s3BucketName,
        Key: filename,
    }
    const result = await s3.getObject( downloadParams ).promise(); 
    console.log(result);
    console.log(result.ContentLength);
    console.log(result.Body);
    fs.writeFile(filepath, result.Body, (err)=>{console.log(err);});
};

module.exports.findFileBasedOnIdInS3Files = async (imageid) => {  

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
  }