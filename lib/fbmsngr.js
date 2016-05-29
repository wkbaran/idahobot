/**
 * Functions for interacting with Facebook Messenger
 * @author Bill Baran bill.baran@gmail.com
 */

var request = require('request');

//Public
module.exports = FBMessenger;

/**
 * Constructor
 * @param tkn String page token assigned by Facebook.
 */
function FBMessenger ( tkn ) {
  this.token = tkn;
}

/**
 * Get the info on a recipient
 */
FBMessenger.prototype.getUserInfo = function ( rcv ) {
  console.log("FBMessenger.getUserInfo");
};

/**
 * Error handler to use when necessary
 */
FBMessenger.prototype.errorHandler = function ( error, res, body ) {
  if (error) {
    console.log('Error sending message: ', error);
  } else if (res.body.error) {
    console.log('Error: ', res.body.error);
  }
};

/**   
 * Send some message a given receiver.
 * All other functions use this one for xmit
 */
FBMessenger.prototype.sendMessage = function ( msg, rcv, req, resp) {
  console.log("FBMessenger.sendMessage");
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:this.token},
    method: 'POST',
    json: {
      recipient: {id:rcv},
      message: msg,
    }
  }, this.errorHandler );
};

/**
 * Send a plain text message
 */
FBMessenger.prototype.sendTextMessage = function(text, rcpt, req, res) {
  console.log("FBMessenger.sendTextMessage");
  messageData = {
    text:text
  };
  this.sendMessage( messageData, rcpt, req, res );
};

/**
 * Render a message with a horizontal list of cards with buttons
 */
FBMessenger.prototype.sendGenericMessage = function(rcv, req, res) {
  console.log("FBMessenger.sendGenericMessage");
  messageData = {
    attachment: {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "First card",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.google.com/",
            "title": "Web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        },{
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
      }
    }
  };
  this.sendMessage( messageData, rcv, req, res );
};

FBMessenger.prototype.sendWelcomeMessage = function(rcv, req, res) {
  console.log("FBMessenger.sendWelcomeMessage");
  messageData = {
    attachment: {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [
        {
          "title":"Welcome to IdahoBot!",
          "subtitle":"Adventures in Living",
          "item_url":"https://idaho.gov",
          "image_url":"https://idahobot.billbaran.us/idaho.png",
          "buttons":[
          {
            "type":"postback",
            "title":"Where's My Refund?",
            "payload":"refund_status"
          },
          {                                                                                 "type":"postback",
            "title":"What's This Charge?",
            "payload":"lookup_charge"
          }
          ]
        }
        ]
      }
    }
  };
  this.sendMessage( messageData, rcv, req, res );
};

/**
 * Send a receipt
 */
FBMessenger.prototype.sendReceipt = function( rcv, req, res ) {
  console.log("FBMessenger.sendReceipt");
  messageData = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"receipt",
        "recipient_name":"Stephane Crozatier",
        "order_number":"12345678902",
        "currency":"USD",
        "payment_method":"Visa 2345",
        "order_url":"http://petersapparel.parseapp.com/order?order_id=123456",
        "timestamp":"1428444852",
        "elements":[
        {
          "title":"Classic White T-Shirt",
          "subtitle":"100% Soft and Luxurious Cotton",
          "quantity":2,
          "price":50,
          "currency":"USD",
          "image_url":"http://petersapparel.parseapp.com/img/whiteshirt.png"
        },
        {
          "title":"Classic Gray T-Shirt",
          "subtitle":"100% Soft and Luxurious Cotton",
          "quantity":1,
          "price":25,
          "currency":"USD",
          "image_url":"http://petersapparel.parseapp.com/img/grayshirt.png"
        }
        ],
        "address":{
          "street_1":"1 Hacker Way",
          "street_2":"",
          "city":"Menlo Park",
          "postal_code":"94025",
          "state":"CA",
          "country":"US"
        },
        "summary":{
          "subtotal":75.00,
          "shipping_cost":4.95,
          "total_tax":6.19,
          "total_cost":56.14
        },
        "adjustments":[
        {
          "name":"New Customer Discount",
          "amount":20
        },
        {
          "name":"$10 Off Coupon",
          "amount":10
        }
        ]
      }
    }
  };
  this.sendMessage( messageData, rcv, req, res );
};

  /**
  * Presumably to send an image but have not been able to get it to work
  */ 
  /**
  this.sendImageFile = function ( imgData, rcv, req, res ) {
    messageData = {
      "attachment":{
        "type":"image",
        "payload":{ }
      }
    };
    sendMessage( messageData, rcv, req, res );
  };
  **/

  /**
  * Send an image by url but haven't been able to get it to work
  */ 
  /**
  this.sendImageUrl = function( imgUrl, rcv, req, res ) {
    messageData = {
      "attachment":{
        "type":"image",
        "payload":{
          // "url":"https://petersapparel.com/img/shirt.png"
          "url":imgUrl
        }
      }
    };
    sendMessage( messageData, rcv, req, res );
  };
  **/


//  };
