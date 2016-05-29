/**
 * What to do when a user first shows up, or when the user is done with
 * an action, or we don't understand user's input, or we catch an unhandled
 * error
 * @author Bill Baran
 */

//Public
module.exports = MainMenu;

function MainMenu ( fbmsgr ) {
  this.messenger = fbmsgr;
}

var LIB_DIR = __dirname+'/'; // const e6

/**
 * Set of valid plugins
 */
MainMenu.prototype.VALID_PLUGINS = {
  refund_status: 1,
  lookup_charge: 1
};

/**
 * Handle received postback event.
 * @param {FacebookEvent} event
 * @param {session} session
 * @param {request} req
 * @param {response} res
 * @param {callback} finished notify the app this plugin is done
 */
MainMenu.prototype.handleEvent = function ( 
    event, session, req, res, finished ) {
  console.log("In MainMenu.handle");
  if ( event.optin || event.delivery ) {
    console.log("Ignoring event.deliver");
    // NOOP: ignore optins and delivery acks for now
  } else
  if ( event.postback && event.postback.payload ) {
    if ( this.VALID_PLUGINS[event.postback.payload] ) {
      var plugin = event.postback.payload;
      // Received a valid plugin request
      console.log("Postback payload for "+plugin);
      // Tax Refund Status Lookup
      session.app = plugin;
      console.log("Session",session);
      mod = require(LIB_DIR+plugin+".js");
      mod = new mod(this.messenger);
      mod.handleEvent(event,session,req,res,finished);
      return;
    } else {
      // Received request for unknown plugin
      console.error("Unknown postback "+event.postback.payload);
    }
  } else
  if ( event.message && event.message.text ) {
    console.log("Message event");
    if ( event.message.text === "help" ) {
      this.showMenu(event.sender.id,req,res);
    } else {
      this.messenger.sendTextMessage( 
          "Echo: "+event.message.text, event.sender.id, req, res);
      console.log("Sending help message");
      this.messenger.sendTextMessage( 
          "Type 'help' to see the menu again.", event.sender.id, req, res);
    }
  } else console.log("Unhandled event type");
  if ( finished ) finished(session);
};

/**
 * Show the user the main menu
 */
MainMenu.prototype.showMenu = function ( rcpt, req, res ) {
  console.log("Showing menu");
  this.messenger.sendWelcomeMessage( rcpt, req, res);
};
