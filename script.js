document.getElementById('sendButton').addEventListener('click', function() {
    const messageInput = document.getElementById('messageInput');
    const messagesContainer = document.getElementById('messages');
    const currentChannel = document.querySelector('.chat-header h2').innerText;
    
    if (messageInput.value.trim() !== '') {
        const newMessage = document.createElement('div');
        newMessage.classList.add('message', 'fade-in');
        newMessage.setAttribute('data-channel', currentChannel);
        newMessage.innerHTML = `<span class="username">You:</span> ${messageInput.value}`;
        
        messagesContainer.appendChild(newMessage);
        messageInput.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
        const messageInput = document.getElementById('messageInput');
    
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

        if (messageInput.value.trim() !== '') {
            const newMessage = document.createElement('div');
            newMessage.classList.add('message', 'fade-in');
            newMessage.setAttribute('data-channel', selectedChannel);
            newMessage.innerHTML = `<span class="username">You:</span> ${messageInput.value}`;
            
            messagesContainer.appendChild(newMessage);
            messageInput.value = '';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });
});

document.addEventListener('keypress', function(event) {
    const messageInput = document.getElementById('messageInput');
    if (event.key.length === 1 && event.key.match(/[a-z0-9]/i)) {
        messageInput.focus();
    }
});