const path = require('path');
const ResizingJob = require(path.join(__dirname, '..', 'models', 'resizingJob'));
const s3Controller = require(path.join(__dirname, '..', 'awsUtils', 's3'));

module.exports.getStatus = (req, res, next) => {
    const imageId = req.params.imageid;
    ResizingJob.findOne({imageid: imageId})
    .then(resizingImage => {
        if(resizingImage) {
            console.log(resizingImage);
            res.status(200).json({imageid: imageId, status: resizingImage.status});
        } else {
            res.status(404).json({message: 'sorry, file is not found'});
        }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({message: 'error happened'});
    });
};

module.exports.updateStatus  = (req, res, next) => {
    res.status(200).json({message: 'Update status - still working'});
};

/* 
module.exports.getStatus = (req, res, next) => {
    //res.send("Status page still not ready");
    //res.status(200).json({message: 'Still working'});
    //res.sendFile(path.join(__dirname, '..', 'frontend', 'build','index.html'));
};


module.exports.putResizedImage = (req, res, next) => {
    console.log(req.params.imageid);
    //expecting not the message: {"imageUrl": "imageUrlValue", "resolution": "3", "imageId": "imageIdValue", "processed": "false"}
    //but: {"imageUrl": "imageUrl", "resolution": "1", "processed": "false"}
    console.log(req.body.imageUrl);
    console.log(req.body.processed);
    const imageId = req.params.imageid;
    const imageUrl = req.body.imageUrl;
    const resolution = req.body.resolution;
    const processed = req.body.processed;
    if(processed !== true) { 
        console.log('Some error happened, with the communication.'); 
        //throw new Error('Problem in comm.');
        return;
    }

    s3Controller.readFile( path.join(__dirname, '..', 'tempimages'), imageUrl);

    //res.sendFile(path.join(__dirname, '..', 'frontend', 'build','index.html'));
    
}; */