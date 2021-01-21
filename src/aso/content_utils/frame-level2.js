const APIURL = 'https://api.storemaven.com';
// const APIURL = 'https://api.topappsblog.com';


function getStoreUrl(){
	console.log('frame.js getStoreUrl', location.search );

	let argsString = location.search.replace('?', ''),
		args = argsString.split('&'),
		argsJson = {};

	for( a of args ){
		let v = a.split('=');
		argsJson[v[0]] = v[1];
	}
	console.log('frame.js argsJson', argsJson );

	return `${APIURL}/app/serve/toolbox/${argsJson.device}/${argsJson.forceLang}/
	${argsJson.appId}/${argsJson.forceDevice}?forceDevice=${argsJson.forceDevice}
	&BigGalleryDisable=true&deviceWidth=${argsJson.deviceWidth}&forceLang=
	${argsJson.forceLang}`;
}

function injectStoreToIFrame( response ){
	console.log('frame.js injectStoreToIFrame' );
	const iframeElement = document.querySelector('iframe');
	iframeElement.contentDocument.write(response);
}

function makeGetRequest(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      // xhr.setRequestHeader("X-AF-AUTH", "ANYONE");
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(new Error(xhr.statusText));
        }
      };
      xhr.onerror = () => {
        reject(new Error(xhr.statusText));
      };
      xhr.send();
    });
  }


function importStore(){
	const url = getStoreUrl();
	makeGetRequest(url).then(response => {
    injectStoreToIFrame(response);
    window.parent.postMessage({ msg: 'importStore.success', url: url }, '*');
  }, error => {
    window.parent.postMessage({ msg: 'importStore.failed', url: url, response: JSON.stringify(error) }, '*');
  });
}



const receiveMessage = (event) => {
  window.parent.postMessage( event.data, '*');
};

window.addEventListener('message', receiveMessage, false);

importStore();
