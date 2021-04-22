const express = require('express')
const http = require('http')

const app = express();
const server = http.createServer(app)
const io = require('socket.io')(server);

const port = 8080;

const clientPath = `${__dirname}/../client`;
app.use(express.static(clientPath))


server.listen(8080, () =>{
    console.log("server running on "+port);
});

let counter = 0;
var usernames = [];
var room1 = [];
var room2 = [];
var privateMessages = [];

var avatar;

io.on('connection', (socket) => {



    socket.on("message", ({roomInfo,room}) =>{
        io.to(room).emit('message',(roomInfo))
    });
    socket.on("message2", (roomInfo) =>{
        io.to(room).emit('message',(roomInfo))
    });



    socket.on('create', function(room) {
        if (socket.lastRoom) {
            socket.leave(socket.lastRoom);
            socket.lastRoom = null;
        }
        socket.join(room);
        socket.lastRoom = room;
    });



    console.log(counter++ +' someone connected');


    let name = socket.id
    io.emit('userids',(name))

    socket.on('showMessages',(room)=>{
        io.to(room).emit("displayMessage", ({room1,room2}));
    } )

    socket.on('sendToAll', ({message,room}) =>{
        if(room=== "room1"){
            room1.push({message})

        }
        if(room === "room2"){
            room2.push({message})

        }
        console.log(room)
       // io.to(room).emit("displayMessage", (message));
        io.to(room).emit("displayMessage", ({room1,room2}));


    });

    socket.on("privateMessage", ({message,selectedUser}) =>
    {
        let sender = socket.id;
        let userexists = privateMessages.findIndex(x => x.user === selectedUser)
        let checker;

          //   if( userexists !== -1 || privateMessages.findIndex(x => x.sender === selectedUser) !==-1 ){
                 privateMessages.forEach(privateMessage => {

                    if(privateMessage.user === selectedUser && privateMessage.sender === sender ||
                       privateMessage.user === sender && privateMessage.sender === selectedUser ){
                        privateMessage.messages.push(message) ;
                        console.log("test1")
                        checker=true
                    }
            })

                if(checker!==true){
                    privateMessages.push({"messages":[message],"user":selectedUser,"sender":sender})
                    console.log("test2")
                }

            console.log(privateMessages.findIndex(x => x.user === selectedUser))

        console.log(privateMessages);
             console.log("pushfunction");

             let requestId = socket.id

            let index = privateMessages.findIndex(x => (x.sender === selectedUser || x.user === selectedUser)
                                                        && (x.sender === requestId || x.user === requestId) )

            let sliced = privateMessages.slice(index)

            io.to(sliced[0].user).to(sliced[0].sender).emit("onclickPrivate",({sliced,requestId}))
            console.log("emmitting onclickPrivate")


    })

    socket.on("displayPrivate",(selectedUser) =>{

        let requestId = socket.id
        let index = privateMessages.findIndex(x => (x.sender === selectedUser || x.user === selectedUser)
            && (x.sender === requestId || x.user === requestId) )

        let sliced = privateMessages.slice(index)
        if(sliced[0].user !== undefined){
            io.to(sliced[0].user).to(sliced[0].sender).emit("onclickPrivate",({sliced,requestId}))
            console.log("emmitting onclickPrivate")
        }


    })



    socket.on('disconnect',()=>{
        console.log(socket.id + " left")
       let index = usernames.findIndex(x => x.id === socket.id)
       usernames.splice(index,1);
        io.emit('allUsers',(usernames));
    })

    socket.on('userJoined',()=>{
        let userId = socket.id
        socket.emit("currentUser",userId)

    })

    socket.on('newUser',({name, avatar}) =>{
        let id= socket.id;
        usernames.push({"id":socket.id, "username":name, "avatar": avatar})

        io.emit('allUsers',(usernames));
        io.emit('newEventListener',(id));


    });

    socket.on('newAvatar',(newAvatar) =>{
        let index = usernames.findIndex(x => x.id === socket.id)
        usernames[index].avatar = newAvatar;
        io.emit('allUsers',(usernames));
    });

     socket.on('sendToMe', (message) =>{
         socket.emit("displayMessage", (message));
     });

});





