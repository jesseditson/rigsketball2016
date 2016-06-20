var express = require("express")
var express = require('express')
var router = module.exports = express.Router()
var secrets = require('../lib/secrets')
var aws = require('aws-sdk')
var uuid = require('node-uuid')
var path = require('path')

aws.config.update({
  accessKeyId: secrets.aws_id,
  secretAccessKey: secrets.aws_secret,
  region: 'us-west-2'
})

const S3_BUCKET = secrets.s3_bucket

router.get('/sign-s3', (req, res, next) => {
  const s3 = new aws.S3();
  var originalFile = req.query['file-name']
  const fileName = `${uuid.v4()}${path.extname(originalFile)}`;
  const fileType = req.query['file-type'];

  const s3Params = {
    Bucket: S3_BUCKET,
    Key: `uploads/${fileName}`,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if (err) return next(err)
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/uploads/${fileName}`
    };
    res.json(returnData);
  });
})
