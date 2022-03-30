const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require('../db_config/db_connect')
const util = require('util');
const { promises } = require('stream');
const session = require('express-session');
const request = require('request')
const bodyParser = require('body-parser')

router.get('/', async function(req, res, next) {
    if (req.session.loggedin) {
		// Output username
        var sql='SELECT * FROM vw_stock';
        var data = await  get_mysql_data(sql);

        // console.log('stockData: ' + data)
        res.render('stock', { title: 'Stock', obj: data, sess: req.session.username, opt: 'loadStock'});
	} else {
		// Not logged in
		res.render('login', { title: 'LogIn !!'});
        // res.render('admin', { title: 'admins', page : 'showPoint' , obj: data });
	}
});


router.post('/sale', async function(req, res, next) {
    const json = '[{"result":true, "count":42},{"result":true, "count":42}]';
    const obj = JSON.parse(json);
    var count = Object.keys(json).length

    // console.log('Got body:', req.body);
    res.status(200).send('rows: ' + obj.length)
    // if (req.session.loggedin) {
	// 	// Output username
    //     var sql='SELECT * FROM vw_stock';
    //     var data = await  get_mysql_data(sql);

    //     // console.log('stockData: ' + data)
    //     res.render('stock', { title: 'Stock', obj: data, sess: req.session.username, opt: 'loadStock'});
	// } else {
	// 	// Not logged in
	// 	res.render('login', { title: 'LogIn !!'});
    //     // res.render('admin', { title: 'admins', page : 'showPoint' , obj: data });
	// }
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