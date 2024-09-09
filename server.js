const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

// Predefined chatbot responses
const chatbotResponses = {
  hello: "Hello! How can I assist you today?",
  weather: "To get the weather, type 'weather <city_name>'",
  currency: "To get currency conversion rates, type 'convert <amount> <from_currency> <to_currency>'",
  news: "To get the latest news, type 'news'"
};

// Broadcast message to all clients
function broadcastMessage(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
  // Spawn the shell process
  const shell = spawn('./advanced_shell');

  // Shell output handling
  shell.stdout.on('data', (data) => {
    ws.send(data.toString());
  });

  shell.stderr.on('data', (data) => {
    ws.send(data.toString());
  });

  // WebSocket message handling (input from the client)
  ws.on('message', async (message) => {
    const msg = message.toString().trim().toLowerCase();

    // Handle chatbot commands
    if (chatbotResponses[msg]) {
      ws.send(chatbotResponses[msg]);
    } else if (msg.startsWith('weather')) {
      const city = msg.split(' ')[1];
      const weather = await getWeather(city);
      ws.send(weather);
    } else if (msg.startsWith('convert')) {
      const [_, amount, fromCurrency, toCurrency] = msg.split(' ');
      const conversion = await convertCurrency(amount, fromCurrency, toCurrency);
      ws.send(conversion);
    } else if (msg === 'news') {
      const news = await getLatestNews();
      ws.send(news);
    } else {
      // Pass the message to the shell if not a chatbot command
      shell.stdin.write(message + '\n');
    }
  });

  // Handle shell process close
  shell.on('close', (code) => {
    ws.close();
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
