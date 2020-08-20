const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('./aws.s3');

const avatarUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET,
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, + Date.now().toString() + file.originalname )
        },
        limits:{ fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
        fileFilter: function( req, file, cb ){
            checkFileType( file, cb );
        }
    })
}).single('avatar');

/**
 * Check File Type
 * @param file
 * @param cb
 * @return {*}
 */
function checkFileType( file, cb ){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test( path.extname( file.originalname ).toLowerCase());
    // Check mime
    const mimetype = filetypes.test( file.mimetype );
    if( mimetype && extname ){
        return cb( null, true );
    } else {
        cb( 'Error: Images Only!' );
    }
}


module.exports = avatarUpload;
