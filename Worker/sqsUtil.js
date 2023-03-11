const {SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand} = require('@aws-sdk/client-sqs');
const {configObject} = require('./credentials');

const sqsClient = new SQSClient(configObject);
const queueUrl = 'https://sqs.us-east-1.amazonaws.com/799513362811/im-homework';
const queueUrlFailed = 'https://sqs.us-east-1.amazonaws.com/799513362811/im-homework-failed'

module.exports.sendMessageToQueue = async (isFailedQueue, data)=>{
	try {
		const command = new SendMessageCommand({
			MessageBody: data,
			QueueUrl: isFailedQueue ? queueUrlFailed : queueUrl ,
			MessageAttributes: {  //for some reason I cannot see this on the receiving end  ?Que4
				OrderId: {DataType: 'String', StringValue: '4421x'},
			}
		});
		const result = await sqsClient.send(command);
		console.log(result);
	} catch (error) {
		console.log(error);
	}
};

deleteMessageFromQueue = async (givenQueueUrl, ReceiptHandle, MessageId)=>{
	try{
		const data = await sqsClient.send(
			new DeleteMessageCommand({
				QueueUrl: givenQueueUrl ,
				ReceiptHandle: ReceiptHandle
				}) 
		);
		console.log('Message deleted with Id ' + MessageId + ', and handle ' + ReceiptHandle);
	} catch(error) {
		console.log(error);
	}

};


module.exports.pollMessages = async (isFailedQueue)=>{
	try{
		const givenQueueUrl = isFailedQueue ? queueUrlFailed : queueUrl;
		console.log("Polled message from queue: " + givenQueueUrl);
		const command = new ReceiveMessageCommand({
			MaxNumberOfMessages: 10,
			QueueUrl: givenQueueUrl,
			WaitTimeSeconds: 5,
			MessageAttributes: ['All'],  //inspect this if enough time ?Que4
			VisibilityTimeout: 10
		});
		const result = await sqsClient.send(command);
		console.log(result.Messages);
		if(typeof result === 'undefined' || typeof result.Messages === 'undefined') {
			console.log('No messages available, skip rest of processing.');
			return;
		}
		//processing here...
		const rxData = result.Messages[0].Body;
		console.log('RxData: ' + rxData);
		const deleteResult = await deleteMessageFromQueue(
			givenQueueUrl,
			result.Messages[0].ReceiptHandle,
			result.Messages[0].MessageId
			);
		console.log('Delete result after delete is: ' + deleteResult);
		return rxData;
	} catch (error) {
		console.log(error);
		return;
	}
};
//pollMessages();
//sendMessageToQueue("{imageUrl: 'imageUrl', resolution: 2, imageId: 'imageId', processed: false}");

//setInterval(pollMessages, 9000);

