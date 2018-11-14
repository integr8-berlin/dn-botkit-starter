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
							"I'm not that easy to fool. Type in a number!"
						); /* the same behaviour can be achieved using bot.reply() + convo.repeat() */

						convo.next();
					} else {
						age = parseInt(age);

						if (age < 65) {
							/* reply with the typing delay */
							bot.replyWithTyping(message, "You're pretty young!", (err, response) => {
								bot.replyWithTyping(message, 'Bye bye!');
							});

							convo.stop();
						} else {
							bot.replyWithTyping(
								message,
								"You're not old! You are level " + age + '!',
								(err, response) => {
									bot.replyWithTyping(message, 'Bye bye!');
								}
							);

							convo.stop();
						}
					}
				},
				{},
				'age'
			);
		});
	}

	controller.on(['hello', 'welcome_back'], example1);

	controller.on('message_received', function(bot, message) {
		bot.replyWithTyping(message, "That's it for this example.");
	});
};
