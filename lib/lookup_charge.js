/**
 * Lookup a billing transaction for a user.
 * @param {FBMessenger} fb - the Facebook Messenger api
 * @constructor
 */
function ChargeLookup ( fbmsgr ) {
  this.messenger = fbmsgr;
  // Set the start state
  // TODO: Make configurable
  this.state = this.startState;
}

//Public
module.exports = ChargeLookup;

/**
 * All the possible app states.
 */
ChargeLookup.prototype.states = {
  // the start state
  clip: { // expecting next input to be clip no.
    prompt:"What are the last 4 digits of the card number?",
    next:'when'
  },
  when: { // expecting input to be a date
    prompt:"What was the date of the carge?",
    next:'amount'
  },
  amount: {  // expecting currency
    prompt:"What was the estimated amount of your refund?",
    next:'finished'
  },
  finished: {}
  // When all these are collected, create a url link to status description
};

var START_STATE = 'clip'; // const
var FINAL_STATE = 'finished'; // const

/**
 * Given a certain state return the next.
 * @param {FBMessenger_message} event Event received from Facebook
 * @param {Session} session
 * @param {Request} req
 * @param {Response} res
 * @param {callback} finished called when the plugin is done
 */
ChargeLookup.prototype.handleEvent = function ( 
    event, session, req, res, finished ) {
  console.log("ChargeLookup.handleEvent");

  // Fetch and if necesary initialize app session
  if (!session.refund_status) session.refund_status = {};
  var appSession = session.refund_status; 
  if (!appSession.state) appSession.state = START_STATE;

  // Save the answer to the current state
  var gotValidInput = false;
  if (event.message && event.message.text) {
    // Give user a chance to hijack the flow before doing the default
    if ( event.message.text === "reset" ) { 
      console.log("Resetting lookup_charge session");
      session.refund_status = {state:START_STATE};
    } else {
      appSession[appSession.state] = event.message.text;
      // TODO: Make real validation
      gotValidInput = true;
    }
  }

  // If we received valid input then store it
  if ( gotValidInput ) {
    // We can move on to the next state
    appSession.state = this.states[appSession.state].next;
    console.log("Changing to state",appSession.state);
  } else {
    // Probably already handled above
    console.error("Ignoring input");
  }

  if ( appSession.state === 'finished' ) {
    console.log("Sending receipt");
    this.messenger.sendReceipt( event.sender.id, req, res );
    // Tell our caller we're done and let it clean up
    console.log("Returning to caller");
    finished(session);
    return;
  } else
  if ( appSession.state && this.states[appSession.state] ) {
    console.log("Asking user for",appSession.state);
    // We have state and it's valid
    // Send prompt to user for next piece of input
    this.messenger.sendTextMessage(
      this.states[appSession.state].prompt, event.sender.id, req, res );
  } else {
    // Where are we?
    console.error("Unknown state",session);
    finished(session);
    return;
  }
};



