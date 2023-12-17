import { chatsEndPoint } from "./constant.js";
import { formatTimestamp, makeApiCall } from "./utilities.js";

let chatData = [];
let selectedChatIndex = -1;

const fetchChatData = () => {
  makeApiCall(chatsEndPoint, "get")
    .then((data) => {
      chatData = data;
      createChatList(data);
    })
    .catch(error => console.error('Error:', error));
};

window.onload = () => {
  fetchChatData();
  checkSelectedChat();
};

const checkSelectedChat = (currentSelectedChat = {}) => {
  const chatWindow = document.getElementById('chat-window');

  if (selectedChatIndex === -1) {
    chatWindow.classList.add('hidden');
  } else {
    chatWindow.classList.remove('hidden');
    const chatWindowHeader = document.getElementById('chatWindowHeader');
    chatWindowHeader.innerHTML = '';

    const image = document.createElement('img');
    image.src = currentSelectedChat?.imageURL;
    chatWindowHeader.appendChild(image);

    const heading = document.createElement('h2');
    heading.textContent = currentSelectedChat?.title;
    chatWindowHeader.appendChild(heading);

    showMessages(currentSelectedChat?.messageList, currentSelectedChat);
    addInputs(currentSelectedChat);
  }
};

const showMessages = (messageList, currentSelectedChat) => {
  const chatMessagesContainer = document.getElementById('chatMessages');
  chatMessagesContainer.innerHTML = '';

  if (messageList.length === 0) {
    const defaultMessageElement = document.createElement('div');
    defaultMessageElement.classList.add('default-message');
    defaultMessageElement.textContent = 'Send a message to start chatting';
    chatMessagesContainer.appendChild(defaultMessageElement);
  } else {
    messageList.forEach(message => {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');

      const textElement = document.createElement('div');
      textElement.textContent = message.message;
      messageElement.appendChild(textElement);

      if (message.messageType === 'optionedMessage' && message.options) {
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('options-container');

        message.options.forEach(option => {
          const optionAnchor = document.createElement('a');
          optionAnchor.href = '#';
          optionAnchor.textContent = option.optionText;

          if (option.optionText === 'Request a call') {
            optionAnchor.addEventListener('click', function () {
              currentSelectedChat.messageList.push({
                sender: "USER",
                timestamp: new Date().getTime(),
                message: "I want a callback",
                type: "text"
              });
              showMessages(currentSelectedChat.messageList, currentSelectedChat);
            });
          }

          if (option.optionSubText) {
            const subTextElement = document.createElement('div');
            subTextElement.textContent = option.optionSubText;
            optionAnchor.appendChild(subTextElement);
          }

          optionsContainer.appendChild(optionAnchor);
        });

        messageElement.appendChild(optionsContainer);
      }

      const timestampElement = document.createElement('div');
      timestampElement.classList.add('timestamp');
      timestampElement.textContent = formatTimestamp(message.timestamp);
      messageElement.appendChild(timestampElement);

      if (message.sender === 'USER' && message.read) {
        const readTickElement = document.createElement('div');
        readTickElement.classList.add('read-tick');
        messageElement.appendChild(readTickElement);
      }

      if (message.sender === 'BOT') {
        messageElement.classList.add('bot-message');
      } else if (message.sender === 'USER') {
        messageElement.classList.add('user-message');
      }

      chatMessagesContainer.appendChild(messageElement);
    });
  }
};

const createChatList = (chatData) => {
  const chatList = document.getElementById('chatList');

  const chatItems = chatList.querySelectorAll('.chat-item');
  chatItems.forEach(item => {
    item.remove();
  });

  chatData.forEach((chat, index) => {
    const chatItem = document.createElement('div');
    chatItem.classList.add('chat-item');

    if (selectedChatIndex === index) {
      chatItem.classList.add('selected');
    } else {
      chatItem.classList.remove('selected');
    }

    const section1 = document.createElement('div');
    section1.classList.add('chat-item-section');

    const image = document.createElement('img');
    image.src = chat.imageURL;
    section1.appendChild(image);

    const content = document.createElement('div');
    content.classList.add('chat-item-content');

    const title = document.createElement('div');
    title.textContent = chat.title;
    content.appendChild(title);

    const orderId = document.createElement('div');
    orderId.classList.add('order-id');
    orderId.textContent = `Order ID: ${chat.orderId}`;
    content.appendChild(orderId);

    const description = document.createElement('div');
    description.classList.add('description');
    description.textContent = chat.messageList?.length > 0 ? chat.messageList[chat.messageList.length - 1]?.message : "";
    content.appendChild(description);

    section1.appendChild(content);
    chatItem.appendChild(section1);

    const section2 = document.createElement('div');
    section2.textContent = formatTimestamp(chat.latestMessageTimestamp);
    section2.style.alignSelf = 'flex-end';
    chatItem.appendChild(section2);

    chatItem.addEventListener('click', () => {
      selectedChatIndex = index;
      checkSelectedChat(chat);
      createChatList(chatData);
    });

    chatList.appendChild(chatItem);

    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.style.display = 'none';
  });
};

const addInputs = (currentSelectedChat) => {
  const messageInputContainer = document.getElementById('messageInputContainer');
  messageInputContainer.innerHTML = '';

  const inputElement = document.createElement('input');
  inputElement.type = 'text';
  inputElement.placeholder = 'Type your message';

  const buttonElement = document.createElement('button');
  const imgElement = document.createElement('img');
  imgElement.src = './assets/images/sent.png';
  imgElement.alt = 'send';
  buttonElement.appendChild(imgElement);

  buttonElement.addEventListener('click', function () {
    const inputValue = inputElement.value.trim();

    if (inputValue !== '') {
      currentSelectedChat.messageList.push({
        sender: "USER",
        timestamp: new Date().getTime(),
        message: inputValue,
        type: "text"
      });
      showMessages(currentSelectedChat.messageList, currentSelectedChat);
      inputElement.value = '';
    } else {
      alert('Please enter a message.');
    }
  });

  messageInputContainer.appendChild(inputElement);
  messageInputContainer.appendChild(buttonElement);
};

const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', function () {
  filterChatItems(searchInput.value.trim());
});

function filterChatItems(searchText) {
  const filteredData = chatData.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(searchText.toLowerCase());
    const orderIdMatch = item.orderId.toLowerCase().includes(searchText.toLowerCase());
    return titleMatch || orderIdMatch;
  });
  createChatList(filteredData);
}
