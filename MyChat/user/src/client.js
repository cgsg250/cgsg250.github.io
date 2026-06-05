import { f } from "./client1.js";

const socket = new WebSocket('ws://localhost:8002');
const chatWindow = document.getElementById('chat-window');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

export function logSmth() {
  console.log("ABC");
  console.log(f());
}

export function openWebsocketCommunication() {
  let socket = new WebSocket("ws://localhost:8002");
  let messageIndex = 0;

  socket.onopen = (e) => {
    console.log("Connection established");
    socket.send("Hello from client!");
  };

  socket.onmessage = (event) => {
    console.log(`message received: ${event.data}`);
    setTimeout(()=>{
        socket.send(`Hi again from  client! ${messageIndex}`);
        messageIndex++;
    }, 1000)
  };
}

setTimeout(() => {
  openWebsocketCommunication();
}, 1000);

// Функция для вывода сообщений на экран
function appendMessage(text, isSystem = false) {
    const messageElement = document.createElement('div');
    messageElement.textContent = text;
    if (isSystem) messageElement.style.color = 'gray'; // Подсветим системные сообщения
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Прокрутка вниз
}

// 2. Слушаем сообщения от сервера
socket.onmessage = function(event) {
    // Этот метод срабатывает, когда сервер делает ws.send()
    appendMessage(`Сервер: ${event.data}`);
};

// Слушаем открытие соединения (необязательно, для красоты)
socket.onopen = function() {
    appendMessage('[Соединение с сервером установлено]', true);
};

// 3. Отправка сообщения на сервер по клику на кнопку
sendBtn.addEventListener('click', () => {
    const text = messageInput.value.trim();
    if (text !== '') {
        socket.send(text); // <--- Отправляем текст на сервер через WebSocket
        appendMessage(`Вы: ${text}`); // Отображаем у себя на экране
        messageInput.value = ''; // Очищаем поле ввода
    }
});

// Отправка по нажатию Enter
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendBtn.click();
    }
});

