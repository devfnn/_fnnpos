const express = require('express');
const { get, json } = require('express/lib/response');
const router = express.Router();
const db = require('../db_config/db_connect')
const multer = require('multer');
const path = require('path');
const fs = require('fs');

router.get('/', function(req, res, next) {
  if (!req.session.loggedin) {    

    var _getJsonBody = req.body
    var _countRows = _getJsonBody.length
    // console.log(countRows)
    res.render('./user/index', { title: 'Home User' });
  }else{

    res.send('respond with a resource');
  }
});

router.get('/sell_product', async function(req, res, next) {
  if (!req.session.loggedin) {    
    var _username = req.session.username
    var _usercode = req.session.usercode
    var _getJsonBody = req.body
    var _countRows = _getJsonBody.length
    // console.log(countRows)
    var _shopcode = '11111'
    var _sql = "SELECT * FROM vw_stock WHERE shopcode = '"+_shopcode+"'"
    console.log(_sql)
    var _data = await get_mysql_data(_sql)

    res.render('./user/sell_product', { title: 'Home User' , obj: _data, username: _username, usercode:_usercode});
  }else{

    res.send('respond with a resource');
  }
});

router.get('/stock', async function(req, res, next) {

  if (!req.session.loggedin) {  
    var _getBody = req.body
    var _opt = req.query.opt // get option type
    var _data
    var _sql

    // opt=all request: shopcode 

    switch(_opt) {
      case 'all':
        var _shopcode = req.query.shopcode
        _sql = "SELECT * FROM vw_stock WHERE shopcode = '" + _shopcode +  "'"
        data = await get_mysql_data(_sql);
        console.log(_sql)
        break;
      default:
        _data = []
    }
    return res.render('./user/stock', { title: 'User Stock', page : 'show' , obj: _data , sesslogin: req.session.username});
    // return res.status(200).send({status: 0, message: "Stock !"});
  }else{

    return res.status(404).send({status: 0, message: "Not Found !"});
  }
});

router.get('/sell', async function(req, res, next) {
  if (!req.session.loggedin) {    

    if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
      return res.status(404).send({status: 0, message: "Object missing"});
      // console.log('Object missing');
    }else{
      var _getBody = req.body.Header.data
      var _data    
      if (_getBody.length > 0) {

        // console.log('Header: ' + _getBody.length)
  
        // console.log('1D: ' + req.body.Header.doc_id)
        // console.log('1D: ' + req.body.Header.shopcode)
        // console.log('1D: ' + req.body.Header.date)
        // console.log('1D: ' + req.body.Header.sale_chanel)
        // console.log('1D: ' + req.body.Header.sum_amount)
        // console.log('1D: ' + req.body.Header.product_count)
    
        // console.log('2D: ' + req.body.Header.data)
        // console.log('2D: ' + req.body.Header.data.length)
    
        var _header = req.body.Header
        var _headerData = req.body.Header.data
        var _datarowJson = JSON.stringify(_headerData)
  
        var _doc_id = _header.doc_id
        var _shopcode = _header.shopcode
        var _date = _header.date
        var _sale_chanel = _header.sale_chanel
        var _sum_amount = _header.sum_amount
        var _product_count = _header.product_count
        var _pay_method = _header.pay_method
  
        // console.log('1D: ' + _doc_id)
        // console.log('1D: ' + _shopcode)
        // console.log('1D: ' + _date)
        // console.log('1D: ' + _sale_chanel)
        // console.log('1D: ' + _sum_amount)
        // console.log('1D: ' + _product_count)
        // console.log('1D: ' + _pay_method)
  
        // console.log('strJs: ', _headerData)
        // console.log('strJs2: ',JSON.stringify(_headerData))
  
        // 1. insert header
      
       var  _sql = "INSERT INTO `pos_online`.`pos_saleorderlist` (DateCreateOrder, ShopCode, OrderNumber, ItemAmount, OrderStatus, PaymentMethod, SalesChannel, JsonData) VALUES ('"+_date+"', '"+_shopcode+"', '"+_doc_id+"', 20, "+_sum_amount+", '"+_pay_method+"', '"+_sale_chanel+"', '"+_datarowJson+"');"
        var _insertSQL = await get_mysql_data(_sql)
  
        // affectedRows
        console.log('insert result: ' + _insertSQL.insertId)
        // 2. update stock
  
        // ตัด stock
        for (let index = 0; index < _headerData.length; index++) {
          const element = _headerData[index];
          var _sql = "UPDATE `pos_stock` SET `SaleQuantity` = `SaleQuantity` +  "+element.qty+" WHERE `pos_stock`.`id` = "+element.stock_id+";"
          // console.log(_sql)
          var _updateSQL = await get_mysql_data(_sql)
          console.log(_updateSQL.affectedRows)
        }
        _data =[]

        // 3. update header sum amount dayly 
        //  3.1 check pos_saledailydetail 
        //  3.2 if find update sum amount else insert new row

        return res.render('./user/stock', { title: 'User Stock', page : 'show' , obj: _data , sesslogin: req.session.username});
      }else{
        _data =[]
        return res.status(404).send({status: 0, message: "Not Found !"});
      }
    
    }
  }else{

    return res.status(404).send({status: 0, message: "Not Found !"});
  }
});






const upload = multer({
  // dest:"/path/to/temporary/directory/to/store/uploaded/files"
  dest: "/public/assets/img/bill/"
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};


router.post('/image',upload.single("file"), async function(req, res, next) {
  if (!req.session.loggedin) {    
    const tempPath = req.file.path;
    const file_name = req.body.file_name

    console.log('filename: ' + file_name)
    const targetPath = path.join(__dirname, "../public/assets/img/bill/"+file_name+".png");

    if (path.extname(req.file.originalname).toLowerCase() === ".png") {
      fs.rename(tempPath, targetPath, err => {
        if (err) return handleError(err, res);

        res
          .status(200)
          .contentType("text/plain")
          .end("File uploaded!");
      });
    } else {
      fs.unlink(tempPath, err => {
        if (err) return handleError(err, res);

        res
          .status(403)
          .contentType("text/plain")
          .end("Only .png files are allowed!");
      });
    }
    
  }else{

    res.send('respond with a resource');
  }
});


router.get('/', function(req, res, next) {
  if (!req.session.loggedin) {    

  }else{

    res.send('respond with a resource');
  }
});

// const handleError = (err, res) => {
//   res
//     .status(500)
//     .contentType("text/plain")
//     .end("Oops! Something went wrong!");
// };



//mysql connect
var get_mysql_data=(sql,place_holder)=>
{
    //กำหนดให้ return  object Promise รอ
    return new Promise(function(resolve, reject){
        db.connect(()=>{
            //รันคำสั่ง SQL
            db.query(sql,place_holder,(err,result)=>{
                if(err)
                {
                    console.log(err);
                    return reject(err);
                }
  
                if(result==null)
                {
                    return reject({message:"Mysql Error"});
                }
                //ส่งผลลัพธืของคำสั่ง sql กลับไปให้ทำงานต่อ
                // console.log(result)
                resolve(result);
            })
        });
    });
}

module.exports = router;
