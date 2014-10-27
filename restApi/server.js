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
/*
router.on('connection', function (sock) {
  console.log(sock.remoteAddress);
  // Put your logic for what to do next based on that remote address here
});
*/
// middleware to use for all requests
router.use(function(req, res, next) {

	//guardo y checkeo en la base de datos
	var ip = getRequestIP(req);
	var pathname = url.parse(req.url).pathname;
	console.log(ip);
	console.log(pathname);

	var key = ip + ':' + pathname;

	var ipBlock = ip + ':block';
	//var pathBlock = pathname + ':block';
	var keyBlock = key + ':block';

	var block = 0;

	client.get(ipBlock, function (err, reply) {
        if (typeof "1" == typeof reply) { //string
        	res.json({ message: 'Your IP has been block' });
            res.end();
            block = 1;
        }
    });
    client.get(pathBlock, function (err, reply) {
        if (typeof "1" == typeof reply) { //string
        	res.json({ message: 'Your IP has been block' });
            res.end();
            block = 1;
        }
    });
    client.get(keyBlock, function (err, reply) {
        if (typeof "1" == typeof reply) { //string
        	res.json({ message: 'Your IP has been block' });
            res.end();
            block = 1;
        }
    });

    if(block == 0){//si el request esta bloqueado, no hace nada

		var ipExpire = ip + ':expire';
		//var pathnameExpire = pathname + ':expire';
		var keyExpire = key + ':expire';

		client.get(ipExpire, function (err, reply) {
			console.log(reply);
	        if(reply){
	            if(parseInt(reply) >= 5){
	            	client.set(ipBlock, 1);
	            }
	        }else{
	        	client.set(ipExpire, 0);
	        	client.expire(ipExpire, 40);
	        }
	    });
	    client.incr(ipExpire);
	    client.get(ipExpire, function (err, reply) {
	        console.log('ipExpire: ' + reply);
	    });

		client.get(keyExpire, function (err, reply) {
			console.log(reply);
	        if(reply){

	        }else{
	        	client.set(keyExpire, 0);
	        	client.expire(keyExpire, 40);
	        }
	    });
	    client.incr(keyExpire);
	    client.get(keyExpire, function (err, reply) {
	        console.log('keyExpire: ' + reply);
	    });    

	    client.incr(key);
	    client.incr(ip);
	    client.incr(pathname);
	    //se pueden meter en listas?

	    //console.log('key' + client.hget(key, 'contador'));
	    //console.log('ip' + client.hget(ip, 'contador'));
	    //console.log('url' + client.hget(pathname, 'contador'));

	    client.get(key, function (err, reply) {
	        console.log('key: ' + reply);
	    });
	    client.get(ip, function (err, reply) {
	        console.log('ip: ' + reply);
	    });
	    client.get(pathname, function (err, reply) {
	        console.log('url: ' + reply);
	    });

	    //client.zadd(pathname, );

		console.log('Something is happening.');
		next(); // make sure we go to the next routes and don't stop here
	} 
});


router.get('/', function(req, res) {
	res.json({ message: 'Welcome to MELI-PROXY' });
        res.write("MELI-PROXY");	
});

// rutas para pegarle a la api
// ----------------------------------------------------
router.route('/:param1/estadisticas')
	.get(function(req, res) {
		res.json({ message: 'Voy a mostrar estadisticas' });
	});

router.route('/:param1/:param2/estadisticas')
	.get(function(req, res) {
		res.json({ message: 'Voy a mostrar estadisticas' });
	});

router.route('/:param1/:param2/:param3/estadisticas')
	.get(function(req, res) {
		res.json({ message: 'Voy a mostrar estadisticas' });
	});		

router.route('/:param1')
	.get(function(req, res) {
		var getPath = '/' + req.params.param1;
		getRequestFunction(req, res, getPath);
	})
	// POST
	.post(function(req, res) {
        res.json({ message: 'POST to /' + req.params.param1 });
	});

router.route('/:param1/:param2')
	.get(function(req, res) {
		var getPath = '/' + req.params.param1 + '/' + req.params.param2;
		getRequestFunction(req, res, getPath);
	});	

router.route('/:param1/:param2/:param3')
	.get(function(req, res) {
		var getPath = '/' + req.params.param1 + '/' + req.params.param2 + '/' + req.params.param3;
		getRequestFunction(req, res, getPath);
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

function getRequestFunction(req, res, getPath){
	var info = '';
	https.globalAgent.options.secureProtocol = 'SSLv3_method';

	var options = {
	  headers: {
	    accept: '*/*'
	  },
	  host: 'api.mercadolibre.com',
	  port: 443,
	  path: getPath,
	  method: 'GET'
	};

	var request = https.request(options, function(response) {
	  console.log(response.statusCode);
	  response.on('data', function(data) {
	    info += data;
	  });
	  response.on('end', function(){
	    res.send(JSON.parse(info));
	  });
	  response.on('error', function(error){
	    console.error(error);
	  });
	});
	request.end();

	request.on('error', function(error) {
	  console.error(error);
	});	

}

function expire(){

}
