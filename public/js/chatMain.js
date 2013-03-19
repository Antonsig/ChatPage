var client = new Faye.Client('http://localhost:8001/faye');
client.name = "anonymous";
//var room = new Faye.Channel('http://localhost:8001/faye');
var currentRoom = "/chattid";
var currentUser = 'anonymous';
var myColor = 000;
var rooms = {
    name : [],
    owner : []
};
var allMessages = {
    data : [],
    owner : [],
    room : []
};

// setInterval(function(){syncServer()},5000);

// function syncServer() {
    // var clientAuth = {
        // incoming: function(message, callback) {
        // // Again, leave non-subscribe allMessages alone
        // if (message.channel !== '/meta/subscribe')
          // return callback(message);
        // for(var i = 0; i < message.ext.rooms.length; i++) {
            // allMessages.data[i] = message.ext.messageData[i];
            // allMessages.owner[i] = message.ext.messageUserId[i];
            // allMessages.room[i] = message.ext.messageRoom[i];       
        // }

        // rooms.name = message.ext.rooms;
        // rooms.owner = message.ext.roomOwner;
        // // console.log("MessageRoomLength " + message.ext.rooms.length);
        // // console.log("MessageRoomNameLength " + message.ext.rooms.length);
        // // console.log("localrooms refreshed");
        // // Carry on and send the message to the server
        // callback(message);
          // }
        // };
    // client.addExtension(clientAuth);
// };

setInterval(function(){logVar()},20000);

function logVar() {
    console.log("---------- Skyrsla byrjar ----------");
    console.log("Lengd breyta --  Rooms: " + rooms.name.length + " AllMessages: " + allMessages.data.length )
    for (var i = 0; i < allMessages.data.length; i++) {
        console.log("message " + i + " " + allMessages.data[i].text + " owner: " + allMessages.owner[i] + " room: " + allMessages.room[i]);
    }
    for (var i = 0; i < rooms.name.length; i++) {
        console.log("room " + i + " " + rooms.name[i] + " owner: " + rooms.owner[i]);
    }
    console.log("---------- Skyrsla endar ----------");
};


$(function(){
    $('#send').click(function(e) {
    message = document.getElementById("myText").value;
    var publication = client.publish(currentRoom, {userName: client.name, text: message, color: myColor});

    $('#myText').val('');
    });

    subsc();
    getData();

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
    //console.log(client.name);
    myColor=Math.floor(Math.random()*500);
    $("#currentUser").html('Welcome ' + client.name);

};

function createChatroom() {
    currentRoom = "/" + document.getElementById("chatRoomName").value;
    //console.log(currentRoom);
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
            str += message.color;
            str += '">';
            str += message.userName;
            str += " say's </span>";
            str += message.text;
            str += '</div>';
        $("#output").val('');
        $("#output").prepend(str);
    });
}

function getData() {
    client.subscribe('/123datachannel321', function(message) {
    
        rooms.name = message.rooms;
        rooms.owner = message.roomOwner;
        allMessages.data = message.messageData;
        allMessages.owner = message.messageUserId;
        allMessages.room = message.messageRoom;
        // console.log("rooms.name.length" + rooms.name.length);
        // console.log("rooms.owner.length" + rooms.owner.length);
        // console.log("messages.data.length" + allMessages.data.length);
        // console.log("messages.owner.length" + allMessages.owner.length);
        // console.log("messages.room.length" + allMessages.room.length);


    });
}