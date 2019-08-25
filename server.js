var http      = require('http'),
	https     = require('https'),
	fs        = require('fs'),
	faye      = require('faye'),
	fayeRedis = require('faye-redis');

// Configuration options.
var options = {
	logging: process.env.FAYE_LOGGING || 0,
	redisHost: process.env.FAYE_REDIS_HOST || 'redis',
	redisPort: process.env.FAYE_REDIS_PORT ||  6379,
	listenPort: process.env.FAYE_PORT || 4242,
	listenPortSecure: process.env.FAYE_SSL_PORT || 4443,
	mount: process.env.FAYE_MOUNT ||  '/faye',
	timeout: process.env.FAYE_TIMEOUT ||  45,
	sameOriginURL: process.env.FAYE_SAME_ORIGIN_URL || '',
	pushToken: process.env.FAYE_PUSH_TOKEN || '',
	enableSSL: process.env.FAYE_USE_SSL || 0,
};

// We are only concerned with creating push servers, so this is required.
if (options.pushToken.length === 0) {
	console.log('You must supply FAYE_PUSH_TOKEN, pick something strong!');
	process.exit(1);
}

// Adapter configuration.
var bayeux = new faye.NodeAdapter({
	mount: options.mount,
	timeout: options.timeout,
	engine: {
		type: fayeRedis,
		host: options.redisHost,
		port: options.redisPort
	}
});

// Log connection information.
if (options.logging === 1) {
	bayeux.on('handshake', function(clientId) {
		console.log('[' + new Date() + '] Client ID connected: ' + clientId);
	});

	bayeux.on('disconnect', function(clientId) {
		console.log('[' + new Date() + '] Client ID disconnected: ' + clientId);
	});
}

// Extra pre-cautions just to ensure the push originated from our domain.
var sameOrigin = {
	incoming: function(message, request, callback) {
		if (request && request.headers['host'] !== options.sameOriginURL) {
			message.error = '403::Forbidden origin';
		}

	  callback(message);
	}
};

// Since this token is a secret, we are essentially making a push only server
// because without this token you cannot push data to the server.
var ensureAuthToPush = {
	incoming: function(message, callback) {
		if (!message.channel.match(/^\/meta\//)) {
			let pushToken;
			if(message.ext){
				pushToken = message.ext.pushToken || message.ext.auth_token
			}

			if (pushToken !== options.pushToken) {
				message.error = '403::Forbidden auth token';
			}
		}

	  callback(message);
	},
	outgoing: function(message, callback) {
		// Avoid leaking the token to any clients.
		if (message.ext) delete message.ext.pushToken;

		callback(message);
	}
};

// Add our extensions and start the server.
if (options.sameOriginURL.length > 0) {
	bayeux.addExtension(sameOrigin);
}

bayeux.addExtension(ensureAuthToPush);

var app = function (request, response) {
	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.end('42 is the answer to the universe. 3x42s for the 126 (9) or 9 or 0... aka not present.\n');
}

if(options.enableSSL == 1){
	console.log("ssl enabled = " + options.enableSSL);
	var httpsOptions = {
		key: fs.readFileSync("/etc/ssl/certs/faye/" + process.env.SSL_KEY_FILE),
	    cert: fs.readFileSync("/etc/ssl/certs/faye/" + process.env.SSL_CRT_FILE)
	};

	console.log('Listening on port ' + options.listenPortSecure);

	httpsServer = https.createServer(httpsOptions, app);
	httpsServer.listen(options.listenPortSecure);
	bayeux.attach(httpsServer);
} 

console.log('Listening on port ' + options.listenPort);
httpServer = http.createServer(app);
httpServer.listen(options.listenPort);
bayeux.attach(httpServer);

