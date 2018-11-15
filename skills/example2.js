/* dialogflowMiddleware Configuration */
const dialogflowMiddleware = require('botkit-middleware-dialogflow')({
  keyFilename: './demo-test-263f2-22130879135f.json',  // service account private key file from Google Cloud Console
});

module.exports = controller => {
	function example1(bot, message) {
		/* start a new convo */
		bot.startConversation(message, function(err, convo) {
			/* add message to the 'default' thread and trigger the 'age' thread */
			convo.addMessage(
				{
					text: "Welcome to the default thread! I will now navigate to the 'age' thread!",
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

							//dynamical responses
							response.fulfillment.text + " I'm not that easy to fool. Type in a number!"
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
						} else if (age >= 65) {
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

	/* binding Controller with Dialogflow Middleware */
	controller.middleware.receive.use(dialogflowMiddleware.receive);

	/* Trigger the flow by hearing a specific intent */
    controller.hears('smalltalk.greetings.hello', 'message_received', dialogflowMiddleware.hears,  example1 ); 

	/* Fallback handled by Dialogflow */
	controller.on('message_received', function(bot, message) {
		bot.replyWithTyping(message, message.fulfillment.text);
	});
};
