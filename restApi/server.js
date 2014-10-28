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
	var pathBlock = pathname + ':block';
	var keyBlock = key + ':block';
        
	client.get(ipBlock, function (err, reply) {
        if (typeof "1" == typeof reply) { //string
        	res.json({ message: 'Your IP has been block' });
            res.end();
        }else{
		    client.get(pathBlock, function (err, reply) {
		        if (typeof "1" == typeof reply) { //string
		        	res.json({ message: 'This url has been block' });
		            res.end();
		        }else{
				    client.get(keyBlock, function (err, reply) {
				        if (typeof "1" == typeof reply) { //string
				        	res.json({ message: 'Your IP has been block for this url' });
				            res.end();
				        }else{
				        	noBloqueado(ip, pathname, key);
				        	next(); // va a las siguientes rutas
				        }
				    });
		        }
		    });
        }
    });

});


router.get('/', function(req, res) {
	res.json({ message: 'Welcome to MELI-PROXY' });
        res.write("MELI-PROXY");	
});

// rutas para pegarle a la api
// ----------------------------------------------------
router.route('/ips/estadisticas')
	.get(function(req, res) {
        urlStaticStadistics("ips", "ips", 'No hay estadisticas para mostrar', res, 0);
    });    

router.route('/urls/estadisticas')
	.get(function(req, res) {
        urlStaticStadistics("urls", "urls", 'No hay estadisticas para mostrar', res, 0);
    }); 

router.route('/ips/estadisticas/block')
	.get(function(req, res) {
        urlStaticStadistics("ipsBlock", "ips", 'No hay ips bloqueadas', res, 1);
    }); 

router.route('/urls/estadisticas/block')
	.get(function(req, res) {
        urlStaticStadistics("urlsBlock", "urls", 'No hay urls bloqueadas', res, 1);
    });             

router.route('/:param1/estadisticas')
	.get(function(req, res) {
		client.scard("keys", function (err, total){//me traigo la cantidad de elementos de la lista
            if(parseInt(total) == 0){
	    		res.json({ message: 'No hay estadisticas para mostrar' });
	    	}else{
				client.sort("keys","by","*","desc", function (err, replies) {//me traigo la lista ordenada
				    if (err) {
				        return console.error("error response - " + err);
				    }

				    res.writeHead(200, {"Content-Type": "text/html"});
				    //res.write(replies.length + " ips:" + "</BR>");
				    replies.forEach(function (reply, i) {//recorro los elementos de la lista
				    	client.get(reply, function (err, cant){
				    		if(reply.split(":")[1] == ('/' + req.params.param1)){ //solo muestro las ips que le pegaron a esa url
			                    res.write(reply.split(":")[0] + " : " + cant + "</BR>");
				    		}
		                    if(parseInt(total) == (parseInt(i) + 1)){ //lo pongo afuera, por si la ultima key no la tenia que mostrar
		                    	res.end();
		                    }
				    	});
				    });    
				});
	    	}
		});	
	});

router.route('/:param1/:param2/estadisticas')
	.get(function(req, res) {
		client.scard("keys", function (err, total){//me traigo la cantidad de elementos de la lista
            if(parseInt(total) == 0){
	    		res.json({ message: 'No hay estadisticas para mostrar' });
	    	}else{
				client.sort("keys","by","*","desc", function (err, replies) {//me traigo la lista ordenada
				    if (err) {
				        return console.error("error response - " + err);
				    }

				    res.writeHead(200, {"Content-Type": "text/html"});
				    //res.write(replies.length + " ips:" + "</BR>");
				    replies.forEach(function (reply, i) {//recorro los elementos de la lista
				    	client.get(reply, function (err, cant){
				    		if(reply.split(":")[1] == ('/' + req.params.param1 + '/' + req.params.param2)){ //solo muestro las ips que le pegaron a esa url
			                    res.write(reply.split(":")[0] + " : " + cant + "</BR>");
				    		}
		                    if(parseInt(total) == (parseInt(i) + 1)){ //lo pongo afuera, por si la ultima key no la tenia que mostrar
		                    	res.end();
		                    }
				    	});
				    });    
				});
	    	}
		});	
	});

router.route('/:param1/:param2/:param3/estadisticas')
	.get(function(req, res) {
		client.scard("keys", function (err, total){//me traigo la cantidad de elementos de la lista
            if(parseInt(total) == 0){
	    		res.json({ message: 'No hay estadisticas para mostrar' });
	    	}else{
				client.sort("keys","by","*","desc", function (err, replies) {//me traigo la lista ordenada
				    if (err) {
				        return console.error("error response - " + err);
				    }

				    res.writeHead(200, {"Content-Type": "text/html"});
				    //res.write(replies.length + " ips:" + "</BR>");
				    replies.forEach(function (reply, i) {//recorro los elementos de la lista
				    	client.get(reply, function (err, cant){
				    		if(reply.split(":")[1] == ('/' + req.params.param1 + '/' + req.params.param2 + '/' + req.params.param3)){ //solo muestro las ips que le pegaron a esa url
			                    res.write(reply.split(":")[0] + " : " + cant + "</BR>");
				    		}
		                    if(parseInt(total) == (parseInt(i) + 1)){ //lo pongo afuera, por si la ultima key no la tenia que mostrar
		                    	res.end();
		                    }
				    	});
				    });    
				});
	    	}
		});	
	});

router.route('/:param1/estadisticas/block')
	.get(function(req, res) {
		client.scard("keysBlock", function (err, total){//me traigo la cantidad de elementos de la lista
            if(parseInt(total) == 0){
	    		res.json({ message: 'No hay bloqueos para mostrar' });
	    	}else{
				client.sort("keysBlock","by","*","desc", function (err, replies) {//me traigo la lista ordenada
				    if (err) {
				        return console.error("error response - " + err);
				    }

				    res.writeHead(200, {"Content-Type": "text/html"});
				    replies.forEach(function (reply, i) {//recorro los elementos de la lista
				    	client.get(reply, function (err, cant){
				    		if(reply.split(":")[1] == ('/' + req.params.param1)){ //solo muestro las ips que le pegaron a esa url
			                    res.write(reply.split(":")[0] + "</BR>");
				    		}
		                    if(parseInt(total) == (parseInt(i) + 1)){ //lo pongo afuera, por si la ultima key no la tenia que mostrar
		                    	res.end();
		                    }
				    	});
				    });    
				});
	    	}
		});	
	});

router.route('/:param1/:param2/estadisticas/block')
	.get(function(req, res) {
		client.scard("keysBlock", function (err, total){//me traigo la cantidad de elementos de la lista
            if(parseInt(total) == 0){
	    		res.json({ message: 'No hay bloqueos para mostrar' });
	    	}else{
				client.sort("keysBlock","by","*","desc", function (err, replies) {//me traigo la lista ordenada
				    if (err) {
				        return console.error("error response - " + err);
				    }

				    res.writeHead(200, {"Content-Type": "text/html"});
				    //res.write(replies.length + " ips:" + "</BR>");
				    replies.forEach(function (reply, i) {//recorro los elementos de la lista
				    	client.get(reply, function (err, cant){
				    		if(reply.split(":")[1] == ('/' + req.params.param1 + '/' + req.params.param2)){ //solo muestro las ips que le pegaron a esa url
			                    res.write(reply.split(":")[0] + "</BR>");
				    		}
		                    if(parseInt(total) == (parseInt(i) + 1)){ //lo pongo afuera, por si la ultima key no la tenia que mostrar
		                    	res.end();
		                    }
				    	});
				    });    
				});
	    	}
		});	
	});

router.route('/:param1/:param2/:param3/estadisticas/block')
	.get(function(req, res) {
		client.scard("keysBlock", function (err, total){//me traigo la cantidad de elementos de la lista
            if(parseInt(total) == 0){
	    		res.json({ message: 'No hay bloqueos para mostrar' });
	    	}else{
				client.sort("keysBlock","by","*","desc", function (err, replies) {//me traigo la lista ordenada
				    if (err) {
				        return console.error("error response - " + err);
				    }

				    res.writeHead(200, {"Content-Type": "text/html"});
				    //res.write(replies.length + " ips:" + "</BR>");
				    replies.forEach(function (reply, i) {//recorro los elementos de la lista
				    	client.get(reply, function (err, cant){
				    		if(reply.split(":")[1] == ('/' + req.params.param1 + '/' + req.params.param2 + '/' + req.params.param3)){ //solo muestro las ips que le pegaron a esa url
			                    res.write(reply.split(":")[0] + "</BR>");
				    		}
		                    if(parseInt(total) == (parseInt(i) + 1)){ //lo pongo afuera, por si la ultima key no la tenia que mostrar
		                    	res.end();
		                    }
				    	});
				    });    
				});
	    	}
		});	
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

router.route('/:param1/:param2/:param3/:param4')
	.get(function(req, res) {
		var getPath = '/' + req.params.param1 + '/' + req.params.param2 + '/' + req.params.param3 + '/' + req.params.param4;
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

function urlStaticStadistics(list, shown, defaultMessage, res , block){
	client.scard(list, function (err, total){//me traigo la cantidad de elementos de la lista
        if(parseInt(total) == 0){
    		res.json({ message: defaultMessage });
    	}else{
			client.sort(list,"by","*","desc", function (err, replies) {//me traigo la lista ordenada
			    if (err) {
			        return console.error("error response - " + err);
			    }

			    res.writeHead(200, {"Content-Type": "text/html"});
			    res.write(replies.length + ' ' + shown + ":" + "</BR>");
			    replies.forEach(function (reply, i) {//recorro los elementos de la lista
			    	client.get(reply, function (err, cant){
			    		if(block){
			    			res.write(reply + "</BR>");
			    		}else{
	                    	res.write(reply + " : " + cant + "</BR>");
			    		}
	                    if(parseInt(total) == (parseInt(i) + 1)){
	                    	res.end();
	                    }
			    	});
			    });    
			});
    	}
	});
}

function urlDinamicStadistics(){

}

function expire(block, expire, blockList, element, time, amount){
	client.get(expire, function (err, reply) {
        if(reply){
            if(parseInt(reply) >= amount){ //lo bloquea a las tantas veces que le pega en determinado tiempo
            	client.set(block, 1);
            	client.sismember(blockList, element, function(err, reply){//guardo el elemento (ej: ip) en la lista de bloqueados
					if(reply == "0"){
						client.sadd(blockList, element);
					}
				});
            }
        }else{
        	client.set(expire, 0);//si no esta setteado se lo vuelvo a settear
        	client.expire(expire, time);
        }
	    client.incr(expire);
	    /*client.get(expire, function (err, reply) {
	        console.log('ipExpire: ' + reply);  //hacerlo generico
	    });*/
    });
}

function noBloqueado(ip, pathname, key){
	client.sismember("ips", ip, function(err, reply){
		if(reply == "0"){
			client.sadd("ips", ip);
		}
	});
	client.sismember("keys", key, function(err, reply){
		if(reply == "0"){
			client.sadd("keys", key);
		}
	});
	client.sismember("urls", pathname, function(err, reply){
		if(reply == "0"){
			client.sadd("urls", pathname);
		}
	});

	var ipBlock = ip + ':block';
	var pathBlock = pathname + ':block';
	var keyBlock = key + ':block';

	var ipExpire = ip + ':expire';
	var pathnameExpire = pathname + ':expire';
	var keyExpire = key + ':expire';

	expire(ipBlock, ipExpire, "ipsBlock", ip, 40, 10);
	expire(keyBlock, keyExpire, "keysBlock", key, 40, 5);
	expire(pathBlock, pathnameExpire, "urlsBlock", pathname, 40, 10);

    client.incr(key);
    client.incr(ip);
    client.incr(pathname);
/*
    client.get(key, function (err, reply) {
        console.log('key: ' + reply);
    });
    client.get(ip, function (err, reply) {
        console.log('ip: ' + reply);
    });
    client.get(pathname, function (err, reply) {
        console.log('url: ' + reply);
    });
*/
	console.log('Apunto de rutear');
} 