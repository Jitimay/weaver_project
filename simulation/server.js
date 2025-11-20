const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Project Weaver Simulation API' });
});

// Mimic ESP32 Command Endpoint
app.post('/command', (req, res) => {
    const command = req.body;
    console.log('Received command:', command);

    // Broadcast to frontend
    io.emit('command', command);

    res.json({ status: 'sent', simulated: true, timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
    console.log('Frontend connected');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Simulation server running on port ${PORT}`);
    console.log(`Send POST requests to /command`);
});

module.exports = app;
