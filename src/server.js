const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
http.listen(3030, () => {
  console.log('listening to port 3000');
});

var users = [];

io.on('connection', socket => {
  console.log('user connected');
  socket.on('info', data => {
    console.log(`info ${JSON.stringify(data)}`);
    socket.userInfo = data;
    let user = {
      p: data.id,
      n: data.name,
      id: socket.id
    };
    users.push(user);
  });
  socket.on('create or join', data => {
    var clients = io.sockets.adapter.rooms[data.room] === undefined ? 0 : io.sockets.adapter.rooms[data.room].length;
    if (clients === 0) {
      socket.join(data.room);
      socket.emit('created', data.room);
      //socket.broadcast.emit('join', { join: true });
      // io.to(getSocketId(data.number)).emit('join', { join: true });
      io.sockets.sockets[getSocketId(data.number)].emit('join', { join: true });
    } else if (clients === 1) {
      io.in(data.room).emit('join', data.room);
      socket.join(data.room);
      io.in(data.room).emit('status', { ready: true });
    }
  });

  socket.on('msg', data => {
    socket.to('call').emit('signal', data);
  });

  socket.on('disconnect', () => {
    let user = users.findIndex(x => x.id === socket.id);
    console.log(user);
    if (user !== -1) {
      users.splice(user, 1);
    }
    console.log('user disconnected');
  });
});

function getSocketId(number) {
  let user = users.find(x => x.p === number || parseInt(x.p) === number);

  if (user) {
    console.log(user);
    return user.id;
  }
  return '';
}
