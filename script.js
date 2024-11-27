const lastMessageTimestamps = {};
let username = "";  // Variable to hold the fetched username
let currentChannelId = null;
let currentChannelName = '';

// Fetch the username from get-username.php
fetch('get-username.php')
    .then(response => {
        console.log(response);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            console.error('Error:', data.error);
        } else {
            username = data.username;
        }
    })
    .catch(error => console.error('Error fetching username:', error));

document.getElementById('sendButton').addEventListener('click', function() {
    const messageInput = document.getElementById('messageInput');
    const messagesContainer = document.getElementById('messages');
    const currentChannel = currentChannelId;

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

        newMessage.innerHTML = `<span class="username">${username}:</span> <span class="message-content">${messageInput.value}</span>`;
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
            body: `channel=${encodeURIComponent(currentChannel)}&username=${encodeURIComponent(username)}&message=${encodeURIComponent(messageInput.value)}`
        }).then(response => response.text())
          .then(data => {
              console.log('Success:', data);
              messageInput.value = ''; // Clear the input field
              loadMessages(currentChannel); // Reload messages after sending
          })
          .catch(error => console.error('Error:', error));
    }
});

document.getElementById('messageInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const messageInput = document.getElementById('messageInput');
        if (event.shiftKey) {
            const cursorPosition = messageInput.selectionStart;
            messageInput.setRangeText('\n', cursorPosition, cursorPosition, 'end');
            messageInput.selectionStart = messageInput.selectionEnd = cursorPosition + 1;
            console.log('Shift + Enter pressed');
        } else {
            console.log('Enter pressed');
            document.getElementById('sendButton').click();
        }
    }
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
    const channelType = document.querySelector('input[name="channelType"]:checked').value;
    const channelsContainer = document.getElementById('channels');
    const channelError = document.getElementById('channelError');
    let users = [];

    if (channelType === 'private') {
        users = Array.from(document.querySelectorAll('.user-checkbox:checked')).map(cb => cb.value);
    }

    if (newChannelName === '') {
        channelError.innerText = 'Channel name cannot be empty.';
        return;
    }

    const existingChannel = document.getElementById(newChannelName.toLowerCase());
    if (existingChannel) {
        channelError.innerText = 'Channel name already in use. Please use a different name.';
        return;
    }

    fetch('save-channel.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `channelName=${encodeURIComponent(newChannelName)}&channelType=${encodeURIComponent(channelType)}&users=${encodeURIComponent(JSON.stringify(users))}`
    }).then(response => response.json())
      .then(data => {
          if (data.error) {
              channelError.innerText = data.error;
          } else {
              const newChannel = document.createElement('div');
              newChannel.classList.add('channel');
              newChannel.id = newChannelName.toLowerCase();
              newChannel.innerText = newChannelName;

              newChannel.addEventListener('click', function() {
                  const chatHeader = document.getElementById('chatHeader');
                  const selectedChannel = this.id; // Use the channel ID directly
              
                  chatHeader.innerHTML = `<h2>${newChannelName}</h2>`;

                  // Clear existing messages and load new ones
                  const messagesContainer = document.getElementById('messages');
                  messagesContainer.innerHTML = '';
                  loadMessages(selectedChannel);
                  localStorage.setItem('lastChannel', selectedChannel);
              });

              channelsContainer.appendChild(newChannel);
              document.getElementById('newChannelName').value = '';
              channelError.innerText = '';
          }
      })
      .catch(error => {
          channelError.innerText = 'Error creating channel: ' + error;
      });
});

// Toggle user selection based on channel type
document.querySelectorAll('input[name="channelType"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const userSelection = document.getElementById('userSelection');
        if (this.value === 'private') {
            userSelection.classList.remove('hidden');
            loadUserList(); // Load initial user list
        } else {
            userSelection.classList.add('hidden');
            document.getElementById('userList').innerHTML = '';
            document.getElementById('userSearchInput').value = '';
        }
    });
});

// Modify loadUserList to accept a search query
function loadUserList(searchText = '') {
    fetch(`search-users.php?query=${encodeURIComponent(searchText)}`)
        .then(response => response.json())
        .then(data => {
            const userList = document.getElementById('userList');
            userList.innerHTML = '';
            data.users.forEach(user => {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('user-checkbox');
                checkbox.value = user.username;
                const label = document.createElement('label');
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(user.username));
                userList.appendChild(label);
            });
        })
        .catch(error => console.error('Error fetching user list:', error));
}

// Add event listener for the search input
document.getElementById('userSearchInput').addEventListener('input', function() {
    const searchText = this.value.trim();
    loadUserList(searchText);
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

// Function to open user profile
function openUserProfile(username) {
    const userProfilePopup = document.getElementById('userProfilePopup');
    userProfilePopup.querySelector('.username').innerText = username;
    userProfilePopup.classList.add('visible');
    const overlay = document.getElementById('overlay');
    overlay.classList.add('visible');
    overlay.classList.remove('hidden');
    // Add event listener to overlay to close profile when clicked outside
    overlay.addEventListener('click', closeUserProfile);
}

// Function to close user profile
function closeUserProfile() {
    const userProfilePopup = document.getElementById('userProfilePopup');
    userProfilePopup.classList.remove('visible');
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('visible');
    overlay.classList.add('hidden');
    // Remove event listener from overlay
    overlay.removeEventListener('click', closeUserProfile);
}

// Event listener for usernames in messages
function addUsernameClickEvents() {
    const usernames = document.querySelectorAll('.message .username');
    usernames.forEach(usernameElement => {
        usernameElement.addEventListener('click', function() {
            const username = this.innerText.replace(':', '');
            openUserProfile(username);
        });
    });
}

// Modify loadMessages function to add username click events after loading messages
function loadMessages(channelId) {
    fetch(`load-messages.php?channel=${encodeURIComponent(channelId)}`)
        .then(response => response.json())
        .then(data => {
            const messagesContainer = document.getElementById("messages");
            messagesContainer.innerHTML = ''; // Clear existing messages
            data.forEach(message => {
                const messageElement = document.createElement("div");
                messageElement.classList.add("message");
                messageElement.setAttribute('data-channel', channelId);
                messageElement.setAttribute('data-date', message.timestamp.split(' ')[0]);
                messageElement.setAttribute('data-timestamp', message.timestamp.split(' ')[1]);

                messageElement.innerHTML = `
                    <span class="username">${message.username}:</span>
                    <span class="message-content">${message.message}</span>
                    <span class="date">${message.timestamp.split(' ')[0]}</span>
                    <span class="timestamp">${message.timestamp.split(' ')[1]}</span>
                `;
                messagesContainer.appendChild(messageElement);
            });
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            addUsernameClickEvents(); // Add this line
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Event listener for usernames in user dropdown
function addUserDropdownEvents() {
    const userItems = document.querySelectorAll('#userDropdownContent .user-item');
    userItems.forEach(userItem => {
        userItem.addEventListener('click', function() {
            const username = this.innerText;
            openUserProfile(username);
        });
    });
}

// Modify the code where user dropdown is populated
// ...existing code...
fetch(`get-channel-users.php?channel=${encodeURIComponent(selectedChannel)}`)
    .then(response => response.json())
    .then(data => {
        const userDropdownContent = document.getElementById('userDropdownContent');
        userDropdownContent.innerHTML = '';
        // ...existing code...
        data.users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.textContent = user.username;
            userItem.classList.add('user-item'); // Add this line
            userDropdownContent.appendChild(userItem);
        });
        addUserDropdownEvents(); // Add this line
    })
    .catch(error => {
        // ...existing code...
    });
// ...existing code...

// Event listener for closing the user profile popup
document.getElementById('closeUserProfileButton').addEventListener('click', function() {
    closeUserProfile();
});

function loadChannels() {
    fetch('load-channels.php')
        .then(response => {
            console.log('Response Headers:', response.headers); // Log response headers for debugging
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Received non-JSON response');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                // Optionally display error message to the user
                return;
            }

            const channelsContainer = document.getElementById('channels');
            channelsContainer.innerHTML = ''; // Clear existing channels

            data.channels.forEach(channel => {
                const channelElement = document.createElement('div');
                channelElement.classList.add('channel');
                channelElement.id = channel.id; // Set the ID of the channel
                channelElement.innerText = channel.name; // Set the NAME of the channel

                // Capture channel properties
                const channelId = channel.id;
                const channelName = channel.name;
                const channelType = channel.type;

                channelElement.addEventListener('click', function() {
                    const chatHeader = document.getElementById('chatHeader');
                    const selectedChannel = channelId; // Use captured channel ID

                    chatHeader.querySelector('h2').textContent = channelName; // Use captured channel name

                    // Set currentChannelId and currentChannelName before the fetch call
                    currentChannelId = channelId;
                    currentChannelName = channelName;

                    if (channelType === 'private') {
                        const userDropdownContainer = document.querySelector('.user-dropdown-container');
                        userDropdownContainer.style.display = 'block';

                        // Attach the event listener to the dropdown button
                        const userDropdownButton = document.getElementById('userDropdownButton');
                        if (userDropdownButton && !userDropdownButton._eventAttached) {
                            userDropdownButton.addEventListener('click', function(event) {
                                event.stopPropagation();
                                const dropdownContent = document.getElementById('userDropdownContent');
                                dropdownContent.classList.toggle('active');

                                // Rotate the arrow icon
                                const arrow = this.querySelector('.arrow');
                                arrow.textContent = dropdownContent.classList.contains('active') ? '▴' : '▾';

                                // Fetch and display user data
                                fetch(`get-channel-users.php?channel=${encodeURIComponent(currentChannelId)}`, {
                                    credentials: 'include'
                                })
                                .then(response => response.json())
                                .then(data => {
                                    console.log('Users:', data.users);
                                    console.log('Total users:', data.users.length);
                                    const userDropdownContent = document.getElementById('userDropdownContent');
                                    userDropdownContent.innerHTML = ''; // Clear existing content to avoid duplication
                                    if (data.users && data.users.length > 0) {
                                        data.users.forEach(user => {
                                            const userItem = document.createElement('div');
                                            userItem.textContent = user.username;
                                            userItem.classList.add('user-item');
                                            userDropdownContent.appendChild(userItem);
                                        });
                                        const userCount = document.createElement('div');
                                        userCount.textContent = `Total users: ${data.users.length}`;
                                        userCount.classList.add('user-count');
                                        userDropdownContent.appendChild(userCount);
                                        addUserDropdownEvents();
                                    } else {
                                        const noUsersItem = document.createElement('div');
                                        noUsersItem.textContent = 'No users found';
                                        userDropdownContent.appendChild(noUsersItem);
                                    }
                                })
                                .catch(error => {
                                    console.error('Error fetching channel users:', error);
                                    const userDropdownContent = document.getElementById('userDropdownContent');
                                    userDropdownContent.innerHTML = '<div>Error loading users</div>';
                                });
                            });
                            userDropdownButton._eventAttached = true; // Mark event as attached
                        }

                        // Use the updated currentChannelId in the fetch call
                        fetch(`get-channel-users.php?channel=${encodeURIComponent(currentChannelId)}`, {
                            credentials: 'include'
                        })
                        .then(response => response.json())
                        .then(data => {
                            const userDropdownContent = document.getElementById('userDropdownContent');
                            userDropdownContent.innerHTML = '';
                            if (data.users && data.users.length > 0) {
                                data.users.forEach(user => {
                                    console.log(user + ' is a user ' + user.username);
                                    const userItem = document.createElement('div');
                                    userItem.textContent = user.username;
                                    userItem.classList.add('user-item'); // Add this line
                                    userDropdownContent.appendChild(userItem);
                                });
                                addUserDropdownEvents();
                            } else {
                                const noUsersItem = document.createElement('div');
                                noUsersItem.textContent = 'No users found';
                                userDropdownContent.appendChild(noUsersItem);
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching channel users:', error);
                            const userDropdownContent = document.getElementById('userDropdownContent');
                            userDropdownContent.innerHTML = '<div>Error loading users</div>';
                        });
                    } else {
                        const userDropdownContainer = document.querySelector('.user-dropdown-container');
                        userDropdownContainer.style.display = 'none';
                    }

                    loadMessages(selectedChannel);
                    localStorage.setItem('lastChannel', selectedChannel);
                });
                document.getElementById('channels').appendChild(channelElement);
            });

            // Load the last selected channel or the first available channel
            const savedChannel = localStorage.getItem('lastChannel') || (data.channels.length > 0 ? data.channels[0].id : null);
            if (savedChannel) {
                const channelElement = document.getElementById(savedChannel);
                if (channelElement) {
                    channelElement.click();
                }
            }
        })
        .catch(error => {
            console.error('Error loading channels:', error);
            // Optionally display error message to the user
        });
}

//Close the dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdownContent = document.getElementById('userDropdownContent');
    const userDropdownButton = document.getElementById('userDropdownButton');
    console.log("1" + event.target);
    if (dropdownContent.classList.contains('active') && !dropdownContent.contains(event.target) && event.target !== userDropdownButton) {
        dropdownContent.classList.remove('active');
        console.log("2" + dropdownContent);
        const arrow = userDropdownButton.querySelector('.arrow');
        arrow.textContent = '▾';
    }
});