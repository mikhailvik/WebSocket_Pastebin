// Authentication API
const AUTH_URL = 'https://virtual-board-authentication.onrender.com/users/login'

// Login and connect to WebSocket
async function connect() {
    const email = prompt('Enter please your email:')
    const password = prompt('Enter please your password:')

    if (!email || !password) {
        document.getElementById('status').textContent = 'Login cancelled!'
        return
    }

    try {
        // Get JWT from Authentication API
        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })

        if (!response.ok) {
            throw new Error('Login failed!!!')
        }

        const data = await response.json()
        const token = data.jwt

        if (!token) {
            throw new Error('JWT not received!!!')
        }

        // Connect to WebSocket using JWT
        const ws = new WebSocket(
            'ws://localhost:8080?token=' + encodeURIComponent(token)
        )

        // Show connection status
        ws.onopen = () => {
            document.getElementById('status').textContent = 'Connected to server'
        }

        // Receive text from server
        ws.onmessage = (event) => {
            document.getElementById('received').value = event.data
        }

        // Show disconnected status
        ws.onclose = () => {
            document.getElementById('status').textContent = 'Disconnected'
        }

        // Send text to server
        document.getElementById('send').addEventListener('click', () => {
            const text = document.getElementById('message').value

            if (ws.readyState === WebSocket.OPEN) {
                ws.send(text)
            }
        })

    } catch (error) {
        document.getElementById('status').textContent = error.message
        console.error(error)
    }
}

// Start login
connect()