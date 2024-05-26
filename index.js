const supabaseUrl = 'https://jlccaghkykhwvituxmve.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsY2NhZ2hreWtod3ZpdHV4bXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY2NTA3MTMsImV4cCI6MjAzMjIyNjcxM30.0n6y-a3gz98ZB4s0ww7R11Suuf9Wm8LhElRCvi89ANg';
const client = supabase.createClient(supabaseUrl, supabaseKey);


document.addEventListener('DOMContentLoaded', function() {
    console.log('Document is fully loaded');

    const authForm = document.getElementById('authForm');
    const formTitle = document.getElementById('formTitle');
    const toggleFormText = document.getElementById('toggleForm');
    const messagesDiv = document.getElementById('messages');
    const chatroom = document.getElementById('chatroom');
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    let isLogin = true;
    let currentUser = null;

    function switchForm(event) {
        event.preventDefault();
        authForm.classList.add('transitioning');
        setTimeout(() => {
            if (isLogin) {
                formTitle.innerText = 'Sign Up';
                authForm.querySelector('button').innerText = 'Sign Up';
                toggleFormText.innerHTML = 'Already have an account? <a href="#" id="switchToSignup">Login</a>';
                isLogin = false;
            } else {
                formTitle.innerText = 'Login';
                authForm.querySelector('button').innerText = 'Login';
                toggleFormText.innerHTML = 'Don\'t have an account? <a href="#" id="switchToSignup">Sign up</a>';
                isLogin = true;
            }
            authForm.classList.remove('transitioning');
            document.getElementById('switchToSignup').addEventListener('click', switchForm);
        }, 500);
    }

    document.getElementById('switchToSignup').addEventListener('click', switchForm);

    authForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value.toLowerCase();

        if (isLogin) {
            const { data, error } = await client
                .from('User')
                .select('*')
                .eq('username', username);

            if (error) {
                console.error('Error logging in:', error);
                messagesDiv.innerText = `Error logging in: ${error.message}`;
                messagesDiv.className = 'message-error message-visible';
            } else if (data && data.length > 0) {
                console.log('User logged in:', data);
                currentUser = data[0];
                messagesDiv.innerText = `User ${username} logged in successfully!`;
                messagesDiv.className = 'message-success message-visible animate';

                // Start both animations simultaneously
                authForm.classList.add('fade-out');
                messagesDiv.classList.add('fade-out');

                // Wait for the animations to end before hiding elements and showing the chatroom
                const onFadeOutEnd = () => {
                    authForm.classList.add('hidden');
                    messagesDiv.classList.add('hidden');
                    messagesDiv.style.display = 'none';
                    chatroom.classList.add('fade-in');
                    chatroom.classList.remove('hidden');
                    loadMessages(); // Load existing messages
                    startPolling(); // Start polling for new messages
                };

                authForm.addEventListener('animationend', onFadeOutEnd, { once: true });
                messagesDiv.addEventListener('animationend', onFadeOutEnd, { once: true });
            } else {
                console.error('User not found');
                messagesDiv.innerText = `User ${username} not found. Please sign up.`;
                messagesDiv.className = 'message-error message-visible';
            }
        } else {
            const { data, error } = await client
                .from('User')
                .insert([{ username: username }])
                .select();

            if (error) {
                console.error('Error signing up:', error);
                if (error.message.includes('duplicate key value violates unique constraint "User_username_key"')) {
                    messagesDiv.innerText = `Username ${username} is already in use. Please choose another one.`;
                } else {
                    messagesDiv.innerText = `Error signing up: ${error.message}`;
                }
                messagesDiv.className = 'message-error message-visible';
            } else if (data && data.length > 0) {
                console.log('User signed up:', data);
                currentUser = data[0]; // Ensure we get the correct user object
                messagesDiv.innerText = `User ${username} signed up successfully!`;
                messagesDiv.className = 'message-success message-visible animate';

                // Start both animations simultaneously
                authForm.classList.add('fade-out');
                messagesDiv.classList.add('fade-out');

                // Wait for the animations to end before hiding elements and showing the chatroom
                const onFadeOutEnd = () => {
                    authForm.classList.add('hidden');
                    messagesDiv.classList.add('hidden');
                    messagesDiv.style.display = 'none';
                    chatroom.classList.add('fade-in');
                    chatroom.classList.remove('hidden');
                    loadMessages(); // Load existing messages
                    startPolling(); // Start polling for new messages
                };

                authForm.addEventListener('animationend', onFadeOutEnd, { once: true });
                messagesDiv.addEventListener('animationend', onFadeOutEnd, { once: true });
            } else {
                console.error('Failed to sign up user.');
                messagesDiv.innerText = `Failed to sign up user.`;
                messagesDiv.className = 'message-error message-visible';
            }
        }
    });

    chatForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const messageText = chatInput.value;
        if (messageText.trim() === '') return;

        const { data, error } = await client
            .from('Message')
            .insert([{ user_id: currentUser.id, content: messageText }]);

        if (error) {
            console.error('Error sending message:', error);
        } else {
            console.log('Message sent:', data);
            chatInput.value = ''; // Clear the input field
            loadMessages(); // Reload messages to include the new one
        }
    });

    async function loadMessages() {
        const { data, error } = await client
            .from('Message')
            .select('content, created_at, User(username)')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error loading messages:', error);
        } else {
            chatMessages.innerHTML = '';
            data.forEach(message => {
                const messageDiv = document.createElement('div');
                messageDiv.textContent = `${message.User.username}: ${message.content}`;
                chatMessages.appendChild(messageDiv);
            });
        }
    }

    function startPolling() {
        setInterval(loadMessages, 1000); // Poll for new messages every second
    }
});