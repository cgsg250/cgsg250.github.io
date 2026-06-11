const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const os = require("os");
const { Server } = require("socket.io"); 
const fs = require("fs"); 

const app = express();
const port = process.env.PORT || 8002;
const jsonPath = "./messages.json";

var messagesHistory = [];


if (fs.existsSync(jsonPath)) {
  var fileData = fs.readFileSync(jsonPath, "utf8");
  if (fileData) {
    messagesHistory = JSON.parse(fileData);
    console.log("История сообщений успешно загружена из JSON файлов. Всего строк: " + messagesHistory.length);
  }
}

function safeText(str) {
  if (!str) return "";
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function myMiddleware(req, res, next) {
  console.log("Запрос для URL: " + req.url);
  next();
}

app.use(cookieParser());
app.use(logger("dev"));
app.use(myMiddleware);

app.use(function (req, res, next) {
  var cookie = req.cookies.cookieName;
  if (cookie === undefined) {
    var randomNumber = Math.random().toString();
    randomNumber = randomNumber.substring(2, randomNumber.length);
    res.cookie('cookieName', randomNumber, { maxAge: 900000, httpOnly: false });
    console.log('cookie created successfully');
  } else {
    console.log('cookie exists', cookie);
  } 
  next();
});

app.use(express.static('user')); 
app.use(express.static("."));

app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/user/index.html");
});


app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const server = app.listen(port, '0.0.0.0', function() {
  console.log("==================================================");
  console.log("Сервер успешно запущен на порту: " + port);
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
      for (const net of networkInterfaces[interfaceName]) {
          if (net.family === 'IPv4' && !net.internal) {
              console.log("Для доступа с других устройств перейдите по: http://" + net.address + ":" + port);
          }
      }
  }
  console.log("==================================================");
});

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

io.on('connection', function(socket) {
    socket.isReady = false;

    socket.on('register_user', function(username) {
        if (!username) return;

        socket.username = safeText(username.trim());
        socket.isReady = true;
        
        console.log("Пользователь вошел: " + socket.username);
        socket.emit('chat_history', messagesHistory);
        socket.broadcast.emit('chat_message', {
            text: "Присоединился к чату",
            user: socket.username,
            isSystem: true
        });
    });

    socket.on('chat_message', function(msgText) {
        if (socket.isReady === false || !msgText) return;

        const cleanText = safeText(msgText.trim());
        
        // Создаем объект сообщения
        var newMsg = {
            text: cleanText,
            user: socket.username,
            isSystem: false
        };

    
        messagesHistory.push(newMsg);

    
        fs.writeFileSync(jsonPath, JSON.stringify(messagesHistory, null, 2), "utf8");

        console.log("[" + socket.username + "]: " + cleanText);

        socket.broadcast.emit('chat_message', newMsg);
    });

    socket.on('disconnect', function() {
        if (socket.isReady === true) {
            console.log("Пользователь ушел: " + socket.username);
            
            socket.broadcast.emit('chat_message', {
                text: "Покинул чат",
                user: socket.username,
                isSystem: true
            });
        }
    });
});
