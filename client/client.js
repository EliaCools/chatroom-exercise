let socket = io.connect();


class user {
    constructor(avatar, username) {

        this.avatar = avatar;
        this.username = username
    }

    setAvatar(avatar) {
        this.avatar = avatar
    }

    getAvatar(avatar) {
        return this.avatar
    }

    getUsername() {
        return this.username
    }

}

document.querySelectorAll(".avatar").forEach(avatar =>

    avatar.addEventListener("click", function () {
        let inputvalue = avatar.getAttribute("src")

        document.getElementById("avatar-input").setAttribute('value', inputvalue);

        var input = document.getElementById('avatar-input').getAttribute("value")

        if (input === "") {
            document.getElementById('chooseAvatar').setAttribute("disabled", "")

        } else {
            createuser.setAvatar(input);
            let newAvatar = createuser.getAvatar();
            socket.emit("newAvatar", newAvatar);
        }

    })
)


var createuser;

while (createuser == null) {
    let username = prompt("please enter your name")
    createuser = new user("images/defualt.jpg", username)
    console.log(createuser.getAvatar())

}


if (createuser !== null) {
    let name = createuser.getUsername();
    let avatar = createuser.getAvatar();
    let id = socket.id
    socket.emit('newUser', {name, avatar, id})
}



socket.on('connect', () => {
    socket.emit('userJoined')
})





// Buttons for sending messages
document.querySelectorAll('.buttons').forEach(button =>

    button.addEventListener("click", function () {
        let message = '<img src=' + createuser.getAvatar() + ' class="avatar">' + createuser.getUsername() + " " + document.getElementById("text-input").value
        let buttonpressed = button.getAttribute("id")

        if (buttonpressed === "to-all") {
            socket.emit('sendToAll', ({message, room}));
        }
        if (buttonpressed === "to-me") {
            socket.emit('sendToMe', (message))
        }
    })
)
var room;

document.querySelectorAll('.roomButton').forEach(button => {

    let buttonPressed = button.getAttribute("id")
    let roomInfo;

    button.addEventListener("click", function () {

        if (buttonPressed === "room1") {
            room = "room1"
            socket.emit("create", room);

            roomInfo = "<p> this is room 1 </p>"

        }
        if (buttonPressed === "room2") {
            room = "room2"
            socket.emit("create", room);

            roomInfo = "<p>this is room 2 </p>"

        }
        socket.emit('message', ({roomInfo, room}))
        socket.emit('showMessages', room);

    })
})


socket.on('message', (test) => {
    document.getElementById("text-output-header").innerHTML = test;
})


socket.on('allUsers', (usernames) => {
    let users = document.getElementById('mainNav')
    let i = 1;
    users.innerHTML = "";
    usernames.forEach(user => {
        users.innerHTML += '<li id="user' + i++ + '" class="userList" onclick="" value=' + user.id + '>' + '<img src=' + user.avatar + ' class="avatar">' + user.username + '</li>';

    })
})

var selectedUser;
socket.on('newEventListener', () => {
    document.querySelectorAll(".userList").forEach(user => {

        user.addEventListener("click", function () {
            let id = user.getAttribute('value')

            if (document.getElementById("privateChat").hasAttribute("hidden") === false) {
                document.getElementById("privateChat").setAttribute("hidden", "");
            } else {
                document.getElementById("privateChat").removeAttribute("hidden");
                console.log(id)
                // privateMessage(id)
                document.getElementById("privateTextOutput").innerHTML = "";
                selectedUser = id;
                socket.emit("displayPrivate",(selectedUser));

            }

        })
    })
})

document.getElementById("privateButton").addEventListener("click", function () {
    document.getElementById("privateTextOutput").innerHTML = "";
    let message = document.getElementById("private-message").value

    socket.emit("privateMessage", ({message, selectedUser}))

    console.log(message, selectedUser);

})

socket.on("onclickPrivate", ({sliced,requestId}) => {

    console.log("sender" + sliced[0].sender);
    console.log("selecteduser" + selectedUser);
    console.log("sup")


    if(requestId === sliced[0].sender && selectedUser === sliced[0].user ||requestId === sliced[0].user && selectedUser === sliced[0].sender ){
    //   if(selectedUser === sliced[0].user){
        sliced[0].messages.forEach(message => {
           document.getElementById("privateTextOutput").innerHTML += '<p>' + message + '</p>';
           console.log("howdy");
    })
       }
   // }else{
   //     if(selectedUser === sliced[0].sender ){
   //         document.getElementById("privateTextOutput").innerHTML += '<p>' + message + '</p>';
   //     }
//
   // }



})









socket.on('displayMessage', ({room1, room2}) => {
    document.getElementById("textContainer").innerHTML = ""
    if (room === "room1") {
        room1.forEach(messages =>

            document.getElementById("textContainer").innerHTML += '<p>' + messages.message + '</p>'
        )
        console.log(room1);
    }
    if (room === "room2") {
        room2.forEach(messages =>
            document.getElementById("textContainer").innerHTML += '<p>' + messages.message + '</p>'
        )
        console.log(room2);
    }


    // document.getElementById("output-room1").innerHTML = "";

    // document.getElementById("text-input").value = "";

});

