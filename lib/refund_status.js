/**
 * ISTC Refund Status Bot Demo
 * @author Bill Baran
 */
function RefundStatus ( fbmsgr ) {
  this.messenger = fbmsgr;
  console.log("Fbmsgr",fbmsgr);
} 

//Public
module.exports = RefundStatus;

/**
 * All the possible app states.
 */
RefundStatus.prototype.states = {
  // the start state
  clip: { // expecting next input to be clip no.
    prompt:"What are the last 4 digits of your Social Security Number?",
    next:'when'
  },
  when: { // expecting input to be a date
    prompt:"When did you file your taxes?",
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
RefundStatus.prototype.handleEvent = function ( 
    event, session, req, res, finished ) {
  // Fetch and if necesary initialize app session
  if (!session.refund_status) session.refund_status = {};
  var appSession = session.refund_status; 
  if (!appSession.state) appSession.state = this.START_STATE;

  // Save the answer to the current state
  var gotValidInput = false;
  if ( event.message && event.message.text ) {
    // Give user a chance to hijack the flow before doing the default
    if ( event.message.text === "reset" ) { 
      console.log("Resetting refund_state session");
      session.refund_status = {state:START_STATE};
    } else
    if ( event.message.text === "cancel" ) {
      // Nuke our session so we can restart next time
      session.refund_status = null;
      // Tell our caller we're done and let it clean up
      console.log("Returning to caller");
      finished(session);
      return;
    } else {
      appSession[appSession.state] = event.message.text;
      // TODO: Make real validation
      gotValidInput = true;
    }
  }

  // Did we get data from the user?
  if ( gotValidInput ) {
    // We can move on to the next state
    console.log("Changing to state",appSession.state);
    appSession.state = this.states[appSession.state].next;
  } else {
    // Probably already handled above
    console.error("Ignoring input");
  }

  if ( appSession.state === FINAL_STATE ) {
    // We have all the user input and
    // we're ready to perform our ultimate function
    this.messenger.sendTextMessage(
      "Thank you! Here's where you can find out about your return "+
        "http://idaho.gov/"+appSession.clip+"/"+appSession.when+
        "/"+appSession.amount+"/",
      event.sender.id, req, res );
    // Nuke our session so we can restart next time
    session.refund_status = null;
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



