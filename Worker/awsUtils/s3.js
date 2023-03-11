const path = require('path');
const fs = require('fs');
const util = require('util');
const {configObject} = require(path.join(__dirname, 'credentials'));
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

module.exports.uploadFile = async (filepath, filename) => {
    //const fileData = await asyncReadFile(filepath + '\\' + storedFilename );
    const fileData = await asyncReadFile( filepath );

    const uploadParams = {
        Bucket: s3BucketName,
        Body: fileData,
        Key: filename
    }
    //console.log( filepath + '  ' + filename);
    return await s3.putObject(uploadParams).promise(); 
};

module.exports.readFile = async (dirPath, filename) => {
    const downloadParams = {
        Bucket: s3BucketName,
        Key: filename,
    }
    const result = await s3.getObject( downloadParams ).promise(); 
    console.log(result);
    console.log(result.ContentLength);
    console.log(result.Body);
    //fs.writeFile(dirPath + '\\' + 'Resized_'  + filename, result.Body, (err)=>{console.log(err);});
    await fs.writeFile(dirPath + '\\' + filename, result.Body, (err)=>{console.log(err);});
};