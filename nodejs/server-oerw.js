var http = require('http');
var io = require('socket.io');
var request = require('request');
var allClients = [];

server = http.createServer(function(req, res){
console.log("serwer działa");
});
server.listen(4000);
 
// socket.io configuration
//259200000 equals to 72 hours(weekend)- this will allow to hold connection to clients when they are in standby state.

var socket = io.listen(server,{'log level': 2,'pingTimeout':604800000,'pingInterval':1000});

//function for inserting message to DB
var updateDb = function(message){

    request.post({
        'cache': false,
        'type': "POST",
        'datatype': "json",
        'headers' : {'Content-Type' : 'application/json'},
        'url': "http://localhost/admin-oerw/process.php",
        'form':{
                type: 'addMessage',
                message: message,
              },
           });

};

 
socket.on('connection', function(client){
    console.log('an user connected');

    allClients.push(client);

    client.on('message', function(msg){

        socket.emit('message',msg);


        updateDb(msg);
    })

  client.on('disconnect', function(){
        console.log('user disconnected');
        var i = allClients.indexOf(client);
      delete allClients[i];
    });
});

