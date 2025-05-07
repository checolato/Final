const express = require('express');
const app     = express();
const http    = require('http').createServer(app);
const io      = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

io.on('connection', socket => {
  console.log('user connected:', socket.id);

  socket.on('new-box', data => {
    socket.broadcast.emit('new-box', data);
  });

  socket.on('update-box', data => {
    socket.broadcast.emit('update-box', data);
  });
});

http.listen(3000, () => {
  console.log('🚀 listening on http://localhost:3000');
});
