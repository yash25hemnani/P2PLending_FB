const multer = require('multer')

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
        let filename;
        if (req.originalUrl.includes('/upload/mug/front')) {
            filename = `${req.user.email}-mug-front`;
        } else if (req.originalUrl.includes('/upload/mug/side')) {
            filename = `${req.user.email}-mug-side`;
        } 

        cb(null, filename);
    }
})

const upload = multer({storage: storage})

module.exports = upload;