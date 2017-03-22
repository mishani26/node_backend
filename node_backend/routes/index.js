var express = require('express');
var router = express.Router();
var fs = require("fs");
var PDFDocument = require('pdfkit');
var sleep = require('system-sleep');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Cool',
        condition: true,
        testArray: [1, 2, 3]
    });
});
router.post('/', function(req, res, next) {
    try {
        var reqObj = req.body;
        console.log(req.body);
        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            } else {
                var insertSql = "SELECT * FROM user WHERE  firstName='" + reqObj.name + "'";
                var query = conn.query(insertSql, function(err, result) {
                    if (err) {
                        console.error('SQL error: ', err);
                        return next(err);
                    }
                    data64 = result[0].image.replace(/^data:image\/png;base64,/, '');

                    fs.writeFile('image.png', data64, 'base64', function(err) {
                        if (err) throw err;
                    });

                    sleep(2000);
                    console.log("image.png has been created");
                    // data64 = result[0].image.replace(/^data:image\/png;base64,/, '');
                    //
                    // fs.writeFile('image1.png', data64, 'base64', function(err) {
                    //   if (err) throw err;
                    // });
                    var pdf = new PDFDocument({
                        size: 'LEGAL', // See other page sizes here: https://github.com/devongovett/pdfkit/blob/d95b826475dd325fb29ef007a9c1bf7a527e9808/lib/page.coffee#L69
                        info: {
                            Title: 'Tile of File Here',
                            Author: 'Some Author',
                        }
                    });

                    // Write stuff into PDF
                    pdf.image('image.png', 0, 15, {
                            width: 300
                        })
                        .text(result[0].firstName + " " + result[0].lastName, 0, 0);

                    // Stream contents to a file
                    pdf.pipe(
                            fs.createWriteStream('file.pdf')
                        )
                        .on('finish', function() {
                            console.log('PDF closed');
                        });

                    // Close PDF and write file.

                    pdf.end();
                    sleep(2000);
                    fs.readFile("file.pdf", function(err, data) {
                        if (err) throw err;
                        // Encode to base64
                        var encodedPDF = new Buffer(data).toString('base64');
                        var insertSql = "UPDATE user SET pdf='"+encodedPDF+"' WHERE firstName='"+result[0].firstName+"'";
                        var query = conn.query(insertSql, function(err, result) {
                            if (err) {
                                console.error('SQL error: ', err);
                                return next(err);
                            }
                            console.log("good");
                            res.json({
                                "result": true
                            });
                        });
                    });
                });
            }
        });
    } catch (ex) {
        console.error("Internal error:" + ex);
        return next(ex);
    }
});
module.exports = router;
