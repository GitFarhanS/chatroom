const supabaseUrl = 'https://jlccaghkykhwvituxmve.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsY2NhZ2hreWtod3ZpdHV4bXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY2NTA3MTMsImV4cCI6MjAzMjIyNjcxM30.0n6y-a3gz98ZB4s0ww7R11Suuf9Wm8LhElRCvi89ANg';
const client = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', function() {
    console.log('Document is fully loaded');

    const authForm = document.getElementById('authForm');
    const formTitle = document.getElementById('formTitle');
    const toggleFormText = document.getElementById('toggleForm');
    const messagesDiv = document.getElementById('messages');
    let isLogin = true;

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
        const username = document.getElementById('username').value;

        if (isLogin) {
            const { data, error } = await client
                .from('User')
                .select('*')
                .eq('username', username.toLowerCase());

            if (error) {
                console.error('Error logging in:', error);
                messagesDiv.innerText = `Error logging in: ${error.message}`;
                messagesDiv.className = 'message-error message-visible';
            } else if (data.length > 0) {
                console.log('User logged in:', data);
                messagesDiv.innerText = `User ${username} logged in successfully!`;
                messagesDiv.className = 'message-success message-visible';
            } else {
                console.error('User not found');
                messagesDiv.innerText = `User ${username} not found. Please sign up.`;
                messagesDiv.className = 'message-error message-visible';
            }
        } else {
            const { data, error } = await client
                .from('User')
                .insert([{ username: username.toLowerCase() }]);

            if (error) {
                console.error('Error signing up:', error);
                if (error.message.includes('duplicate key value violates unique constraint "User_username_key"')) {
                    messagesDiv.innerText = `Username ${username} is already in use. Please choose another one.`;
                } else {
                    messagesDiv.innerText = `Error signing up: ${error.message}`;
                }
                messagesDiv.className = 'message-error message-visible';
            } else {
                console.log('User signed up:', data);
                messagesDiv.innerText = `User ${username} signed up successfully!`;
                messagesDiv.className = 'message-success message-visible';
            }
        }
    });
});
