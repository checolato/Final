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

// pick up Heroku’s port or default to 3000 locally
const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log(`🚀 listening on port ${PORT}`);
});


