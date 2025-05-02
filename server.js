const express = require('express');
const app     = express();
const http    = require('http').createServer(app);
const io      = require('socket.io')(http);

// serve the “public” folder
app.use(express.static(__dirname + '/public'));

io.on('connection', socket => {
  console.log('✔ user connected:', socket.id);

  // when any client creates a box:
  socket.on('new-box', data => {
    socket.broadcast.emit('new-box', data);
  });

  // when any client updates the content of a box:
  socket.on('update-box', data => {
    socket.broadcast.emit('update-box', data);
  });
});

http.listen(3000, () => {
  console.log('🚀 listening on http://localhost:3000');
});
