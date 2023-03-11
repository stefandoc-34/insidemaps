const path = require('path');
const fs = require('fs');
const util = require('util');
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

const asyncReadFile = util.promisify(fs.readFile);

module.exports.uploadResizedFile = async (filepath, storedFilename, imageId) => {
    const fileData = await asyncReadFile(filepath + '\\' + storedFilename );

    const uploadParams = {
        Bucket: s3BucketName,
        Body: fileData,
        //Key: storedFilename,
        Key: imageId
    }
    //console.log(region + ' ' + accessKeyId + ' ' + secretAccessKey);
    //console.log( filepath + '  ' + storedFilename);
    return await s3.putObject(uploadParams).promise(); 
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
    //fs.writeFile(filepath + '\\' + 'Resized_'  + storedFilename, result.Body, (err)=>{console.log(err);});
    await fs.writeFile(filepath + '\\' + storedFilename, result.Body, (err)=>{console.log(err);});
};