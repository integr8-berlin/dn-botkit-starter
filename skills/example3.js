const stringSimilarity = require('string-similarity');
const axios = require('axios');
const inputsToListenFor = ['quote', 'quote please', 'give me a quote', 'I want a quote'];

module.exports = controller => {
	const example3 = (bot, message, fromFallback = false) => {
		/* start a new convo */
		bot.startConversation(message, function(err, convo) {
			/* when we call the example3() from the fallback it will skip to the send-quote thread */
			if (fromFallback) {
				/* hacky way of how to "fake" skip the default thread and start with another one */
				convo.addMessage(
					{
						text: '',
						typingDelay: 0,
						action: 'send-quote'
					},
					'default'
				);
			}

			convo.addMessage(
				{ text: 'Welcome to the inspirational quote bot!', action: 'listen-for-quote' },
				'default'
			);

			convo.addQuestion(
				"Type in 'quote' and you'll receive one right away!",
				function(response, convo) {
					let userInput = response.text;
					let quoteProbability = checkStringSimilarity(userInput, inputsToListenFor);

					if (quoteProbability.rating > 0.5) {
						convo.gotoThread('send-quote');
						convo.next();
					} else {
						convo.repeat();
						convo.next();
					}
				},
				{},
				'listen-for-quote'
			);

			convo.beforeThread('send-quote', async function(convo, next) {
				let quote = await fetchQuote();

				/* Store the current quote to a variable using Botkit's internal "variable store" */
				convo.setVar('currQuote', quote);
				next();
			});

			/* send-quote thread */
			convo.addMessage({ text: "Here's your quote:", delay: 1000 }, 'send-quote');
			convo.addMessage({ text: '{{vars.currQuote}}', action: 'quote-loop', delay: 2000 }, 'send-quote');

			/* quote-loop thread */
			convo.addQuestion(
				{
					text: 'Want another one?',
					quick_replies: [
						{
							title: 'Another one!',
							payload: 'yes'
						},
						{
							title: 'Enough for today...',
							payload: 'no'
						}
					],
					delay: 2000
				},
				[
					{
						pattern: bot.utterances.yes,
						callback: function(response, convo) {
							convo.gotoThread('send-quote');
							convo.next();
						}
					},
					{
						pattern: bot.utterances.no,
						callback: function(response, convo) {
							bot.replyWithTyping(message, 'Perhaps later.');
							convo.next();
						}
					},
					{
						default: true,
						callback: function(response, convo) {
							convo.repeat();
							convo.next();
						}
					}
				],
				{},
				'quote-loop'
			);
		});
	};

	/* Fetch a random quote from the API */
	const fetchQuote = async () => {
		try {
			let randQuote = await axios.get('https://talaikis.com/api/quotes/random/');
			randQuote = randQuote.data;
			return `"${randQuote.quote}" - ${randQuote.author}`;
		} catch (err) {
			console.error('Error sending quote ...');
			return "Sry, I can't seem to find a quote for you right now ...";
		}
	};

	function checkStringSimilarity(srcString, listenArr) {
		if (listenArr.length === 0) return 0;
		let similarity = stringSimilarity.findBestMatch(srcString.toString(), listenArr);
		return similarity.bestMatch;
	}

	/* 	Listen for the first event that is sent when the front-end WebSocket
		connection is established and trigger the flow */
	controller.on(['hello', 'welcome_back'], example3);

	/* 	Fallback - triggers on each user's message that the bot receives 
		WHEN and IF we're outside of the convo, e.g. after convo.stop()) */
	controller.on('message_received', async function(bot, message) {
		let userInput = message.text;
		let quoteProbability = checkStringSimilarity(userInput, inputsToListenFor);
		if (quoteProbability.rating > 0.5) {
			console.log('Calling example!');
			example3(bot, message, true);
		} else {
			bot.replyWithTyping(message, "Emmm, you should rather type in 'quote'.");
		}
	});
};
