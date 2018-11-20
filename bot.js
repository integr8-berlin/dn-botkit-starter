/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var Botkit = require('botkit');
var debug = require('debug')('botkit:main');

var bot_options = {
	replyWithTyping: true,
	typingDelayFactor: 1.2,
	debug: true
};

// Create the Botkit controller, which controls all instances of the bot. (for platform WEB it can also be declared as Botkit.socketbot(bot_options))
var controller = Botkit.anywhere(bot_options);

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + '/components/express_webserver.js')(controller);

// Load in some helpers that make running Botkit on Glitch.com better
require(__dirname + '/components/plugin_glitch.js')(controller);

// Load in a plugin that defines the bot's identity
require(__dirname + '/components/plugin_identity.js')(controller);

// Open the web socket server
controller.openSocketServer(controller.httpserver);

// Start the bot brain in motion!!
controller.startTicking();

/* 
	Loads the example flow #exampleNum from the skills folder.
*/
let exampleNum = 1;
try {
	require(`./skills/example${exampleNum}`)(controller);
} catch (err) {
	console.warn(
		`*** Example number ${exampleNum} does not exist. Take a look in the 'skills' folder and change the 'exampleNum' variable to a correct value. ***`
	);
}
console.log('I AM ONLINE! COME TALK TO ME: http://localhost:' + (process.env.PORT || 3000));
