iframeElement = document.querySelector('iframe');
// iframeElement.src = 'https://storage.googleapis.com/aso-tool-box-staging/frame-level2.html' + location.search + '&v=1169    ';
iframeElement.src = 'https://storage.googleapis.com/aso-tool-box/frame-level2.html' + location.search + '&v=1169';

const receiveMessage = (event) => {
	window.parent.postMessage( event.data, '*');
};

window.addEventListener('message', receiveMessage, false);