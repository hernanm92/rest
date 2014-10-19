// BASE SETUP
// ==============================================================================

// call the packages we need
var https      = require("https");
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');

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
	// do logging
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
router.route('/categories')

	// GET categories
	.get(function(req, res) {
		
        res.json({ message: 'GET to categories' });
		
	})

    // POST categories
	.post(function(req, res) {
		
        res.json({ message: 'POST to categories' });
		
	});

// on routes that end in /bears/:bear_id
// ----------------------------------------------------
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
		      res.writeHead(200, {"Content-Type": "text/html"});
		      res.write(data);
		      res.end();
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
