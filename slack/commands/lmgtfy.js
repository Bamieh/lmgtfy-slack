var request = require('request');


function urlencode(str) {
  str = escape(str);
  str = str.replace('+', '%2B');
  str = str.replace('%20', '+');
  str = str.replace('*', '%2A');
  str = str.replace('/', '%2F');
  str = str.replace('@', '%40');
  return str;
}

/**
  This is a "lmgtfy" command, responding to "/lmgtfy" based on the filename.
  To test, make sure you add it to the Slash Commands for your bot with "/lmgtfy"
*/

// text is the text content following the command call (e.g. hi you from /hello hi you)

function buildMessage(person, url) {
  return `<@${person}>, please visit this link: ${url}`
}
function HelloCommandHandler(token, command, text, reply, callback) {
  const person = text.split(' ')[0].replace(/@/, '');
  const googleQuery = text.split(' ').splice(1).join(' ');
  
  const lmgtfyURL = `http://letmegooglethatforyou.com/?q=${urlencode(googleQuery)}`
  const tinyURL = `http://tinyurl.com/api-create.php?url=${lmgtfyURL}`;
  

  request(tinyURL, function (error, response, body) {
    const message = buildMessage(person, error? lmgtfyURL : body);

    reply(message, (err, result) => {
      return callback(null);
    });

  });
};

module.exports = HelloCommandHandler;
