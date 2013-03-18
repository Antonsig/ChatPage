var client = new Faye.Client('http://localhost:8001/faye');
client.name = "anonymous";
//var room = new Faye.Channel('http://localhost:8001/faye');
var rooms = [];
var currentRoom = "/chattid";
var currentUser = 'anonymous';
var message = "";


// samskipti við server
//////////////////////////////////////////////////
    var clientAuth = {
        incoming: function(message, callback) {
        // Again, leave non-subscribe messages alone
        if (message.channel !== '/meta/subscribe')
          return callback(message);
        // Add ext field if it's not present
        // if (!message.ext) {
            // message.ext = {value : ""}
        // };
        
        rooms = message.ext.rooms;
        console.log("rooms uppfært");
        // Carry on and send the message to the server
        callback(message);
          }
        };
    client.addExtension(clientAuth);

///////////////////////////////////////////////////  



$(function(){
    $('#send').click(function(e) {
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
    rooms.push(currentRoom);
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