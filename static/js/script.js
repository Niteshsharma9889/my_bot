const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

 // Function to add a message to the chat display
        function addMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', sender);

            const messageBubble = document.createElement('div');
            messageBubble.classList.add('message-bubble');
            messageBubble.innerHTML = text; // Use innerHTML to allow for basic formatting if needed

            messageDiv.appendChild(messageBubble);
            chatMessages.appendChild(messageDiv);

            // Scroll to the bottom of the chat
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Function to show the loading indicator
        function showLoading() {
            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add('message', 'bot', 'loading-indicator'); // Add a class to easily remove it later
            loadingDiv.innerHTML = `
                <div class="message-bubble loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
            chatMessages.appendChild(loadingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            sendButton.disabled = true; // Disable button while loading
            userInput.disabled = true; // Disable input while loading
        }

        // Function to hide the loading indicator
        function hideLoading() {
            const loadingIndicator = document.querySelector('.loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
            sendButton.disabled = false; // Re-enable button
            userInput.disabled = false; // Re-enable input
            userInput.focus(); // Focus back on input
        }

        // Function to send message to backend
        async function sendMessage() {
            const message = userInput.value.trim();
            if (message === '') return;

            addMessage(message, 'user');
            userInput.value = ''; // Clear input immediately

            showLoading(); // Show loading indicator

            try {
                // Make a fetch call to your Flask backend
                // IMPORTANT: Replace 'http://127.0.0.1:5000/chat' with your actual backend URL if deployed
                // const response = await fetch('http://127.0.0.1:5000/chat', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json'
                //     },
                //     body: JSON.stringify({ message: message })
                // });

                const response = await fetch('/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: message })
});


                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                hideLoading(); // Hide loading indicator
                addMessage(data.response, 'bot'); // Display bot's response

            } catch (error) {
                console.error('Error sending message:', error);
                hideLoading(); // Hide loading indicator even on error
                addMessage('Oops! Something went wrong. Please try again.', 'bot');
            }
        }

        // Event listeners
        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });

        // Focus on input on page load
        window.onload = () => {
            userInput.focus();
        };
