# Your StdLib Slack App

Welcome to your StdLib Slack template! Here we'll walk you through how
StdLib works, your Slack endpoints, and how to handle Slack Events.

# Your Project

The first thing you'll probably notice is your `f/` directory. This is your
StdLib function directory which maps directly to HTTP endpoints. There are
five main functions in your Slack App:

- main
- auth
- commands
- events
- handler

We'll go through these in the order listed here.

## Function: f/main

This is your main endpoint, corresponding to `https://username.stdlib.com/service`
or (to be explicit) `https://username.stdlib.com/service/main`. This is, of
course, where `username` is your username and `service` is your service name.

Note that when pushing to a development environment (or if you want to access
  a specific version), this should be reached via:
  `https://username.stdlib.com/service@dev/main` (if your dev environment is called
    `dev`, also the default local environment name) or
    `https://username.stdlib.com/service@0.0.0/main` (if your version is 0.0.0).

The `main` can likely be omitted as it's probably specified as a
`defaultFunction` in your service based on the `stdlib: defaultFunction` field
in your `package.json`. (The same is not true of other functions.)

### Usage

This endpoint generates a template based on the contents of `slack/pages/auth.ejs`,
which is modifiable and contains your "Add to Slack" button. It is the easiest
way to distribute your app to other users.

## Function: f/auth

This is the OAuth endpoint for your Slack App that verifies another team (or your
  own) has properly validated the slack app.

### Usage

This endpoint processes an OAuth request and returns the contents of
`slack/pages/authorized.ejs`. (Typically "Success!" if successful.)

## Function: f/commands

This is the main **Command Handler** function for handling Slack Slash Commands.
You can read more about them here: https://api.slack.com/slash-commands

It triggers the `f/handler` function with appropriate `command` details,
asynchronously. Its goal is to return a 200 OK response as quickly
as possible to avoid command handling duplication, and offload async (longer)
requests to the logic you've custom-written.

### Usage

To add or modify Slash commands, you'll want to look in the directory
`slack/commands/` and create files with the name
`slack/commands/COMMAND_NAME.js` where `COMMAND_NAME` is your intended command,
and also add them to your Slash Commands list via Slack's Slash Command interface.

Please note that the functionality here can be traced to
`/slack/handlers/command_handler.js`.

For the default "hello" command (should be added as `/hello` to your app) you'll
notice the following boilerplate code:

```javascript
function HelloCommandHandler(token, command, text, reply, callback) {

  reply(`Hello, <@${command.user}>...`, (err, result) => {

    return callback(null, `You said: ${text}`);

  });

};

module.exports = HelloCommandHandler;
```

In this case, `token` is the bot token you wish to respond with (set up
  as long as you've enabled a bot account on your team), `command` is an
  Object containing the command details (information available
    [here](https://api.slack.com/slash-commands)), `text` is the text content
    following the command call (e.g. `hi you` from `/hello hi you`),
    `reply` is a function that automatically `HTTP POST`s a message to the
    command callback url, and `callback` is a function expecting two parameters
    (`err, text`) which can return an error if `err` is specified, or calls
    `reply` by default when `text` is specified.

Please note that for both `reply` and `callback`, the `text` variable can be an
Object mapping to the chat.postMessage expected object (https://api.slack.com/methods/chat.postMessage)
if you want more finely-tuned control over your response.

## Function: f/events

This is the main **Event Handler** function for handling public channel events
from Slack's Event API: https://api.slack.com/events

It triggers the `f/handler` function with appropriate `event` details,
asynchronously. Its goal is to return a 200 OK response as quickly
as possible to avoid command handling duplication, and offload async (longer)
requests to the logic you've custom-written.

### Usage

The default usage from the template provided is to handle channel messages.
Channel event types (as specified by https://api.slack.com/events) will be
delegated by `slack/handlers/event_handler.js` to the appropriate folder
in `slack/events/`, in the case of a `message` event this would be:
`slack/events/message`. Note there is a `handler.js` in `/slack/events/message/`
to handle an event if there is no `subtype` (like a `bot_message`), or delegate
to the appropriate subtype in `slack/events/message/subtypes/`.

By default your `slack/events/message/handler.js` should look like this:

```javascript
function MessageEventHandler(token, event, text, callback) {

  // Handle subtype if available, otherwise do nothing
  if (event.subtype) {

    return subtypes[event.subtype] ? subtypes[event.subtype](token, event, text, callback) : callback();

  }

  // Otherwise, handle as a plain message
  if (!text) {
    return callback(new Error('No message data'));
  }

  if (!text.match(/hi|hello|sup|hey/)) {
    return callback(new Error('Command not recognized'));
  }

  return callback(null, `Hey there! <@${event.user}> said ${text}`);

};

module.exports = MessageEventHandler;
```

We can see that if a subtype is provided, we delegate to that subtype (default
  included is `channel_join`), otherwise, handle it as a typical channel message.

This handler receives four variables: `token`, `event`, `text`, and `callback`.

Please note that there is no `reply` function as is standard with Slash Commands,
as Slack does not provide a URL to `HTTP POST` to in this case --- your bot
will have to speak on its own.

In this case, `token` is your bot token (assuming you've set up a bot),
`event` is the event object (https://api.slack.com/events), `text` is the
text content of the message, and `callback` is a function that should be
invoked to end the bot's response expecting `err, text` (see: Slash Command
  `callback` above for usage expectations re: `chat.postMessage`.)

# Utilities

This Slack App template comes with some utility function in `slack/utils`.
We'll go over a few of them;

- message.js
- respond.js
- upload.js
- storage.js

## Utility: message.js

This function has a fingerprint of:

```javascript
module.exports = (token, channel, text, callback) => {}
```

Where `token` is your bot token (the token used for the bot response),
`channel` as the channel where the response is expected, `text` being a
string or `channel.postMessage` object (for more granular control),
and `callback` being a function expecting one parameter (an `error`, if applicable)
that executes the call.

Use this function to get your bot to send messages to users or channels --- that's
it. The `token` field should be passed in any `slack/commands` or `slack/events`
handlers.

## Utility: respond.js

Very similar to `message.js`, this is a Slash Command response that `HTTP POST`s
a message to a webhook endpoint instead of creating a new bot message directly.

The benefits this has over `message.js`, is that Slash Commands can be used in
private channels (or globally, within a team) where applicable.

## Utility: upload.js

Similar to `message.js`, this function has a fingerprint of:

```javascript
module.exports = (token, channel, filename, contentType, file, callback) => {}
```

Where `token` is your bot token, `channel` is the channel to upload a file to,
`filename` is the desired filename, `contentType` is the desired content type
(i.e. a string like `image/png`), file is a `Buffer` of file contents
and `callback` is a function that can handle an optional `err` parameter.

## Utility: storage.js

This is a storage utility based upon https://stdlib.com/utils/storage. It
is a basic key-value store that saves crucial team (including bot) details
about each and every team its installed on, specific to the `SLACK_APP_NAME`
field in your `env.json` and your StdLib (https://stdlib.com) account. You
should probably avoid interfacing with this function directly, but it should
be noted that it is *critical* for the ability to install your app on
multiple teams.

# That's it!

Hope that served as a welcoming (though very referential!) introduction to your
Slack App project scaffold on [StdLib](https://stdlib.com) --- happy building!


You
