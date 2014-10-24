// CONFIGURACION
// ==============================================================================

// modulos
var https      = require("https");
var url        = require("url");
var express    = require('express');
var redis      = require('redis');
var session    = require('express-session');
var redisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var client     = redis.createClient();
var app        = express(); 

var contador = 0;

app.use(session(
	{
		secret: 'hernanm992', 
		store: new redisStore({ host: 'localhost', port: 6379, client: client }),
		saveUninitialized: false, 
		resave: false 
	}
));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; //puerto de escucha

// RUTAS
// =============================================================================
var router = express.Router(); // instancia del router express

// middleware to use for all requests
router.use(function(req, res, next) {
	//guardo y checkeo en la base de datos
	var ip = getRequestIP(req);
	var pathname = url.parse(req.url).pathname;
	console.log(ip);
	console.log(pathname);

	var key = ip + ':' + pathname;
	//console.log(client.hget(key, 'contador'));
    /*
    client.hget(key, 'contador', function (err, reply) {
    	if (typeof reply !== 'undefined' && reply){
    		console.log('reply: ' + reply);
    		contador = parseInt(reply) + 1;
    	}else{
    		console.log('reply: ' + reply);
    		contador = 1;
    	}
    });*/
	/*client.hmset(key, 'ip', ip, 'url', pathname, function (err, reply) {
        console.log(err);
    });*/
    
    client.hmset(key, 'ip', ip, 'url', pathname);
    client.hmset(ip, 'ip', ip, 'url', pathname);
    client.hmset(pathname, 'ip', ip, 'url', pathname);

    client.hincrby(key, 'contador', 1);
    client.hincrby(ip, 'contador', 1);
    client.hincrby(pathname, 'contador', 1);
    //se pueden meter en listas?

    //console.log('key' + client.hget(key, 'contador'));
    //console.log('ip' + client.hget(ip, 'contador'));
    //console.log('url' + client.hget(pathname, 'contador'));

    client.hget(key, 'contador', function (err, reply) {
        console.log('key' + reply);
    });
    client.hget(ip, 'contador', function (err, reply) {
        console.log('ip' + reply);
    });
    client.hget(pathname, 'contador', function (err, reply) {
        console.log('url' + reply);
    });


    //client.zadd(pathname, );



	//pruebo settear un valor
    client.set(ip, pathname, function (err, reply) {
        console.log(reply.toString());
    });
    //pruebo obtener el valor
    client.get(ip, function (err, reply) {
        console.log(reply.toString());
    });

	console.log('Something is happening.');
	next(); // make sure we go to the next routes and don't stop here
});


router.get('/', function(req, res) {
	res.json({ message: 'Welcome to MELI-PROXY' });
        res.write("MELI-PROXY");	
});

// rutas para pegarle a la api
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
	})
	// POST
	.post(function(req, res) {
		
        res.json({ message: 'POST to /' + req.params.param1 });
		
	});

router.route('/:param1/:param2')
	.get(function(req, res) {
		  https.globalAgent.options.secureProtocol = 'SSLv3_method';

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
		  https.globalAgent.options.secureProtocol = 'SSLv3_method';

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

// todas las rutas van a arrancar con /api
app.use('/api', router);

// INICIO DEL SERVIDOR
// =============================================================================
app.listen(port);
console.log('Listening on port ' + port);

function getRequestIP(request){
  return (request.headers['x-forwarded-for'] || '').split(',')[0] 
        || request.connection.remoteAddress;
}
