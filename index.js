function init() {

	function createAndAddClass(elemType, classType) {
		const elem = document.createElement(elemType);
		elem.classList.add(classType);
		return elem;
	}

	let count = 0;
	const plusSign = document.getElementById('plus');

	// Building HTML and initializing event listeners
	plusSign.addEventListener('click', () => {

		let counter = count += 1;

		const wrapper = createAndAddClass('div', 'chat-wrapper');
		wrapper.setAttribute('data-index', `${counter}`);

		const heading = document.createElement('h1');
		const title = document.createTextNode(`iFrame_${counter}`);
		heading.appendChild(title);

		const close = createAndAddClass('div', 'close');

		const iframe = createAndAddClass('iframe', 'chat');
		iframe.setAttribute('name', `iFrame_${counter}`);
		iframe.src = "./iframe.html";

		const iframeWrapper = createAndAddClass('div', 'iframe-wrapper');

		const iFrameEvent = createAndAddClass('div', 'iframe-events-cover');

		iframeWrapper.appendChild(iframe);

		wrapper.appendChild(heading);
		wrapper.appendChild(close);
		wrapper.appendChild(iframeWrapper);
		wrapper.appendChild(iFrameEvent);

		document.body.appendChild(wrapper);

		setTimeout(() => {
			wrapper.classList.add('fade-on-start');
		}, 225);

		setMouseDownEvent();
		setCloseEvent();
	});

	let messages = [];
	// Push each message from a child window into an array then send the array back down to the children
	window.addEventListener('message', (e) => {
		messages.push(e.data);
		const frames = document.getElementsByTagName('iframe');
		for (var i = 0; i < frames.length; i++) {
			frames[i].contentWindow.postMessage(messages, '*');
		};
	}, false);
	// Making sure elems don't have duplicate event listeners
	function setMouseDownEvent() {
		const chatElements = document.getElementsByClassName('chat-wrapper');
		for (var i = 0; i < chatElements.length; i++) {
			chatElements[i].removeEventListener('mousedown', mouseDown, false);
			chatElements[i].removeEventListener('touchstart', mouseDown, false);
			chatElements[i].addEventListener('mousedown', mouseDown, false);
			chatElements[i].addEventListener('touchstart', mouseDown, false);
		};
	}

	let z = 3;
	// z continues to count so that clicked window stays in front
	function mouseDown(e) {

		e.preventDefault();
		// Naming functions and bind to be able to remove it later
		const move = chatMove.bind(this);
		this.move = move;
		const up = mouseUp.bind(this);
		this.up = up;

		this.style.zIndex = `${z+=1}`;
		// Initialization for drag window support (also supporting mobile browsers via touches)
		if (e.touches) {
			this.left = e.touches[0].clientX - this.offsetLeft;
			this.top = e.touches[0].clientY - this.offsetTop;
		} else {
			this.left = e.clientX - this.offsetLeft;
			this.top = e.clientY - this.offsetTop;
		};
		// This is so that transition function doesn't get called on every mouseMove - only once
		if (this.has_been_called !== true) {
			this.has_been_called = false;
		};

		window.addEventListener('mousemove', move, false);
		window.addEventListener('touchmove', move, false);
		window.addEventListener('mouseup', up, false);
		window.addEventListener('touchend', up, false);

	

		coverIframeWindows();
		
	}
	// This is an edge case - if pointer happens to be in iFrame window on mouseUp, it steals the event from parent window - so this covers all iFrame windows until mouseUp
	function coverIframeWindows() {
		let iframeCover = document.getElementsByClassName('iframe-events-cover');
		for (var i = 0; i < iframeCover.length; i++) {
			iframeCover[i].style.zIndex = "2";
		};
	}
	// Drag chat window
	function chatMove(e) {

		e.preventDefault();

		let offset_x;
		let offset_y;

		if (e.touches) {
			offset_x = e.touches[0].clientX - this.left - 10;
			offset_y = e.touches[0].clientY - this.top - 10;
		} else {
			offset_x = e.clientX - this.left - 10;
			offset_y = e.clientY - this.top - 10;
		};

		this.style.position = 'absolute';
		this.style.top = offset_y + 'px';
		this.style.left = offset_x + 'px';

	}

	function mouseUp(e) {

	    window.removeEventListener('mousemove', this.move, false);
	    window.removeEventListener('touchmove', this.move, false);

	    //Styling

		uncoverIframeWindows();

		window.removeEventListener('mouseup', this.up, false);
		window.removeEventListener('touchend', this.up, false);

	}

	function uncoverIframeWindows() {
		let iframeCover = document.getElementsByClassName('iframe-events-cover');
		for (var i = 0; i < iframeCover.length; i++) {
			iframeCover[i].style.zIndex = "0";
		};
	}

	function setCloseEvent() {
		const close_buttons = document.getElementsByClassName('close');
		for (var i = 0; i < close_buttons.length; i++) {
			close_buttons[i].removeEventListener('mousedown', mouseDownClose, false);
			close_buttons[i].removeEventListener('touchstart', mouseDownClose, false);
			close_buttons[i].addEventListener('mousedown', mouseDownClose, false);
			close_buttons[i].addEventListener('touchstart', mouseDownClose, false);
		};
	}
	// Close this window and leave conversation
	function mouseDownClose(e) {
		e.stopPropagation();

		const to_remove = this.parentNode;
		const frame_name = to_remove.firstChild.innerHTML;

		to_remove.classList.remove('fade-on-start');

		setTimeout(() => {
			
			to_remove.parentNode.removeChild(to_remove);

			if (to_remove.has_been_called !== true) {
				const chatElements = document.getElementsByClassName('chat-wrapper');
				for (var i = 0; i < chatElements.length; i++) {
					if (chatElements[i].dataset.called !== 'true' && parseInt(chatElements[i].dataset.index) > parseInt(to_remove.dataset.index)) {
						chatElements[i].classList.add('fade');
					};
				};
				setTimeout(() => {
					for (var i = 0; i < chatElements.length; i++) {
						chatElements[i].classList.remove('fade');
					};
				}, 110);

			};
			// Send message to children that this iframe has left the conversation on close
			messages.push(`[system] - ${frame_name} left the conversation.`);
			const frames = document.getElementsByTagName('iframe');
			for (var i = 0; i < frames.length; i++) {
				frames[i].contentWindow.postMessage(messages, '*');
			};

		}, 100);

	}

}
