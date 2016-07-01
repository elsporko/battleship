var appRouter = function(app){
    //var jsonfile   = require('jsonfile');
    //var fs = require('fs');
    // Mark applicant as missing or send for reprocess
 
    app.get('/',function(req, res, next){
        res.render('index',{});
        res.end();
    });
   
}

module.exports = appRouter;



