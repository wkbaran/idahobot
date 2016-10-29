Exploration of Facebook Messenger bots.

Bots can be used to
 - Link to information, including secure info by requiring login
 - Trigger a notification
 - Transfer user to another app
 - Initialize a session for an upcoming transaction

This was to explore bots as a ubiquitos app platform that doesn't require 
downloading a domain-specific app, not as a chat-bot.

Simplest Express implementation.
Broken up into 3 'modules': refund_status, lookup_charge, menu
Each module has its own session.

Send a message request (chat) or inbox message to initiate session.
Use 'reset session' to start over.

Used the following to enable the app at FB. After so many failures you'd 
have to re-init:
```sh
curl -X POST "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=EAAYvysDghZAUBAOpZAqx7x765HNbR2pdCRZBMMa6LqOy7fQzB8yhieoHgn0OYmapxAj2NBipA7rltxm2RdcHm78UoTxDViJphhHygGRGYbMUc9mIW9Pu5CZAaRVbWDtyUE6Pa41dpwlJGEZAOQDIB5U6NyNL738pPYtUpBi308gZDZD"'
```
