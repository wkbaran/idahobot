var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');

var DATA_DIR = __dirname+'/data/'; // const e6
var LIB_DIR = __dirname+'/lib/'; // const e6
var ROUTE_DIR = __dirname+'/routes/'; // const e6

/**
 * If true save every response object
 */
var SAVE_RESPONSES = false;

/**
 * If true save every request object
 */
var SAVE_REQUESTS = true;

// var levelup = require('levelup');
// var sessionDb = levelup('sessions');
var dbPath = DATA_DIR+'local-object-store.dat';
var db = require('diskdb');
db.connect( DATA_DIR, ['sessions']);

if ( SAVE_REQUESTS ) {
  db.connect( DATA_DIR, ['requests']);
}
if ( SAVE_RESPONSES ) {
  db.connect( DATA_DIR, ['responses']);
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
var debugLog = fs.createWriteStream(__dirname+'/access.log',{flag:'a'});
app.use(logger('dev' , {stream: debugLog}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Facebook page id
var page_id = "1741397726102933";
// Facebook page access token
var token = "EAAYvysDghZAUBADMkbbZCN7upC3nyIUDl01ZAzCYxXZBlzuB5nZABL5pwRYx5H2mz9qwZBgYe8ZAH7oeMvfIvk8w0hEZBM6qKnH79T0jQYMSR63tVyu0uenbsT7dHNcjubd5r8NryGfOOycYKl4g4RVo0GuQrqafIoh8go98HpFLKQZDZD";
var fbmsgr = new (require('./lib/fbmsngr.js'))(token);

// Simple list of plugins that we're allowing to be executed.
// In a hash to make validating it an easy boolean test.
var PLUGINS = {
  refund_status: 1,
  lookup_charge: 1,
  main_menu: 1
};

// Configure Facebook webhook validator
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === token ) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');    
  }
});

/**
 * Reset the app so the user is back at the top level again.
 * Currently this means setting the current app to 'main_menu'
 */
function resetApp ( session ) {
  session.app = 'main_menu';
}

/**
 * Delete the given session 
 */
function dropSession ( session ) {
}

// Handle Facebook callback
app.post('/webhook/', function (req, res) {
  if ( SAVE_REQUESTS ) {
    console.log("Request",req.body.entry);
    // db.sessions.save(req);
  }

  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    console.log("Event",event);
    senderId = event.sender.id;

    if ( event.delivery ) {
      // Ignore delivery acks for now
      // We don't want them to disrupt the current session
      console.log("Ignoring delivery event");
    } else {
      // Load the session
      var session = db.sessions.findOne({user_id:senderId});
      if ( !session ) {
        console.log("Creating new session for "+senderId);
        session = {user_id:senderId};
      } else {
        console.log("Loaded session for "+senderId,session);
      }

      // Short circuit the loop with any top-level command
      if ( event.message && event.message.text ) {
        if ( event.message.text === "reset session" ) {
          console.log("Resetting session");
          // Delete everything we know about this user
          db.sessions.remove({user_id:senderId});
          // The loop has been hijacked
          continue;
        }
      }

      // Load the necessary module
      if ( session.app && PLUGINS[session.app] ) {
        console.log("Session.app",session.app);
        mod = require(LIB_DIR+session.app+".js");
        mod = new mod(fbmsgr);
        mod.handleEvent( event,session,req,res,resetApp );
      } else {
        console.log("Defaulting");
        // By default display the welcome page
        // Currently a menu
        session.app = "main_menu";
        mod = require(LIB_DIR+"main_menu.js");
        mod = new mod(fbmsgr);
        mod.showMenu( senderId,req,res,resetApp );
      } // ignore anything else
  
      // Persist the session
      console.log("Saving session",session);
      var updated = db.sessions.update(
        {user_id:senderId},session,{multi:true,upsert:true});
      console.log("Updated",updated);
    }
  }

  if ( SAVE_RESPONSES ) {
    db.responses.save(res);
  }
  res.sendStatus(200);
});

// Serve statics. Mostly images
app.use(express.static('public'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    // console.trace("ERROR: "+err);
    console.log("### stack: "+err.stack);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
