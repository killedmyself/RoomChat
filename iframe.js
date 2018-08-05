function init() {

	const form = document.getElementById('form');
	const message = document.getElementById('message');
	const send = document.getElementsByClassName('btn');

	setTimeout(() => {
		parent.postMessage(`[system] - ${window.name} joined the conversation.`, '*');
	}, 225);
	// Sending message from this child up to parent
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		// Don't send message if input is blank
		if (message.value !== '') {

			const name = window.name;
			parent.postMessage(`${name}: ${message.value}`, '*');
			message.value = '';
			// Disable button again after submit
			send[0].classList.remove('ready');

		};

	});
	// Array of messages from everyone sent back down here from parent window
	window.addEventListener('message', (e) => {
		const output = document.getElementById('output');
		output.innerHTML = e.data.join('<br>');
		// Keep messages scrolled to bottom / most recent message
		const convo_box = document.getElementById('convo-container');
		convo_box.scrollTo(0, output.offsetHeight);
	}, false);
	// If input is blank disable send button
	message.onkeyup = (e) => {
		if (message.value.length > 0) {

			send[0].classList.add('ready');
		};
		let key = e.keyCode || e.charCode;
		if ((key === 8 || key === 46) && message.value.length === 0) {
			send[0].classList.remove('ready');
		};
	};

}