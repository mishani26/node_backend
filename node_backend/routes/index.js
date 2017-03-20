var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Cool', condition: true, testArray:[1,2,3] });
});
router.post('/', function(req,res,next){
try{
var reqObj = req.body;
console.log(reqObj);
req.getConnection(function(err, conn){
if(err)
{
console.error('SQL Connection error: ', err);
return next(err);
}
else
{
var insertSql = "SELECT * FROM user WHERE ?";
var insertValues = {
"firstName" : reqObj.name
};
var query = conn.query(insertSql, insertValues, function (err, result){
if(err){
console.error('SQL error: ', err);
return next(err);
}
var Employee_Id = result.insertId;
res.json({"Emp_id":Employee_Id});
});
}
});
}
catch(ex){
console.error("Internal error:"+ex);
return next(ex);
}
});
module.exports = router;
