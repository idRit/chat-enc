const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static serving
app.use(express.static(path.join(__dirname, 'public')));

// manual catch all
app.get('/', function (req, res) {
   res.sendFile(__dirname + '/public/index.html');
});

app.get('/test', (req, res) => {
   res.json({
      working: true
   });
});

// app.get('/addRoom/:roomName')

const server = app.listen(8888);
console.log("Listening on 8888");

const io = require('socket.io')(server);

let volatileList = [];

io.on('connection', socket => {
   socket.on('c', (room) => {
      console.log(room);
      socket.join(room.roomName);
      let public = uuidv4();
      if (typeof volatileList.find(el => el.split(":")[0] === room.roomName) === "undefined") {
         volatileList.push(room.roomName + ":" + public);
         io.to(room.roomName).emit('p', { public });
      } else {
         io.to(room.roomName).emit('p', { 
            public: volatileList.find(el => el.split(":")[0] === room.roomName)[0].split(":")[1] 
         });
      }
   });

   socket.on('msg', (msg) => {
      console.log(msg);
      io.sockets.in(msg.room).emit('msg', { msg: msg.msg, person: msg.person });
   });

   socket.on('exit', (r) => {
      socket.leave(r.room);
   });

   socket.on('disconnect', () => {
      console.log("disconnection");
   });
});

function uuidv4() {
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
   });
}