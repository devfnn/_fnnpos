const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require('../db_config/db_connect')
const util = require('util');
const { promises } = require('stream');
const session = require('express-session');
const request = require('request');
const { status } = require('express/lib/response');
const { STATUS_CODES } = require('http');


router.get('/', async function(req, res, next) {
    res.render('stock', { title: 'LogIn !!'});
});


// http://localhost:3000/auth
router.post('/auth', async function(req, res) {
    req.session.loggedin = true;
    res.status(200).send('Ok')
    // console.log('url', req.originalUrl)
    // console.log('Login..')
	// Capture the input fields
    // var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    // console.log('fff ', req)
	// var username = req.body.username;
	// var password = req.body.password;
    // // let time_expired = 600000;

    // console.log('u: ' + username + ' P: ' + password)

    
    // console.log('SQL : ' , sql)
  
	// // Ensure the input fields exists and are not empty
	// if (username && password) {
	// 	// Execute SQL query that'll select the account from the database based on the specified username and password
    //     var sql="SELECT * FROM pos_online.pos_member WHERE MemberName = '"+username+"' AND ShopCode = '"+password+"'";
    //     var data = await  get_mysql_data(sql);
    //     if (data.length > 0) {
    //         // Authenticate the user
    //         req.session.loggedin = true;
    //         req.session.username = username;
            
    //         // req.session.cookie.maxAge = time_expired;
            
    //         // Redirect to home page
    //         res.render('stock', { title: 'Stock', page : 'loadCus' , obj: data , sess: req.session.username});

    //         // res.redirect('/admin');
    //     } else {
    //         res.send('Incorrect Username and/or Password!');
    //     }			
	// } else {
	// 	res.send('Please enter Username and Password!');
	// 	res.end();
	// }
});

router.get('/logout', function(req, res) {
    // console.log('SSa: ', req.session)
    req.session.username = '';
    req.session.loggedin = false;
    // console.log('ssb: ', req.session)
    res.render('login', { title: 'LogIn !!'})
    // console.log(req.session)

});


const get_mysql_data=(sql,place_holder)=>
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
                //console.log(result)
                resolve(result);
            })
        });
    });
}
module.exports = router;