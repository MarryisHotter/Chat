const lastMessageTimestamps = {};

document.getElementById('sendButton').addEventListener('click', function() {
    const messageInput = document.getElementById('messageInput');
    const messagesContainer = document.getElementById('messages');
    const currentChannel = document.querySelector('.chat-header h2').innerText;
    const username = "user"; // Replace with actual username

    if (messageInput.value.trim() !== '') {
        const newMessage = document.createElement('div');
        newMessage.classList.add('message', 'fade-in');
        newMessage.setAttribute('data-channel', currentChannel);

        const now = new Date();
        const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const date = now.toLocaleDateString();
        newMessage.setAttribute('data-date', date);
        newMessage.setAttribute('data-timestamp', timestamp);
        let showTimestamp = true;

        if (lastMessageTimestamps[currentChannel]) {
            const { lastTimestamp, lastDate } = lastMessageTimestamps[currentChannel];
            const [day, month, year] = lastDate.split('.');
            const lastDateTime = new Date(`${year}-${month}-${day}T${lastTimestamp}`);
            const timeDifference = Math.abs(now - lastDateTime);

            if (timeDifference < 60000) {
                showTimestamp = false;
            }
        }

        newMessage.innerHTML = `<span class="username">You:</span> <span class="message-content">${messageInput.value}</span>`;
        if (showTimestamp) {
            newMessage.innerHTML += ` <span class="date">${date}</span> <span class="timestamp">${timestamp}</span>`;
            lastMessageTimestamps[currentChannel] = { lastTimestamp: timestamp, lastDate: date };
        } else {
            newMessage.classList.add('no-timestamp');
        }

        messagesContainer.appendChild(newMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Save message to database
        fetch('save-message.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `channel=${encodeURIComponent(currentChannel)}&username=${username}&message=${encodeURIComponent(messageInput.value)}`
        }).then(response => response.text())
          .then(data => {
              console.log('Success:', data);
              messageInput.value = ''; // Clear the input field
              loadMessages(currentChannel); // Reload messages after sending
          })
          .catch(error => console.error('Error:', error));
    }
});

document.getElementById('messageInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('sendButton').click();
    }
});

const channels = document.querySelectorAll('.channel');
channels.forEach(channel => {
    channel.addEventListener('click', function() {
        const chatHeader = document.getElementById('chatHeader');
        const messagesContainer = document.getElementById('messages');
        const selectedChannel = this.innerText;  
        chatHeader.innerHTML = `<h2>${selectedChannel}</h2>`;
        
        const allMessages = document.querySelectorAll('.message');
        allMessages.forEach(message => {
            message.style.display = 'none';
        });

        const channelMessages = document.querySelectorAll(`.message[data-channel="${selectedChannel}"]`);
        channelMessages.forEach(message => {
            message.style.display = 'block';
        });
    });
});
document.addEventListener('keypress', function(event) {
    const messageInput = document.getElementById('messageInput');
    if (!overlay.classList.contains('visible') && event.key.length === 1 && event.key.match(/[a-z0-9]/i)) {
        messageInput.focus();
    }
});

document.addEventListener('contextmenu', function(event) {
    if (event.target.classList.contains('message') || event.target.closest('.message')) {
        event.preventDefault();
        
        const messageElement = event.target.closest('.message');
        const contextMenu = document.createElement('div');
        contextMenu.classList.add('context-menu');
        contextMenu.innerHTML = `
            <div class="context-menu-item">Edit</div>
            <div class="context-menu-item delete">Delete</div>
        `;
        
        document.body.appendChild(contextMenu);
        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.left = `${event.clientX}px`;

        const editOption = contextMenu.querySelector('.context-menu-item:not(.delete)');
        editOption.addEventListener('click', function() {
            const messageContentElement = messageElement.querySelector('.message-content');
            const currentText = messageContentElement.innerText;
            const newText = prompt('Edit your message:', currentText);
            if (newText !== null && newText.trim() !== '') {
                messageContentElement.innerText = newText.trim();
                const editedElement = messageElement.querySelector('.edited');
                if (!editedElement) {
                    const editedSpan = document.createElement('span');
                    editedSpan.classList.add('edited');
                    editedSpan.innerText = '(edited)';
                    messageElement.appendChild(editedSpan);
                }
            }
            document.body.removeChild(contextMenu);
        });

        const deleteOption = contextMenu.querySelector('.context-menu-item.delete');
        deleteOption.addEventListener('click', function() {
            messageElement.remove();
            document.body.removeChild(contextMenu);
        });

        document.addEventListener('click', function() {
            if (document.body.contains(contextMenu)) {
                document.body.removeChild(contextMenu);
            }
        }, { once: true });
    }
});

document.getElementById('toggleChannelAdder').addEventListener('click', function() {
    const channelAdder = document.getElementById('channelAdder');
    channelAdder.classList.toggle('hidden');
});

document.getElementById('createChannelButton').addEventListener('click', function() {
    const newChannelName = document.getElementById('newChannelName').value.trim();
    const channelsContainer = document.getElementById('channels');
    const channelError = document.getElementById('channelError');

    if (newChannelName === '') {
        channelError.innerText = 'Channel name cannot be empty.';
        return;
    }

    const existingChannel = document.getElementById(newChannelName.toLowerCase());
    if (existingChannel) {
        channelError.innerText = 'Channel name already in use. Please use a different name.';
        return;
    }

    const newChannel = document.createElement('div');
    newChannel.classList.add('channel');
    newChannel.id = newChannelName.toLowerCase();
    newChannel.innerText = newChannelName;

    newChannel.addEventListener('click', function() {
        const chatHeader = document.getElementById('chatHeader');
        const messagesContainer = document.getElementById('messages');
        const selectedChannel = this.innerText;
    
        chatHeader.innerHTML = `<h2>${selectedChannel}</h2>`;
        
        const allMessages = document.querySelectorAll('.message');
        allMessages.forEach(message => {
            message.style.display = 'none';
        });

        const channelMessages = document.querySelectorAll(`.message[data-channel="${selectedChannel}"]`);
        channelMessages.forEach(message => {
            message.style.display = 'block';
        });

        messagesContainer.classList.remove('slide-in');
        void messagesContainer.offsetWidth;
        messagesContainer.classList.add('slide-in');
    });

    channelsContainer.appendChild(newChannel);
    document.getElementById('newChannelName').value = '';
    channelError.innerText = '';
});

channels.forEach(channel => {
    channel.addEventListener('click', function() {
        const chatHeader = document.getElementById('chatHeader');
        const messagesContainer = document.getElementById('messages');
        const selectedChannel = this.innerText;
    
        chatHeader.innerHTML = `<h2>${selectedChannel}</h2>`;
        
        const allMessages = document.querySelectorAll('.message');
        allMessages.forEach(message => {
            message.style.display = 'none';
        });

        const channelMessages = document.querySelectorAll(`.message[data-channel="${selectedChannel}"]`);
        channelMessages.forEach(message => {
            message.style.display = 'block';
        });

        messagesContainer.classList.remove('slide-in');
        void messagesContainer.offsetWidth;
        messagesContainer.classList.add('slide-in');
    });
});

document.getElementById('settingsButton').addEventListener('click', function() {
    const settingsMenu = document.getElementById('settingsMenu');
    const overlay = document.getElementById('overlay');
    settingsMenu.classList.toggle('hidden');
    overlay.classList.toggle('hidden');
    overlay.classList.toggle('visible');
});

document.getElementById('closeSettingsButton').addEventListener('click', function() {
    const settingsMenu = document.getElementById('settingsMenu');
    const overlay = document.getElementById('overlay');
    settingsMenu.classList.add('hidden');
    overlay.classList.add('hidden');
    overlay.classList.remove('visible');
});

document.getElementById('themeToggle').addEventListener('change', function() {
    if (this.checked) {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
    }
});

document.getElementById('compactToggle').addEventListener('change', function() {
    if (this.checked) {
        document.body.classList.add('compact-mode');
        localStorage.setItem('compact', 'true');
    } else {
        document.body.classList.remove('compact-mode');
        localStorage.setItem('compact', 'false');
    }
    adjustMessageLayout();
});
window.addEventListener('load', function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        document.getElementById('themeToggle').checked = true;
    } else {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        document.getElementById('themeToggle').checked = false;
    }

    const compact = localStorage.getItem('compact');
    if (compact === 'true') {
        document.body.classList.add('compact-mode');
        document.getElementById('compactToggle').checked = true;
    } else {
        document.body.classList.remove('compact-mode');
        document.getElementById('compactToggle').checked = false;
    }
    adjustMessageLayout();
});

function adjustMessageLayout() {
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
        let username = message.querySelector('.username');
        let timestamp = message.querySelector('.timestamp');
        let date = message.querySelector('.date');
        let messageContent = message.querySelector('.message-content');
        let header = message.querySelector('.message-header');

        const storedDate = message.getAttribute('data-date');
        const storedTimestamp = message.getAttribute('data-timestamp');

        if (!username) {
            username = document.createElement('span');
            username.classList.add('username');
            username.innerText = 'You:';
        }

        if (!timestamp) {
            timestamp = document.createElement('span');
            timestamp.classList.add('timestamp');
            timestamp.innerText = storedTimestamp || '';
        } else {
            timestamp.innerText = storedTimestamp || timestamp.innerText;
        }

        if (!date) {
            date = document.createElement('span');
            date.classList.add('date');
            date.innerText = storedDate || '';
        } else {
            date.innerText = storedDate || date.innerText;
        }

        if (document.body.classList.contains('compact-mode')) {
            if (header) {
                header.remove();
                username.remove();
                date.remove();
                timestamp.remove();
                message.insertBefore(username, messageContent);
                message.insertBefore(messageContent, username.nextSibling);
                message.insertBefore(date, messageContent.nextSibling);
                message.insertBefore(timestamp, date.nextSibling);
                messageContent.insertAdjacentHTML('afterend', ' ');
                date.insertAdjacentHTML('afterend', ' ');
                username.insertAdjacentHTML('afterend', ' ');
                timestamp.insertAdjacentHTML('afterend', ' ');
            }
        } else {
            if (!header) {
                header = document.createElement('div');
                header.classList.add('message-header');
                if (username) username.remove();
                if (timestamp) timestamp.remove();
                if (date) date.remove();
                header.appendChild(username);
                header.appendChild(date);
                header.appendChild(timestamp);
                message.insertBefore(header, messageContent);
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    // Load messages for the default channel
    loadMessages('general');
});

function loadMessages(channel) {
    fetch(`save-message.php?channel=${channel}`)
    .then(response => response.json())
    .then(data => {
        const messagesContainer = document.getElementById("messages");
        messagesContainer.innerHTML = ''; // Clear existing messages
        data.forEach(message => {
            const messageElement = document.createElement("div");
            messageElement.classList.add("message");
            messageElement.innerHTML = `<strong>${message.username}</strong>: ${message.message} <em>${message.timestamp}</em>`;
            messagesContainer.appendChild(messageElement);
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
