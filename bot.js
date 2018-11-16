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
	studio_token: process.env.studio_token,
	studio_command_uri: process.env.studio_command_uri,
	studio_stats_uri: process.env.studio_command_uri,
	replyWithTyping: true,
	typingDelayFactor: 0.9,
	debug: true
};

// Use a mongo database if specified, otherwise store in a JSON file local to the app.
// Mongo is automatically configured when deploying to Heroku
if (process.env.STARTER_MONGO_URI) {
	// create a custom db access method
	var db = require(__dirname + '/components/database.js')({});
	bot_options.storage = db;
} else {
	bot_options.json_file_store = __dirname + '/.data/db/'; // store user data in a simple JSON format
}

// Create the Botkit controller, which controls all instances of the bot.
var controller = Botkit.socketbot(bot_options);

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
let exampleNum = 3;
require(`./skills/example${exampleNum}`)(controller);

console.log('I AM ONLINE! COME TALK TO ME: http://localhost:' + (process.env.PORT || 3000));

function usage_tip() {
	console.log('~~~~~~~~~~');
	console.log('Botkit Starter Kit');
	console.log('Execute your bot application like this:');
	console.log('npm start');
	console.log('~~~~~~~~~~');
}
