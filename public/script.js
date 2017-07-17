const registrationForm = document.querySelector('.registration-form');
const messagesList = document.querySelector('.messages-list');
const usersList = document.querySelector('.users-list');
const messageForm = document.querySelector('.form');

function createGetRequest(url, cb) {
  let data;
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        data = JSON.parse(xhr.responseText);
        cb(data);
      } else {
        console.log(xhr.responseText);
        console.log('There was a problem');
      }
    }
  });
  xhr.open('GET', url);
  xhr.setRequestHeader('Cache-Control', 'no-cache');
  xhr.send();
}

function createPostRequest(url, data) {
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 400 && xhr.status === 404) {
        console.log(xhr.responseText);
      }
    }
  });
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(JSON.stringify(data));
}

function createElement(el, className, text) {
  const element = document.createElement(el);
  if (className) element.className = className;
  if (text) element.innerText = text;
  return element;
}

function addUser(data, beforeElement) {
  const { nickname, status } = data;
  let statusClass;
  if (status === 'online') statusClass = 'user-status user-status--online';
  if (status === 'offline') statusClass = 'user-status user-status--offline';
  const userLi = createElement('li', 'users-list__item users-list__name');
  const userPar = createElement('p', null, nickname);
  const statusSpan = createElement('span', statusClass);
  userPar.appendChild(statusSpan);
  userLi.appendChild(userPar);
  if (beforeElement) {
    usersList.insertBefore(userLi, beforeElement);
  } else {
    usersList.appendChild(userLi);
  }
}

function renderUsers(data) {
  let users = data.users;
  if (!Array.isArray(users)) users = [users];
  if (!users || !users.length) return;
  users.forEach(user => addUser(user));
}

function renderMessages(data) {
  let messages = data.messages;
  if (!Array.isArray(messages)) messages = [messages];
  if (!messages.length) return;
  let messagesToRender;
  if (messages.length > 100) {
    messagesList.innerHTML = '';
    messagesToRender = messages.slice(-100);
  } else {
    messagesToRender = messages;
  }
  messagesToRender.forEach((message) => {
    const messageContainer = createElement('li', 'messages-list__message');
    const author = `${message.authorName} (@${message.authorNickname})`;
    const authorEl = createElement('p', 'messages-list__message-author', author);
    let time = new Date(message.createdAt);
    let hours = time.getHours();
    if (hours < 10) hours = `0${hours}`;
    let minutes = time.getMinutes();
    if (minutes < 10) minutes = `0${minutes}`;
    time = `${hours}:${minutes}`;
    const timeContainer = createElement('span', 'message-time', time);
    const body = createElement('p', 'messages-list__message-body', message.body);
    const regex = /^@(\S+)\s/;
    const toSpecificUsername = message.body.match(regex);
    if (toSpecificUsername && toSpecificUsername[1] === localStorage.getItem('nickname')) {
      body.style.color = 'brown';
      body.style.fontWeight = 'bold';
    }
    messageContainer.appendChild(authorEl);
    messageContainer.appendChild(timeContainer);
    messageContainer.appendChild(body);
    messagesList.appendChild(messageContainer);
  });
  messagesList.scrollTop = messagesList.scrollHeight - messagesList.offsetHeight;
}

function subscribe(url) {
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', () => {
    if (xhr.readyState !== 4) return;
    if (xhr.status === 200) {
      if (xhr.responseText) {
        const response = JSON.parse(xhr.responseText);
        if (response.type === 'users') renderUsers(response);
        if (response.type === 'messages') renderMessages(response);
      }
    }
    setTimeout(() => {
      subscribe(url);
    }, 1000);
  });
  xhr.open('GET', url);
  xhr.send();
}

function fetchAndRenderUsersAndMessages() {
  createGetRequest('/messages', renderMessages);
  createGetRequest('/users', renderUsers);
}

messageForm.addEventListener('submit', (event) => {
  const nickname = localStorage.getItem('nickname');
  const name = localStorage.getItem('name');
  const body = messageForm.messageInput.value;
  if (body === '') {
    event.preventDefault();
    return;
  }
  const createdAt = Date.now();
  const data = { nickname, name, body, createdAt };
  createPostRequest('/messages', data);
  messageForm.messageInput.value = '';
  event.preventDefault();
});

registrationForm.addEventListener('submit', (event) => {
  const name = registrationForm.name.value;
  const nickname = registrationForm.nickname.value;
  if (name === '' || nickname === '') {
    event.preventDefault();
    return;
  }
  const data = { name, nickname };
  createPostRequest('/users', data);
  localStorage.setItem('nickname', nickname);
  localStorage.setItem('name', name);
  event.preventDefault();
  subscribe('/userChanges');
  subscribe('/messagesChanges');
  fetchAndRenderUsersAndMessages();
  registrationForm.parentNode.style.display = 'none';
});
