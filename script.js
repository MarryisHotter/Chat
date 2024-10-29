document.getElementById('sendButton').addEventListener('click', function() {
    const messageInput = document.getElementById('messageInput');
    const messagesContainer = document.getElementById('messages');
    
    if (messageInput.value.trim() !== '') {
        const newMessage = document.createElement('div');
        newMessage.classList.add('message');
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
    
        chatHeader.innerHTML = `<h2>${this.innerText}</h2>`;
        
        messagesContainer.innerHTML = '';
    });
});
