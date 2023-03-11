const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Direction = {
    Up: 'Up',
    Down: 'Down',
    Left: 'Left',
    Right: 'Right'
  };

const ResizingJobSchema = new Schema({
  imageid: { type: String, required: true, unique: true },
  status: { 
      type: String, 
      required: true,
      enum: [
          'uploading',  //server still did not upload the file to s3
          'uploaded',   //the file is uploaded and SQS message is sent
          'resizing',   //SQS message is polled and resizing is ongoing
          'resized'] }, //resolved!
  //not necessary for now:   
  originalname: { type: String },
  s3url: { type: String } //,
  //extension: {type: String, enum ['jpg', 'png']}
});

// Export model
module.exports = mongoose.model("ResizingJob", ResizingJobSchema);
