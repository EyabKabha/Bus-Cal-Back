var aws = require('aws-sdk')
var multer = require('multer')
var multerS3 = require('multer-s3')
aws.config.update({
    region: 'eu-central-1',
    accessKeyId: 'AKIAIOVBWGKHR53CNLZA',
    secretAccessKey: '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',
})
 
var s3 = new aws.S3()
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'buscal',
    acl: 'public-read-write',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: 'test'});
    },
    key: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
})
 
module.exports = upload;