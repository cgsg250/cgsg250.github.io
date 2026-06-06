import { f } from "./client1.js";

const socket = io(); 

const chatWindow = document.getElementById('chat-window');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

export function logSmth() {
  console.log("ABC");
  console.log(f());
}

function appendMessage(text, isSystem = false) {
    const messageElement = document.createElement('div');
    messageElement.textContent = text;
    if (isSystem) messageElement.style.color = 'gray';
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight; 
}

socket.on('chat_message', function(msg) {
    appendMessage(`Сервер: ${msg}`);
});

socket.on('connect', () => {
    appendMessage('[Соединение с сервером установлено]', true);
});

socket.on('disconnect', () => {
    appendMessage('[Соединение закрыто]', true);
});

socket.on('connect_error', (error) => {
    appendMessage('[Ошибка соединения]', true);
    console.error('Детали ошибки:', error);
});

sendBtn.addEventListener('click', () => {
    const text = messageInput.value.trim();
    if (text !== '' && socket.connected) {
        socket.emit('chat_message', text); 
        appendMessage(`Вы: ${text}`); 
        messageInput.value = ''; 
    }
});

messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendBtn.click();
    }
});
