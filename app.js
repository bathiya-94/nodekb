
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

// MongoDB connection
mongoose.connect(config.database);
let db = mongoose.connection;

const app = express();

//Check DB connections
db.once('open',function(){

    console.log('Connected to MongoDB');

});


//Check for db errors
db.on('error',function(err){
    console.log(err);

}); 


//Set view Engine
app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'pug');


//Body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


// Set public folder
app.use(express.static(path.join(__dirname,'public')));

// Express Session  Middleware

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
    
  }));


  //Express messages Middleware
  app.use(require('connect-flash')());
  app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
  });


  // Express Session Middleware

  app.use(expressValidator({
    errorFormatter:function(param, msg, value){
        var namespace = param.split('.')
        ,root = namespace.shift()
        , formParam = root;

        while(namespace.length){
            formParam += '[' +namespace.shift() + ']';

        }

        return{
            param : formParam,
            msg   : msg,
            value : value
        };
    }

}));


// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


app.get('*',function(req, res, next){
   
    res.locals.user =req.user || null;
    next();

});




//Bring in Models 
let Article = require('./models/article');



//Home Route
app.get('/',function(req,res){
   
    Article.find({},function(err,articles ){
        
        if (err){
            console.log(err);
        }

        else
        {
            res.render('index',{
                title :'Articles',
                articles: articles
            }); 
    
    
        }       
        
    });
    
    
    
});

let articles = require('./routes/articles');
let users = require('./routes/users');


app.use('/articles', articles);
app.use('/users', users);










app.listen(3000,function(){
    console.log('Server running on port 3000');
});