/**
  MESSAGE ROUTER
  ==============
  REQUIRED SCOPE: bot,channels.history,chat:write:bot,chat:write:user
  OPTIONAL SCOPE: files:write:user

  This will route channel messages to their appropriate subtype
  If no subtype is provided, this is also the handler for generic channel messages

  A list of subtypes and details on the {event} object can be found at:
    https://api.slack.com/events/message

  The resultant callback used /slack/utils/message.js to send, you can send
    text which will be auto-formatted or an object that follow the
    chat.postMessage specification listed here:
      https://api.slack.com/methods/chat.postMessage
*/

/**
* @param {String} token The bot token for the Slack App
* @param {Object} event The event data as passed from Slack
* @param {String} text Shortcut to event.text
* @param {Function} callback Callback to execute upon completion, sends message
*/
function MessageEventHandler(token, event, text, callback) {

  return callback(null);

};

module.exports = MessageEventHandler;
