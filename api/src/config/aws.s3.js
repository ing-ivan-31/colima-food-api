const aws = require('aws-sdk');

const s3 = new aws.S3(
    {
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            bucket: process.env.S3_BUCKET,
        }
    }
);

module.exports = s3;
