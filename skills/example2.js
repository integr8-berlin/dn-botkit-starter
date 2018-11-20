/* 
	Example2: 
		- updated example1 with Google DialogFlow NLP
		- trigger conversation start by typing a greeting (e.g. hello, hi, hey ...)
		- after the conversation you can still have small talk with the bot
*/

/* DialogFlow Middleware Configuration */
const dialogflowMiddleware = require('botkit-middleware-dialogflow')({
	keyFilename: './demo-test-263f2-22130879135f.json' // service account private key file from Google Cloud Console
});

module.exports = controller => {
	function example2(bot, message) {
		/* start a new convo */
		bot.startConversation(message, function(err, convo) {
			/* add message to the 'default' thread and trigger the 'age' thread */
			convo.addMessage(
				{
					text: "Welcome to the 'default' thread! I will now navigate to the 'age' thread!",
					action: 'age'
				},
				'default'
			);

			/* add question to the 'age' thread */
			convo.addQuestion(
				{ text: 'How young are you?', input_visibility: true },
				function(response, convo) {
					/* response.text holds the user's message input */
					let age = response.text;

					if (isNaN(age)) {
						convo.transitionTo(
							'age',
							`${response.fulfillment.text} Please type in a number!`
						); /* the same behaviour can be achieved using bot.reply() + convo.repeat() */

						convo.next();
					} else {
						age = parseInt(age);

						if (age > 0 && age < 65) {
							/* reply with the typing delay */
							bot.replyWithTyping(message, "You're pretty young!", (err, response) => {
								bot.replyWithTyping(message, 'Bye bye!');
							});

							convo.stop();
						} else if (age >= 65 && age <= 123) {
							bot.replyWithTyping(
								message,
								"You're not old! You are level " + age + '!',
								(err, response) => {
									bot.replyWithTyping(message, 'Bye bye!');
								}
							);

							convo.stop();
						} else {
							convo.transitionTo(
								'age',
								"Hmm ... didn't know this age was possible ..."
							); /* the same behaviour can be achieved using bot.reply() + convo.repeat() */

							convo.next();
						}
					}
				},
				{},
				'age'
			);
		});
	}

	/* Bind the Botkit's controller with the Dialogflow Middleware */
	controller.middleware.receive.use(dialogflowMiddleware.receive);

	/* Trigger the flow by hearing to a specific intent */
	controller.hears('smalltalk.greetings.hello', 'message_received', dialogflowMiddleware.hears, example2);

	/* Fallback handled by Dialogflow */
	controller.on('message_received', function(bot, message) {
		bot.replyWithTyping(message, message.fulfillment.text);
	});
};
