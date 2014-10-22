// BASE SETUP
// ==============================================================================

// call the packages we need
var https      = require("https");
var url        = require("url");
var express    = require('express'); 		// call express
var redis      = require('redis');
var session    = require('express-session');
var redisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var client     = redis.createClient();
var app        = express(); 				// define our app using express

var contador = 0;

app.use(session(
	{
		secret: 'hernanm992', 
		store: new redisStore({ host: 'localhost', port: 6379, client: client }),
		saveUninitialized: false, // don't create session until something stored,
		resave: false // don't save session if unmodified
	}
));
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; 		// set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
	//guardo y checkeo en la base de datos
	var ip = getRequestIP(req);
	var pathname = url.parse(req.url).pathname;
	console.log(ip);
	console.log(pathname);

	var key = ip + ':' + pathname;
	console.log(client.hget(key, 'contador'));

    client.hget(key, 'contador', function (err, reply) {
        console.log('reply: ' + reply.toString());
        contador = reply + 1;
    });
	client.hmset(key, 'ip', ip, 'url', pathname, 'contador', contador, function (err, reply) {
        console.log(err);
    });

	// Set a value
    client.set(ip, pathname, function (err, reply) {
        console.log(reply.toString());
    });
    // Get a value
    client.get(ip, function (err, reply) {
        console.log(reply.toString());
    });

	console.log('Something is happening.');
	next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'Welcome to MELI-PROXY' });
        res.write("MELI-PROXY");	
});

//var Categories     = require('./app/models/categories');

// more routes for our API will happen here

// on routes that end in /bears
// ----------------------------------------------------

router.route('/:param1')
	.get(function(req, res) {
		  https.globalAgent.options.secureProtocol = 'SSLv3_method'; //para que no me tire error

		  var options = {
		    headers: {
		      accept: '*/*'
		    },
		    host: 'api.mercadolibre.com',
		    port: 443,
		    path: '/' + req.params.param1,
		    method: 'GET'
		  };

		  var request = https.request(options, function(response) {
		    console.log(response.statusCode);
		    response.on('data', function(data) {
		      res.send(JSON.parse(data));
		    });
		  });
		  request.end();

		  request.on('error', function(error) {
		    console.error(error);
		  });
	});	

router.route('/:param1/:param2')
	.get(function(req, res) {
		  https.globalAgent.options.secureProtocol = 'SSLv3_method'; //para que no me tire error

		  var options = {
		    headers: {
		      accept: '*/*'
		    },
		    host: 'api.mercadolibre.com',
		    port: 443,
		    path: '/' + req.params.param1 + '/' + req.params.param2,
		    method: 'GET'
		  };

		  var request = https.request(options, function(response) {
		    console.log(response.statusCode);
		    response.on('data', function(data) {
		      res.send(JSON.parse(data));
		    });
		  });
		  request.end();

		  request.on('error', function(error) {
		    console.error(error);
		  });
	});	

router.route('/:param1/:param2/:param3')
	.get(function(req, res) {
		  https.globalAgent.options.secureProtocol = 'SSLv3_method'; //para que no me tire error

		  var options = {
		    headers: {
		      accept: '*/*'
		    },
		    host: 'api.mercadolibre.com',
		    port: 443,
		    path: '/' + req.params.param1 + '/' + req.params.param2 + '/' + req.params.param3,
		    method: 'GET'
		  };

		  var request = https.request(options, function(response) {
		    console.log(response.statusCode);
		    response.on('data', function(data) {
		      res.send(JSON.parse(data));
		    });
		  });
		  request.end();

		  request.on('error', function(error) {
		    console.error(error);
		  });
	});	

router.route('/categories')

	// GET categories
	.get(function(req, res) {
		
        res.json({ message: 'GET to categories' });
		
	})

    // POST categories (s modo de ejemplo)
	.post(function(req, res) {
		
        res.json({ message: 'POST to categories' });
		
	});

router.route('/categories/:category')
	.get(function(req, res) {
		  https.globalAgent.options.secureProtocol = 'SSLv3_method'; //para que no me tire error

		  var options = {
		    headers: {
		      accept: '*/*'
		    },
		    host: 'api.mercadolibre.com',
		    port: 443,
		    path: '/categories/' + req.params.category,
		    method: 'GET'
		  };

		  var request = https.request(options, function(response) {
		    console.log(response.statusCode);
		    response.on('data', function(data) {
		      res.send(JSON.parse(data));
		    });
		  });
		  request.end();

		  request.on('error', function(error) {
		    console.error(error);
		  });
	});

router.route('/sites')
	.get(function(req, res) {
		  https.globalAgent.options.secureProtocol = 'SSLv3_method'; //para que no me tire error

		  var options = {
		    headers: {
		      accept: '*/*'
		    },
		    host: 'api.mercadolibre.com',
		    port: 443,
		    path: '/sites',
		    method: 'GET'
		  };

		  var request = https.request(options, function(response) {
		    console.log(response.statusCode);
		    response.on('data', function(data) {
		      res.send(JSON.parse(data));
		    });
		  });
		  request.end();

		  request.on('error', function(error) {
		    console.error(error);
		  });
	});	

router.route('/sites/:site')
	.get(function(req, res) {
		  https.globalAgent.options.secureProtocol = 'SSLv3_method'; //para que no me tire error

		  var options = {
		    headers: {
		      accept: '*/*'
		    },
		    host: 'api.mercadolibre.com',
		    port: 443,
		    path: '/sites/' + req.params.site,
		    method: 'GET'
		  };

		  var request = https.request(options, function(response) {
		    console.log(response.statusCode);
		    response.on('data', function(data) {
		      res.send(JSON.parse(data));
		    });
		  });
		  request.end();

		  request.on('error', function(error) {
		    console.error(error);
		  });
	});	

router.route('/sites/:site/categories')
	.get(function(req, res) {
		  https.globalAgent.options.secureProtocol = 'SSLv3_method'; //para que no me tire error

		  var options = {
		    headers: {
		      accept: '*/*'
		    },
		    host: 'api.mercadolibre.com',
		    port: 443,
		    path: '/sites/' + req.params.site + '/categories',
		    method: 'GET'
		  };

		  var request = https.request(options, function(response) {
		    console.log(response.statusCode);
		    response.on('data', function(data) {
		      res.send(JSON.parse(data));
		    });
		  });
		  request.end();

		  request.on('error', function(error) {
		    console.error(error);
		  });
	});		


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Listening on port ' + port);

function getRequestIP(request){ //va a haber que pasarla al requestHandler tambien
  return (request.headers['x-forwarded-for'] || '').split(',')[0] 
        || request.connection.remoteAddress;
}
