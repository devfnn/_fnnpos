var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if (!req.session.loggedin) {    
  
      var getJsonBody = req.body
      var countRows = getJsonBody.length
      console.log(countRows)
      res.render('./admins/home', { title: 'Home Admin' });
    }else{
  
      res.send('respond with a resource');
    }
  });

  router.get('/product', async function(req, res, next) {
    if (!req.session.loggedin) {    
      var _username = ''
      var _usercode = ''
      var _data = []
  
      res.render('./admins/product', { title: 'Product Management' , obj: _data, username: _username, usercode:_usercode});
    }else{
  
      return res.render('./admins/index', { title: 'Admin Login !' });
    }
  });

  
module.exports = router;
