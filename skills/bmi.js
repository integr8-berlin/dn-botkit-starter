/* 
	Example4: 
		- simple flow that asks the user a question and sends a pre-defined reply
*/
module.exports = controller => {
	function bmi(bot, message) {
		/* start a new convo */
		bot.startConversation(message, function(err, convo) {
			convo.addMessage(
				{
					text: 'Hi there! I will tel you your BMI.',
					action: 'weight',
					typingDelay: 1000
				},
				'default'
			);

			convo.addQuestion(
				{ text: 'Type in your weight in kilograms.', typingDelay: 1500 },
				function(response, convo) {
					let weight = parseInt(response.text);
					convo.setVar('userWeight', weight);
					convo.gotoThread('height');
					convo.next();
				},
				{},
				'weight'
			);

			convo.addQuestion(
				{ text: 'Type in your height in centimeters.', typingDelay: 1500 },
				function(response, convo) {
					let height = parseInt(response.text);
					convo.setVar('userHeight', height);
					convo.gotoThread('result');
					convo.next();
				},
				{},
				'height'
			);

			convo.beforeThread('result', (convo, next) => {
				let bmi = (convo.vars.userWeight / (convo.vars.userHeight / 100) ** 2).toFixed(1);
				convo.setVar('resultBmi', bmi);
				next();
			});

			convo.addMessage(
				{
					text: `Your BMI is {{vars.resultBmi}}.`
				},
				'result'
			);
		});
	}

	/* 	Listen for the first event that is sent when the front-end WebSocket
		connection is established */
	controller.on(['hello', 'welcome_back', 'reconnect'], bmi);

	/* 	Fallback - triggers on each user's message that the bot receives 
		WHEN and IF we're outside of the convo, e.g. after convo.stop()) */
	controller.on('message_received', function(bot, message) {
		bot.replyWithTyping(message, "That's it for this example.");
	});
};
