const express = require('express');
const { get, json } = require('express/lib/response');
const router = express.Router();
const db = require('../db_config/db_connect')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { Console } = require('console');



router.get('/', async function(req, res, next) {
  if (req.session.loggedin) {    
    
   
    var _shopcode = req.session.usercode
    var _data = await loadData_Home(_shopcode)
    // 
    console.log('sessions',_shopcode, req.session.loggedin)

    res.render('./user/home', { title: 'Home User' ,obj: _data, username: req.session.username, usercode: req.session.usercode});
    
  }else{

    res.render('./user/index', { title: 'Home User Login !' });
  }
});

router.get('/sell', async function(req, res, next) {
  if (req.session.loggedin) {    
    var _username = req.session.username
    var _usercode = req.session.usercode
    var _getJsonBody = req.body
    var _countRows = _getJsonBody.length
    // console.log(countRows)
    

    var _shopcode = '11111'
    var _sql = "SELECT * FROM vw_stock WHERE shopcode = '"+_shopcode+"'"
    console.log(_sql)
    var _data = await get_mysql_data(_sql)

      console.log(_data)
    res.render('./user/sell_product', { title: 'Home User' , obj: _data, username: _username, usercode:_usercode});
  }else{

    res.send('respond with a resource');
  }
});

router.get('/stock', async function(req, res, next) {
  if (req.session.loggedin) {  
    var _getBody = req.body
    var _opt = req.query.opt // get option type
    var _data
    var _sql
console.log('opt:', _opt)
    switch(_opt) {
      case 'all':
        // var _shopcode = req.query.shopcode
        var _shopcode = '11111'
        _sql = "SELECT * FROM vw_stock WHERE shopcode = '" + _shopcode +  "'"

        _data = await get_mysql_data(_sql);
        console.log(_sql)
        break;
      default:
        _data = []
    }
    return res.render('./user/stock', { title: 'User Stock', page : 'show' , obj: _data, username: req.session.username, usercode:req.session.usercode});
    // return res.status(200).send({status: 0, message: "Stock !"});
  }else{

    return res.render('./user/index', { title: 'Home User Login !' });
  }

});

router.get('/recive', async function(req, res, next) {

  if (req.session.loggedin || req.query.loggedin) {  
    var _username = req.session.username
    var _usercode = req.session.usercode
    
    var _getBody = req.body 

    var _opt = req.query.opt // get option type
    // var _id = req.body.Header.ReciveId //get in json body
    // var _shopcode = req.session.usercode
    var _shopcode = '11111' 
    var _data
    var _sql


    // console.log('recv opt: ' + _opt)
    // opt=all request: shopcode  confirm


    // call switch recivce
    switch(_opt){
      case 'show':
        // var _shopcode = req.query.shopcode
        _sql = "SELECT * FROM pos_online.pos_stocklist WHERE ShopCode = '"+ _shopcode +"';"
        _data = await get_mysql_data(_sql);
        // console.log(_sql)
        break;
      case 'detail':
        var _reciveid = req.query.reciveid 
          // var _shopcode = req.query.shopcode
          _sql = "SELECT * FROM pos_online.pos_stocklist WHERE id = '"+ _reciveid +"';"
          _data = await get_mysql_data(_sql);
          // console.log(_sql)
          break;
      case 'confirm':

        // การรับสินค้าเข้าคลัง font ๖้องเอา jsondata เดิมแต่เพิ่มฟิว recvStatus, recvRemark เข้ามา เพื่อเช็คว่า กล่องไหนรับ กล่องไหนไม่รับ พร้อมเหตุผล ที่ไม่รับ
        // new json string ใหม่ง่ายสุด
  
          if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
            // ไม่พบข้อมูลแจ้งเตือน status 0
            return res.status(404).send({status: 0, message: "Object missing"});
          }else{
            // พบข้อมูล check จำนวนแถวข้อมูลก่อนเข้าเงื่อนไขบันทึก
              var _getBody = req.body.Header.data
              var _data    
              if (_getBody.length > 0) {
            
                var _header = req.body.Header
                var _headerData = req.body.Header.data // get สมาชิกของ Json header นั้นก็คือ json level ที่ 2 (D2)
                var JsonDataAfterRecive = JSON.stringify(_headerData) // Convert Json String to Json Format เตรียมไว้เพื่อเอาไปเก็บหลังจากเพิ่ม stock เรียบร้อยแล้ว: JsonDataAfterRecive

                //console.log('_headerData: ', _headerData)
                //console.log('_datarowJson: ', _datarowJson)
                var _recv = 0 //ไม่รับ
                var _notRecv = 0 // รับ

                for (let index = 0; index < _headerData.length; index++) {
                    const element = _headerData[index];
                    // ค้นหา stock ด้วย productcode และ shopcode
                    // 0. check ว่ารับไหม ไม่รับข้ามเลย
                    //console.log('RecvStatus: ' + element.RecvStatus)
                    if (element.RecvStatus) {
                      _recv = _recv + 1
                   
                      var _getStockSQL = "SELECT * FROM pos_online.pos_stock WHERE ShopCode = '"+_shopcode+"'  AND ProductCode = '"+element.product_code+"'"
                      var  _getStock = await get_mysql_data(_getStockSQL)
                        
                      // console.log('ele leng: ',_getStock.length , _getStockSQL)
                      var _dateNow = moment(Date.now()).format('YYYY-MM-DD')

                      if (_getStock.length === 0) {
                          // 1. ไม่พบ new record in pos_stock

                          var _insertStockSQL = "INSERT INTO `pos_online`.`pos_stock` (`DateCreateStock`, `ShopCode`, `ProductCode`, `OnHand`, `SaleQuantity`, `QuantityRevise`) VALUES ('"+_dateNow+ "', '"+_shopcode+"', '"+element.product_code+"', '0', '0', '0');"
                          var  _insertStock = await get_mysql_data(_insertStockSQL)
                          console.log('1. new stock: ', _insertStock.insertId)


                      }else{ 
                         // 2. พบ อัปเดท OnHan = OnHan + UnitQuantity
                          console.log('element.UnitQuantity: ' , element.UnitQuantity)
                          var _updateStockSQL = "UPDATE `pos_online`.`pos_stock` SET `OnHand` = `OnHand` + "+element.UnitQuantity+" WHERE (`ShopCode` = '"+_shopcode+"' AND `ProductCode` = '"+element.product_code+"');"

                          var _updateStock = await get_mysql_data(_updateStockSQL)
                          console.log('2. update stock: ', _updateStock.affectedRows, _updateStockSQL)
                      }
                  
                    } else {
                      _notRecv = _notRecv + 1
                    }
                    
                }   

                // 3. ปรับ status pos_stocklist to 'recived' by recv_id
                // check ถ้า not recive มากกว่า 0 ให้บันทึก NotReciveStatus เป็น true เพื่อบอกให้รู้ว่ารายการ stock นี้มีการกดไม่รับสินค้า สาเหตุอยู่ใน new json string 
                var _notReciveStatus = false
                _notRecv > 0 ?_notReciveStatus=true:_notReciveStatus=false

                var _updateStockListSQL = "UPDATE `pos_online`.`pos_stocklist` SET `ReceiveStatus` = 'recived', `NotReciveStatus` = "+_notReciveStatus+", `JsonDataAfterRecive` = '"+JsonDataAfterRecive+"', `ReciveCount` = '"+_recv+"', `NotReciveCount` = '"+ _notRecv+"', DateReceive = '"+_dateNow+"', RecivedBy = '"+req.session.usercode+"' WHERE (`id` = '"+_header.ReciveId+"');"

                var _updateStockList = await get_mysql_data(_updateStockListSQL)

                console.log('3. _updateStockListSQL: ', _updateStockListSQL,_updateStockList.affectedRows)
                var _getStockSQL = "SELECT * FROM vw_stock WHERE ShopCode = '"+_shopcode+"'"
                _data = await get_mysql_data(_getStockSQL)

                // 4. add running sti in pos_member.StockNumber
                  // 1. get status 'sending' 
                  // 2. get last running StockNUmber
                  // 3. new StockNumber exp. 1 : 1+1 = 2 new StockNumber = 2
                  // 4. update pos_member.StockNumber = new StockNUmber
                  // 5. final StockListNumber = 'sti'  + shopname + new StockNUmber
                  // 6. update pos_stocklist.StockListNumber = final StockListNumber 

             }
          }

          break;
  
      default:
        _sql = "SELECT * FROM pos_online.pos_stocklist WHERE ShopCode = '"+ _shopcode +"';"
        _data = await get_mysql_data(_sql);
        console.log('df:')
    }
  
    return res.render('./user/recive', { title: 'Stock Recive' , obj: _data , username: _username, usercode:_usercode});
    // return res.render('./user/home', { title: 'User Home',obj:_data,  username: req.session.username, usercode:req.session.usercode});
    // return res.status(200).send({status: 0, message: "Stock !"});
  }else{

    return res.status(404).send({status: 0, message: "Pleate Login !"});
  }
});


router.get('/report', async function(req, res, next) {
  if (req.session.loggedin) {    
    var _username = req.session.username
    var _usercode = req.session.usercode
    var _getJsonBody = req.body
    var _countRows = _getJsonBody.length
    // console.log(countRows)
    

    var _shopcode = '11111'
    var _sql = "SELECT * FROM vw_stock WHERE shopcode = '"+_shopcode+"'"
    console.log(_sql)
    var _data = await get_mysql_data(_sql)

    res.render('./user/report', { title: 'Report' , obj: _data, username: _username, usercode:_usercode});
  }else{

    return res.render('./user/index', { title: 'Home User Login !' });
  }
});

router.get('/bill', async function(req, res, next) {
  if (req.session.loggedin) {    
    var _username = req.session.username
    var _usercode = req.session.usercode
    var _getJsonBody = req.body

 
    res.render('./user', { title: 'Report' , obj: [{}], username: _username, usercode:_usercode});
  }else{

    return res.render('./user/index', { title: 'Home User Login !' });
  }
});


router.get('/sellbill', async function(req, res, next) {
  if (req.session.loggedin) {    
    var _data
    var _username = req.session.username
    var _usercode = req.session.usercode
    var _getJsonBody = req.body
    console.log(_usercode)

    var _getSellBillSQL = "SELECT * FROM pos_online.pos_saleorderlist WHERE ShopCode = '"+_usercode+"'"
    _data = await get_mysql_data(_getSellBillSQL)


    res.render('./user/sellbill', { title: 'Report' , obj: _data, username: _username, usercode:_usercode});
  }else{

    return res.render('./user/index', { title: 'Home User Login !' });
  }
});


router.get('/slip', async function(req, res, next) {
  if (req.session.loggedin) {    
    var _data = []

    res.render('./user', { title: 'Report' , obj: _data, username: _username, usercode:_usercode});
  }else{

    return res.render('./user/index', { title: 'Home User Login !' });
  }
});

router.post('/sell', async function(req, res, next) {
  if (req.session.loggedin || req.query.loggedin) {    
    // check data json body (ข้อมูลการขายที่มาจาก font ส่งมาเป็น body:json)
    
    if(req.body.constructor === Object && Object.keys(req.body).length === 0) {

      // ไม่พบข้อมูลแจ้งเตือน status 0
      return res.status(404).send({status: 0, message: "Object missing"});
    }else{

      // พบข้อมูล check จำนวนแถวข้อมูลก่อนเข้าเงื่อนไขบันทึก
        var _getBody = req.body.Header.data
        var _data    
        if (_getBody.length > 0) {
      
          var _header = req.body.Header
          var _headerData = req.body.Header.data
          var _datarowJson = JSON.stringify(_headerData)

          var _shopcode = _header.shopcode
          var _date = _header.date
          var _sale_chanel = _header.sale_chanel
          var _sum_amount = _header.sum_amount
          var _product_count = _header.product_count
          var _pay_method = _header.pay_method
    
          //0. check running

          var _getUserSQL = "SELECT * FROM `pos_online`.`pos_member` WHERE ShopCode = '"+ _shopcode +"'"

          // UPDATE `pos_online`.`pos_member` SET `SaleDailyNumber` = '1' WHERE (`id` = '52');

          var _getUserData = await get_mysql_data(_getUserSQL)
  
          console.log('0. _getUserData: ' + _getUserData[0])

          var _shopName = _getUserData[0].ShopName

          var _newSaleDailyNumber = _getUserData[0].SaleDailyNumber + 1
          var _finalsaleDailyNumber = 'SDD-'+ _shopName + "-" + _newSaleDailyNumber
  
          var _newOrderNumber = _getUserData[0].OrderNumber + 1 
          var _finalOrderNumber =  _shopName + "-" + _newOrderNumber
  
          console.log('ShopName: ' , _shopName)

          console.log('SaleDailyNumber: ' , _getUserData[0].SaleDailyNumber)
          console.log('New SaleDailyNumber: ' , _newSaleDailyNumber)
          console.log('Final SaleDailyNumber: ' , _finalsaleDailyNumber)

          console.log('OrderNumber: ' , _getUserData[0].OrderNumber)
          console.log('New OrderNumber: ' , _newOrderNumber)
          console.log('Final OrderNumber: ' , _finalOrderNumber)

        // 1. insert header
        
         var  _sql = "INSERT INTO `pos_online`.`pos_saleorderlist` (DateCreateOrder, ShopCode, OrderNumber, ItemAmount, ItemQuantity, OrderStatus, PaymentMethod, SalesChannel, JsonData) VALUES ('"+_date+"', '"+_shopcode+"', '"+_finalOrderNumber+"', "+_sum_amount+", "+_product_count+", 'complete' , '"+_pay_method+"', '"+_sale_chanel+"', '"+_datarowJson+"');"
        
        // 1.1  update ordernumber running to pos_member

        var _insertSaleOrderList = await get_mysql_data(_sql)
  
        var _sqlUpdateOrderNumber = "UPDATE `pos_online`.`pos_member` SET `OrderNumber` = '"+_newOrderNumber+"' WHERE (`ShopCode` = '"+_shopcode+"');"
        var _updateMemberOrderNumber = await get_mysql_data(_sqlUpdateOrderNumber)
        // affectedRows

        console.log('1. insert _insertSaleOrderList: ' + _insertSaleOrderList.insertId)
        console.log('1.1 update _updateMemberOrderNumber: ' + _updateMemberOrderNumber.affectedRows)
  
        // 2. update stock
        // ตัด stock

          for (let index = 0; index < _headerData.length; index++) {
            const element = _headerData[index];
            var _sql = "UPDATE `pos_stock` SET `SaleQuantity` = `SaleQuantity` +  "+element.qty+" WHERE `pos_stock`.`id` = "+element.stock_id+";"
            //console.log('2. SQL UpdateStock ' + _sql)
            var _updateStock = await get_mysql_data(_sql)
      
            console.log('2. _updateStock (cut stock): ' + _updateStock.affectedRows + ' stockId: ' + element.stock_id)
          }
  
        // บันทึกการแจ้งยอดเงิน
        // 3. update header sum amount dayly 
        //  3.1 check pos_saledailydetail 
        //  3.2 if find update sum amount else insert new row

        // ถ้าเป็นเงินสด บันทึกข้อมูล saledailydetail

          if (_pay_method === 'cash') {
            var dateNow = moment(Date.now()).format('YYYY-MM-DD')
            console.log('moment date: ' + dateNow)
    
            // check ว่ามีข้อมูลยอดขายประจำหรือไม่
            var _getSaleDailySQL = "SELECT * FROM pos_online.pos_saledailydetail WHERE DateDailySale = '"+dateNow+"' AND ShopCode = '"+_shopcode+"';"
            var _getSaleDaily = await get_mysql_data(_getSaleDailySQL)
            console.log('3. _getSaleDaily.length: ' + _getSaleDaily.length)

              // ถ้าไม่มี เพิ่มข้อมูลใหม่
              if (_getSaleDaily.length === 0) {
                var _insertSaleDailySQL = "INSERT INTO `pos_online`.`pos_saledailydetail` (`ShopCode`, `DateDailySale`, `SalesQuantity`, `TotalAmount`, `StatusPayment`, `SaleDailyNumber`, `PaymentMethod`) VALUES ('"+_shopcode+"', '"+dateNow+"', '"+_headerData.length+"', '"+_sum_amount+"', 'pending', '"+_finalsaleDailyNumber+"', 'เงินสด');"
    
                // console.log('3.0 _insertSaleDailySQL: ' + _insertSaleDailySQL)
                
                var _insertSaleDaily = await get_mysql_data(_insertSaleDailySQL)
                console.log('3 _insertSaleDaily ID: ' + _insertSaleDaily.insertId)

                var _updateSaleDailyNumberSQL = "UPDATE `pos_online`.`pos_member` SET `SaleDailyNumber` = '"+_newSaleDailyNumber+"' WHERE (`ShopCode` = '"+_shopcode+"');"
                var _updateSaleDailyNumber = await get_mysql_data(_updateSaleDailyNumberSQL)
                console.log('3.1 _updateSaleDailyNumber ID: ' + _updateSaleDailyNumber.affectedRows)

              }else{ // ถ้ามีทำการอัปเดทยอดรวม
                var _updateSaleDailySQL = "UPDATE `pos_online`.`pos_saledailydetail` SET `TotalAmount` = `TotalAmount` + "+_sum_amount+", `SalesQuantity` = `SalesQuantity` + "+_product_count+" WHERE (`id` = '"+_getSaleDaily[0].id+"');"
    
                var _updateSaleDaily = await get_mysql_data(_updateSaleDailySQL)
                console.log( '3 _updateSaleDaily ById: ' + _updateSaleDaily.affectedRows)
    
              }
          }

          var _sql = "SELECT * FROM pos_online.pos_saleorderlist WHERE ShopCode = '"+_shopcode+"'"
          var _data = await get_mysql_data(_sql)

          return res.render('./user/home', { title: 'User Home', obj:_data,  username: req.session.username, usercode:req.session.usercode});
       
        }else{
  
          return res.status(404).send({status: 0, message: "Not Found !"});
        } 
      
    }
  }else{

    return res.status(500).send({status: 0, message: "Not Login !"});
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

// http://localhost:3000/auth
router.post('/auth', async function(req, res) {
var sess
let username = req.body.username;
let password = req.body.password;

  // let time_expired = 600000;
  if (username && password) {
    var _sql = "SELECT * FROM pos_member WHERE MemberName = '"+username+"' AND ShopCode = '"+password+"'";
    console.log('login: ',_sql)
    // Execute SQL query that'll select the account from the database based on the specified username and password
    var _login = await get_mysql_data(_sql)
    console.log('login: ',_login[0].ShopCode)
    // console.log(_login.length)
    if (_login.length > 0) {
      // Authenticate the user
      req.session.loggedin = true;
      req.session.username = username;
      req.session.usercode = password;
      // console.log('login: ', req.session.usercode)

      var _data = await  loadData_Home(_login[0].ShopCode)
      // req.session.cookie.maxAge = time_expired;
      
      // Redirect to home page
      // res.render('./user/home', { title: 'home user', page : 'loadCus' , obj: data , username: req.session.username, usercode:req.session.usercode});
      // console.log('saleDaily loginpage', _data)


      return res.render('./user/home', { title: 'home user',obj: _data, username: req.session.username, usercode:req.session.usercode});
      // res.redirect('/admin');
  } else {
      // res.statusCode(500).send('Incorrect Username and/or Password!');
      return res.status(500).send('Incorrect Username and/or Password!');
  }	
       
  } else {
    res.send('Please enter Username and Password!');
    res.end();
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

async function loadData_Home(_shopcode){
      var _data
      var _dateNow = moment(Date.now()).format('YYYY-MM-DD')
      var _sql = "SELECT * FROM pos_online.pos_saledailydetail WHERE ShopCode = '"+_shopcode+"' AND DateDailySale = '"+_dateNow+"';"
      // console.log('saleDaily _sql', _sql)

      var _data = await get_mysql_data(_sql)

      // console.log('saleDaily', _data, _dateNow)
      return _data
}

module.exports = router;
