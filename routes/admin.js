const express = require('express');
const { get, json, send } = require('express/lib/response');
const router = express.Router();
const db = require('../db_config/db_connect')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { Console } = require('console');

router.get('/', function(req, res, next) {
    if (req.session.loggedin) {    
  
      var getJsonBody = req.body
      var countRows = getJsonBody.length
      console.log(countRows)
      res.render('./admins/home', { title: 'Home Admin' });
    }else{
  
      return res.render('./admins/index', { title: 'Admin Login !' });
    }
  });

  router.get('/product', async function(req, res, next) {
    if (req.session.loggedin) {    
      var _username = ''
      var _usercode = ''
      var _data = []
  
      res.render('./admins/product', { title: 'Product Management' , obj: _data, username: _username, usercode:_usercode});
    }else{
  
      return res.render('./admins/index', { title: 'Admin Login !' });
    }
  });

  // http://localhost:3000/auth
router.post('/auth', async function(req, res) {
  var sess
  let username = req.body.username;
  let password = req.body.password;
  
    // let time_expired = 600000;
    if (username && password) {
      var _sql = "SELECT * FROM pos_member WHERE MemberName = '"+username+"' AND ShopCode = '"+password+"' AND MemberLevel = 'Admin'";
      console.log('login: ',_sql)
      // Execute SQL query that'll select the account from the database based on the specified username and password
      var _login = await get_mysql_data(_sql)
      console.log('login: ',_login)
      // console.log(_login.length)
      if (_login.length > 0) {
        // Authenticate the user
        req.session.loggedin = true;
        req.session.username = username;
        req.session.usercode = password;
        // console.log('login: ', req.session.usercode)
  
        // var _data = await  loadData_Home(_login[0].ShopCode)

        // req.session.cookie.maxAge = time_expired;
        
        // Redirect to home page
        // res.render('./user/home', { title: 'home user', page : 'loadCus' , obj: data , username: req.session.username, usercode:req.session.usercode});
        // console.log('saleDaily loginpage', _data)
  
  
        return res.render('./admins/home', { title: 'home user',obj: [], username: req.session.username, usercode:req.session.usercode});
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

//  async function loadData_Home(_shopcode){
//   var _data
//   var _dateNow = moment(Date.now()).format('YYYY-MM-DD')
//   var _sql = "SELECT * FROM pos_online.pos_saledailydetail WHERE ShopCode = '"+_shopcode+"' AND DateDailySale = '"+_dateNow+"';"
//   // console.log('saleDaily _sql', _sql)

//   var _data = await get_mysql_data(_sql)

//   // console.log('saleDaily', _data, _dateNow)
//   return _data
// }

module.exports = router;
