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

var inExtension = {
    outgoing: function(message, callback) {
        // Let non-subscribe messages through
        if (message.channel !== '/meta/subscribe') {
            if (!message.ext) {
                message.ext = {};
            };
            message.ext = { 
                rooms : currentRooms.room,
                roomOwner : currentRooms.ownerId,
                messageData : currentMessages.data.text,
                messageUserId : currentMessages.userId,
                messageRoom : currentMessages.room
            };

            //console.log("sendi1");
            return callback(message);             
        };
        if (!message.ext) {
            message.ext = { 
                rooms : currentRooms.room,
                roomOwner : currentRooms.ownerId,
                messageData : currentMessages.data,
                messageUserId : currentMessages.userId,
                messageRoom : currentMessages.room
            };
        //console.log("sendi2");    
        };
        return callback(message);    
    }
};

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
        currentRooms.room.push(channel);
        currentRooms.ownerId.push(clientId);
        console.log("channel added to server");
    }
    currentMessages.userId.push(clientId);
    currentMessages.room.push(channel);
    currentMessages.data.push(data.text);

});

bayeux.bind('disconnect', function(clientId) {
  console.log("disconnect " + clientId);
});

bayeux.addExtension(inExtension);
bayeux.listen(8001);
//bayeux.attach(app);
app.listen(8000);