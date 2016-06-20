var express = require("express")
var CryptoJS = require("crypto-js")
var express = require('express')
var router = module.exports = express.Router()
var secrets = require('../lib/secrets')
var aws = require('aws-sdk')

aws.config.update({
  accessKeyId: secrets.aws_id,
  secretAccessKey: secrets.aws_secret,
  region: 'us-west-2'
})

const S3_BUCKET = secrets.s3_bucket
const clientSecretKey = secrets.aws_secret
const expectedBucket = S3_BUCKET
const expectedHostname = `${S3_BUCKET}.s3.amazonaws.com`

router.get('/sign-s3', (req, res, next) => {
  signRequest(req, res, next)
})

router.get('/get-s3-signed-request', (req, res, next) => {
  const s3 = new aws.S3();
  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];

  const s3Params = {
    Bucket: S3_BUCKET,
    Key: `uploads/${fileName}`,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read',

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

function signRequest(req, res, next) {
  if (req.body.headers) {
    signRestRequest(req, res, next);
  } else {
    signPolicy(req, res, next);
  }
}

// Signs multipart (chunked) requests.  Omit if you don't want to support chunking.
function signRestRequest(req, res, next) {
  var version = req.query.v4 ? 4 : 2,
    stringToSign = req.body.headers,
    signature = version === 4 ? signV4RestRequest(stringToSign) : signV2RestRequest(stringToSign);

  var jsonResponse = {
    signature: signature
  };

  res.setHeader("Content-Type", "application/json");

  if (isValidRestRequest(stringToSign, version)) {
    res.end(JSON.stringify(jsonResponse));
  } else {
    res.status(400);
    res.end(JSON.stringify({
      invalid: true
    }));
  }
}

function signV2RestRequest(headersStr) {
  return getV2SignatureKey(clientSecretKey, headersStr);
}

function signV4RestRequest(headersStr) {
  var matches = /.+\n.+\n(\d+)\/(.+)\/s3\/aws4_request\n([\s\S]+)/.exec(headersStr),
    hashedCanonicalRequest = CryptoJS.SHA256(matches[3]),
    stringToSign = headersStr.replace(/(.+s3\/aws4_request\n)[\s\S]+/, '$1' + hashedCanonicalRequest);

  return getV4SignatureKey(clientSecretKey, matches[1], matches[2], "s3", stringToSign);
}

// Signs "simple" (non-chunked) upload requests.
function signPolicy(req, res) {
  var policy = req.body,
    base64Policy = new Buffer(JSON.stringify(policy)).toString("base64"),
    signature = req.query.v4 ? signV4Policy(policy, base64Policy) : signV2Policy(base64Policy);

  var jsonResponse = {
    policy: base64Policy,
    signature: signature
  };

  res.setHeader("Content-Type", "application/json");

  if (isPolicyValid(req.body)) {
    res.end(JSON.stringify(jsonResponse));
  } else {
    res.status(400);
    res.end(JSON.stringify({
      invalid: true
    }));
  }
}

function signV2Policy(base64Policy) {
  return getV2SignatureKey(clientSecretKey, base64Policy);
}

function signV4Policy(policy, base64Policy) {
  var conditions = policy.conditions,
    credentialCondition;

  for (var i = 0; i < conditions.length; i++) {
    credentialCondition = conditions[i]["x-amz-credential"];
    if (credentialCondition != null) {
      break;
    }
  }

  var matches = /.+\/(.+)\/(.+)\/s3\/aws4_request/.exec(credentialCondition)
  return getV4SignatureKey(clientSecretKey, matches[1], matches[2], "s3", base64Policy);
}

// Ensures the REST request is targeting the correct bucket.
// Omit if you don't want to support chunking.
function isValidRestRequest(headerStr, version) {
  if (version === 4) {
    return new RegExp("host:" + expectedHostname).exec(headerStr) != null;
  }

  return new RegExp("\/" + expectedBucket + "\/.+$").exec(headerStr) != null;
}

// Ensures the policy document associated with a "simple" (non-chunked) request is
// targeting the correct bucket.
function isPolicyValid(policy) {
  var bucket, isValid;

  policy.conditions.forEach(function(condition) {
    if (condition.bucket) {
      bucket = condition.bucket;
    }
  });

  isValid = bucket === expectedBucket;

  return isValid;
}

function getV2SignatureKey(key, stringToSign) {
  var words = CryptoJS.HmacSHA1(stringToSign, key);
  return CryptoJS.enc.Base64.stringify(words);
}

function getV4SignatureKey(key, dateStamp, regionName, serviceName, stringToSign) {
  var kDate = CryptoJS.HmacSHA256(dateStamp, "AWS4" + key);
  var kRegion = CryptoJS.HmacSHA256(regionName, kDate);
  var kService = CryptoJS.HmacSHA256(serviceName, kRegion);
  var kSigning = CryptoJS.HmacSHA256("aws4_request", kService);

  return CryptoJS.HmacSHA256(stringToSign, kSigning).toString();
}
