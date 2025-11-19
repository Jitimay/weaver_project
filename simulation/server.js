const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(bodyParser.json());

// Mimic ESP32 Command Endpoint
app.post('/command', (req, res) => {
    const command = req.body;
    console.log('Received command:', command);

    // Broadcast to frontend
    io.emit('command', command);

    res.json({ status: 'sent', simulated: true });
});

io.on('connection', (socket) => {
    console.log('Frontend connected');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Simulation server running at http://localhost:${PORT}`);
    console.log(`Send POST requests to http://localhost:${PORT}/command`);
});
