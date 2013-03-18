var client = new Faye.Client('http://localhost:8001/faye');
client.name = "anonymous";
//var room = new Faye.Channel('http://localhost:8001/faye');
var currentRoom = "/chattid";
var currentUser = 'anonymous';
var rooms = {
    name : [],
    owner : []
};
var messages = {
    data : [],
    owner : [],
    room : []
};

setInterval(function(){syncServer()},5000);

function syncServer() {
    var clientAuth = {
        incoming: function(message, callback) {
        // Again, leave non-subscribe messages alone
        if (message.channel !== '/meta/subscribe')
          return callback(message);
        for(var i = 0; i < message.ext.rooms.length; i++) {
            messages.data[i] = message.ext.messageData[i];
            messages.owner[i] = message.ext.messageUserId[i];
            messages.room[i] = message.ext.messageRoom[i];       
        }

        rooms.name = message.ext.rooms;
        rooms.owner = message.ext.roomOwner;
        // console.log("MessageRoomLength " + message.ext.rooms.length);
        // console.log("MessageRoomNameLength " + message.ext.rooms.length);
        // console.log("localrooms refreshed");
        // Carry on and send the message to the server
        callback(message);
          }
        };
    client.addExtension(clientAuth);
};

function logVar() {
    for (var i = 0; i < messages.room.length; i++) {
        //console.log("room: " + messages.room[i] + " " + i);
        console.log("message " + i + " " + messages.data[i] + " owner: " + messages.owner[i ] + " room: " + messages.room[i]);
    }
};

$(function(){
    $('#send').click(function(e) {
    syncServer();
    logVar();    
    message = document.getElementById("myText").value;
    var publication = client.publish(currentRoom, {userName: client.name, text: message});

    $('#myText').val('');
    });

    subsc();

});




if(client.name == 'anonymous') {
    $("#currentUser").append('Welcome anonymous <br/> Please choose a username' + 
        '<br/><input type="text" id="newUserName" placeholder="New User"></input>' + 
        '<button id="newUser" onclick="createUser();">Create</button>');
}

if(currentRoom == '/chattid') {
    $("#currentChat").append('<input type="text" id="chatRoomName" ' +
        'placeholder="New Chatroom Name"></input><button id="newRoom" ' + 
        'onclick="createChatroom();">Create</button><br/>');
}

function createUser() {

    client.name = document.getElementById("newUserName").value;
    console.log(client.name);
    client.colornumber=Math.floor(Math.random()*999);
    $("#currentUser").html('Welcome ' + client.name);

};

function createChatroom() {
    currentRoom = "/" + document.getElementById("chatRoomName").value;
    console.log(currentRoom);
    rooms.name.push(currentRoom);
    rooms.owner.push(client.ID);
    for(var i = 0; i < rooms.length; i++) {
        console.log(rooms[i]);
    }
    $("#currentChat").html("You are currently in " + currentRoom);
    subsc();
};

function subsc() {
    client.subscribe(currentRoom, function(message) {
        var str = '<div class="mess">';
            str += ' <span style="color: #';
            str += client.colornumber;
            str += '">';
            str += message.userName;
            str += " say's </span>";
            str += message.text;
            str += '</div>';
        $("#output").val('');
        $("#output").prepend(str);
        console.log(client.colornumber);
    });
}