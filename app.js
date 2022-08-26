const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
const server = app.listen(port, () => console.log(`Listening iChat on port ${port}`))

let socketsConnected = new Set();

const io = require('socket.io')(server)
io.on('connection', onConnected)

var lobby = {};

function onConnected(socket) {

    //connect
    socket.on('joined', (joined) => {
        socketsConnected.add(socket.id)
        lobby[socket.id] = joined.name;
        //io.emit will send to all the clients
        //socket.broadcast.emit will send the message to all the other clients except the newly created connection
        io.emit('clients-total', socketsConnected.size)
        socket.broadcast.emit('user-connect', joined.name)
        io.emit("lobby-users", lobby)
    })

    //disconnect
    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnect', user = lobby[socket.id]);
        delete lobby[socket.id];
        socketsConnected.delete(socket.id)
        io.emit('clients-total', socketsConnected.size);
        io.emit("lobby-users", lobby)
    });

    //handling hellomessage event from client side
    socket.on('sendMessageToAll', (data) => {
        socket.broadcast.emit('toALLThePeopleConnectedInTheLobby', data)
    })


    socket.on('someoneIsTyping', (data) => {
        socket.broadcast.emit('feedback', data)
    })
    console.log(lobby);

}