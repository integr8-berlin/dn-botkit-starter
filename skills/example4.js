/* 
	Example4: 
		- simple flow that asks the user a question and sends a pre-defined reply
*/
module.exports = controller => {
	function example4(bot, message) {
		/* start a new convo */
		bot.startConversation(message, function(err, convo) {
			convo.addMessage(
				{
					text: 'Hi there!',
					action: 'how-are-you',
					typingDelay: 1000
				},
				'default'
			);

			convo.addQuestion(
				{ text: 'How are you?', typingDelay: 1500 },
				function(response, convo) {
					bot.replyWithTyping(message, 'I am glad to hear that! See you! :)', (err, response) => {
						convo.stop();
					});
				},
				{},
				'how-are-you'
			);
		});
	}

	/* 	Listen for the first event that is sent when the front-end WebSocket
		connection is established */
	controller.on(['hello', 'welcome_back', 'reconnect'], example4);

	/* 	Fallback - triggers on each user's message that the bot receives 
		WHEN and IF we're outside of the convo, e.g. after convo.stop()) */
	controller.on('message_received', function(bot, message) {
		bot.replyWithTyping(message, "That's it for this example.");
	});
};
