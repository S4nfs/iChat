const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(port, () => console.log(`Listening iChat on port ${port}`))

let socketsConnected = new Set();

const io = require('socket.io')(server)
io.on('connection', onConnected)

let people;
let arr = [];
function onConnected(socket) {

    //joined
    socket.on('joined', (joined) => {
        socketsConnected.add(socket.id)
        people = {
            id:socket.id,
            username:joined.name    
        }
        //to emit an event to client side when the socket is connected
        io.emit('clients-total', socketsConnected.size)
        //  people[socket.id] = joined.name;
        arr.push(people);
    })
    io.emit('yesJoined', arr);
    

    socket.on('disconnect', () => {
        io.emit('yesDisconnect', socket.id);
        delete arr[socket.id];
        socketsConnected.delete(socket.id)
        io.emit('clients-total', socketsConnected.size);
    });

    //handling hellomessage event from client side
    socket.on('sendMessageToAll', (data) =>{
        socket.broadcast.emit('toALLThePeopleConnectedInTheLobby', data) //If you want to broadcast to everyone except the person who connected you can use socket.broadcast.emit()
    })
    console.log(arr);


    socket.on('someoneIsTyping', (data) => {
        socket.broadcast.emit('feedback', data)
    })
}