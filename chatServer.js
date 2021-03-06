var currentRooms = {
    room : [],
    ownerId : []
};

var currentMessages = {
    userId : [],
    room : [],
    data : []
};

var express = require('express'),
    Faye = require('faye');

var bayeux = new Faye.NodeAdapter({
    mount: '/faye',
    timeout: 45
});

setInterval(function(){sendData()},5000);

var app = express();
app.configure(function () {
    //app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
});

app.get("/chatroom", function() {
    console.log("in chatroom");
});

bayeux.bind('handshake', function(clientId) {
  console.log("handshake " + clientId);
});

bayeux.bind('subscribe', function(clientId, channel) {   
  console.log("subscribed " + clientId + " in channel " + channel);
});

bayeux.bind('unsubscribed', function(clientId, channel) {
  console.log("unsubscribed " + clientId +  " from channel " + channel);
});

bayeux.bind('publish', function(clientId, channel, data) {
  console.log("publish " + clientId +  " in channel " + channel + " with data " + data.text);
  console.log("currentRoomLength " + currentRooms.room.length)
  var found = false;
    for(var i = 0; i < currentRooms.room.length; i++) {
        console.log(i);
        console.log(currentRooms.room[i]);
        if (currentRooms.room[i] == channel) {
            found = true;
            console.log("Herbergi fannst");
        }
    }     
    if (found == false) {
        if(channel !== '/123datachannel321') {
            currentRooms.room.push(channel);
            currentRooms.ownerId.push(clientId);
            console.log("channel added to server");
        }

    }
    if(channel !== '/123datachannel321') {
        currentMessages.userId.push(clientId);
        currentMessages.room.push(channel);
        currentMessages.data.push(data);
    }

});

bayeux.bind('disconnect', function(clientId) {
  console.log("disconnect " + clientId);
});

//bayeux.addExtension(inExtension);
bayeux.listen(8001);
console.log("Bayeux server listening on localhost:8001");
//bayeux.attach(app);
app.listen(8000);
console.log("Http server listening on localhost:8000");

/////////////////////Test/////////////
var client = new Faye.Client('http://localhost:8001/faye');
function sendData() {

    var publication = client.publish('/123datachannel321', {
        rooms : currentRooms.room,
        roomOwner : currentRooms.ownerId,
        messageData : currentMessages.data,
        messageUserId : currentMessages.userId,
        messageRoom : currentMessages.room
    });
}
//////////////////////////////////////