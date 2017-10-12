var http = require('http');
var io = require('socket.io');
var request = require('request');
var users = [];

server = http.createServer(function(req, res){

});
server.listen(3000);
//var ios = io.listen(server);
// socket.io configuration
//259200000 equals to 72 hours(weekend)- this will allow to hold connection to clients when they are in standby state.

var ios = io.listen(server,{'log level': 2,'pingTimeout':604800000,'pingInterval':1000});
console.log("*************************************************************");
console.log("********* node.js message server started for WWR ************");
console.log("*************************************************************");
//function for inserting message to DB
var updateDb = function(message){

    request.post({
        'cache': false,
        'type': "POST",
        'datatype': "json",
        'headers' : {'Content-Type' : 'application/json'},
        'url': "http://localhost/admin/process.php",
        'form':{
            type: 'addMessage',
            message: message.msg,
            sender: message.author,
        },
    });

};
var updateDbprivate = function(message){

    request.post({
        'cache': false,
        'type': "POST",
        'datatype': "json",
        'headers' : {'Content-Type' : 'application/json'},
        'url': "http://localhost/admin/process.php",
        'form':{
            type: 'addPrivateMessage',
            message: message.message,
            sender: message.author,
            recipient: message.recipientname
        },
    });

};
ios.sockets.on('connection', function(socket){
    console.log("=============================");
    console.log("number of clients "+users.length);
    console.log("actual list of users in connection function:");
    for(var i=0; i<users.length; i++) {
        console.log("I am in users array connection function:"+users[i].userName);
    }
    console.log("=============================")
        socket.on('adduser', function (user) {
        socket.user = user;
        var oneUser={
            userName: user,
            userID: socket.id
        };
        /*if (users.length === 0){
            console.log("nie ma uzytkownika "+user);
            var exists= false;
            ios.sockets.emit('user_exists',exists);
            socket.user = user;
            users.push(oneUser);
            console.log("user connected: "+oneUser.userName);
            updateClients();

        }else{
            for(var i = 0; i < users.length; i++) {
                console.log("sprawdzam czy jest uzytkownik: "+user);
                if(users[i].userName === user ) {
                    console.log("jest uzytkownik "+user);
                    var exists= true;
                    ios.sockets.emit('user_exists',exists);
                    console.log("following user exists: "+ user);
                    socket.getSocket().removeAllListeners();

                } else {
                    console.log("nie ma uzytkownika "+user);
                    var exists= false;
                    ios.sockets.emit('user_exists',exists);
                    users.push(oneUser);
                    console.log("user connected: "+oneUser.userName);
                    updateClients();
                }
            }


        }

            for(var i = 0; i < users.length; i++) {
                console.log("usuwanie duplikatow " + user);
                if (users[i].userName == socket.user && users[i].userID != socket.id) {
                    console.log("ids to remove "+users[i].userID);
                    //users.splice(i, 1);
                    ios.sockets.connected[users[i].userID].disconnect();
                }
            }
            users.push(oneUser);
            console.log("user connected: "+oneUser.userName);
            updateClients();*/

            users.push(oneUser);
            console.log("user connected: "+oneUser.userName);
            updateClients();
    });

    //console.log('an user connected with ID '+socket.id);

    //allClients.push(socket);

    socket.on('logout', function(actualusername){

        console.log("user logged out");
        ios.sockets.connected[socket.id].disconnect();
    });

    socket.on('message', function(msg){
        ios.sockets.emit('message',msg);
        console.log("message sent " + msg);
        console.log("sender " + socket.user);
        var message={
                author: socket.user,
                msg: msg
            };
        updateDb(message);
    });
    socket.on("privmessage", function(data){
        ios.sockets.connected[data.user].emit("privmessage","Otrzymałeś prywatną wiadomość od "+data.author+ ":  " + data.message);
        ios.sockets.connected[socket.id].emit("privmessage","Wysłano prywatną wiadomość do "+data.recipientname+ ":  " + data.message);
        console.log("priv message sent " + data.message);
        console.log("sender " + data.author);
        console.log("recipient " + data.user);
        console.log("recipientname " + data.recipientname);
        updateDbprivate(data);
    });
    socket.on('disconnect', function () {
        for(var i=0; i<users.length; i++) {
            if(users[i].userName == socket.user) {
                users.splice(i, 1);
                console.log("user disconnected "+socket.user)
            }
        }
        updateClients();
    });
    function updateClients() {
        ios.sockets.emit('update', users);
        console.log("=============================")
        console.log("actual list of users:")
        for(var i=0; i<users.length; i++) {
            console.log("I am in users array:"+users[i].userName )
        }
        console.log("=============================")
    }


});

