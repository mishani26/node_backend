var express = require('express');
var router = express.Router();
var fs = require("fs");

router.get('/', function(req, res, next) {
    res.render('insert', {
        title: "Insert"
    });
});
router.post('/', function(req, res, next) {
    try {
        var reqObj = req.body;

        fs.readFile(reqObj.image, function(err, data) {
            if (err) throw err;
            // Encode to base64
            var encodedImage = new Buffer(data).toString('base64');
            console.log(encodedImage);
            data64 = encodedImage.replace(/^data:image\/png;base64,/, '');

            fs.writeFile('image.png', data64, 'base64', function(err) {
              if (err) throw err;
            });
            console.log(reqObj);
            req.getConnection(function(err, conn) {
                if (err) {
                    console.error('SQL Connection error: ', err);
                    return next(err);
                } else {
                    var insertSql = "INSERT INTO user SET ?";
                    var insertValues = {
                        "firstName": reqObj.firstName,
                        "lastName": reqObj.lastName,
                        "image": encodedImage

                    };
                    var query = conn.query(insertSql, insertValues, function(err, result) {
                        if (err) {
                            console.error('SQL error: ', err);
                            return next(err);
                        }
                        console.log(result.image);
                        res.json({
                            result: encodedImage
                        });
                    });
                }
            });
        });
    } catch (ex) {
        console.error("Internal error:" + ex);
        return next(ex);
    }
});
module.exports = router;
