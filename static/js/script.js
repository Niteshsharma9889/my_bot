document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        appendMessage('You', message);
        userInput.value = '';
        userInput.disabled = true;
        sendBtn.disabled = true;

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            if (data.response) {
                appendMessage('Bot', data.response);
            } else if (data.error) {
                appendMessage('Bot', '⚠️ Error: ' + data.error);
            } else {
                appendMessage('Bot', '⚠️ Unexpected response from server.');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            appendMessage('Bot', '❌ Failed to connect to server.');
        } finally {
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
        }
    }

    function appendMessage(sender, message) {
        const messageElem = document.createElement('div');
        messageElem.classList.add('message');
        messageElem.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatBox.appendChild(messageElem);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
