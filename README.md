# imageProcessing
Image processing web app

This Web app will serve to fetch processed images and serve them to the client.

Setup:
1 - install node and npm
2 - in the main folder (which is the server folder) install needed npm modules:
npm install express,  
(in the given order aws modules: )   
npm install aws-sdk,  
npm install @aws-sdk/client-sqs.
3 - in the Worker folder (which is made to be able to be used independently of the server):
npm install express,  
npm install sharp,  
npm install axios,
(in the given order aws modules: )   
npm install aws-sdk,  
npm install @aws-sdk/client-sqs


For the infrastructure: AWS S3 and SQS are used, local MongoDB database and a local server on randomly chosen port 3123. For AWS credentials.js files need to be changed (in both root and Worker folders) and add correct key and secret key, that must correspond with the region. 
For debugging purposes both Worker and server were run using Visual Studio Code. 

