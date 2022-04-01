var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if (!req.session.loggedin) {    
  
      var getJsonBody = req.body
      var countRows = getJsonBody.length
      console.log(countRows)
      res.render('./admin/home', { title: 'Home Admin' });
    }else{
  
      res.send('respond with a resource');
    }
  });

module.exports = router;
