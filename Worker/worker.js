const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const util = require('util');
const axios = require('axios');
const s3Controller = require(path.join(__dirname, 's3'));
const sqsUtils = require(path.join(__dirname, 'sqsUtil'));
const serverUrl = '127.0.0.1:3123';

const asyncReadFile = util.promisify(fs.readFile);

async function resizeImage(imagePathOld, imagePathNew, resolution){
    console.log('Entered resize');
    const imagePath1 = imagePathOld;
    const imagePath2 = imagePathNew;
    let width = 0; 
    let height = 0;
    switch(resolution) {    
        case '1' :
            width = 100; height = 100;
            break;
        case '2' :
            width = 300; height = 300;
            break;
        case '3' :
            width = 500; height = 500;
            break;
        default:
            throw Error("Wrong resolution");
    }
    // let transform = sharp().resize({width: width, height: height}).on('info', function(fileInfo){
    //     console.log('Resizing done, file not saved yet');
    // });
    console.log('Reading file for resize' + imagePathOld);
    const fileData1 = await asyncReadFile(imagePath1);
    console.log('About to resize' + fileData1);
    await sharp(fileData1).resize(width, height).toFile(imagePath2);
/*     const fileStream = fs.createReadStream(imagePath1);
    const resizedFileStream = fs.createWriteStream(imagePath2, {flags: 'w'});
    return await fileStream.pipe(transform).pipe(resizedFileStream);
    fileStream */
}


async function processImagesIfAvailable() {
    try {
        let rxData = await sqsUtils.pollMessages(/*isFailedQueue*/ false);
        if(typeof rxData === 'undefined') {
            console.log('Iteration without images, continuing.');
            return;
        } 
        
        let rxDataJs = {};
        rxDataJs = JSON.parse(rxData); //no need for try-catch here, cause now we have it everywhere
        console.log('Received RxData are: '+ rxDataJs.imageUrl + ' ' + rxDataJs.resolution + ' ' + rxDataJs.imageId + ' ' + rxDataJs.processed );
        if(rxDataJs.processed == true) {
            console.log('Picked up already processed task somehow ' + rxDataJs);
            return;
        }             
        const imageNameBeforeResize = rxDataJs.imageUrl;
        const extension = path.extname(imageNameBeforeResize);
        //!War7  update server with info that file is 'resizing'
        
        try {

             const imageNameAfterResize = 'RESIZED' + imageNameBeforeResize;
             const filepath = path.join(__dirname, 'tempimages');
             console.log('About to read from S3 to resize');
             await  s3Controller.readFile( filepath, imageNameBeforeResize);
             //resize image
             console.log('About to call resizeImage');
             const resizingResult = await resizeImage( filepath + '\\' + imageNameBeforeResize, filepath + '\\' + imageNameAfterResize, rxDataJs.resolution);
     
             
             await s3Controller.uploadResizedFile(filepath, imageNameAfterResize, rxDataJs.imageId + extension);
             
             //the imageUrl needs some data sanitization: !War1
             //sending messages to active queue is processing is done, to failed queue if the processing failed
     
             const destinationUrl = 'http://' + serverUrl + '/api/images/' + rxDataJs.imageId;
             const processedImageJson = {imageUrl:  imageNameAfterResize, resolution: rxDataJs.resolution, processed: true};
             console.log('Resized file uploaded ' + JSON.stringify(processedImageJson) + ' from local dest: ' + destinationUrl );
             await axios.put(destinationUrl, processedImageJson);
        } catch (err) {
            console.log('File handling and resizing error' + err);
             await s3Controller.uploadResizedFile(path.join(__dirname, 'uploaderror.png'), '', rxDataJs.imageId + extension); 
        }
    } catch (err) {
        console.log(err);

    }
}

setInterval(processImagesIfAvailable, 9000);