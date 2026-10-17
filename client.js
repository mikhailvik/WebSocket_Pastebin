//Moved to login.html without prompt, now using form input fields for email and password.
// Authentication API
/*const AUTH_URL = 'https://virtual-board-authentication.onrender.com/users/login'

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

        // Save JWT in LocalStorage
            localStorage.setItem('jwt', token)

        if (!token) {
            throw new Error('JWT not received!!!')
        }
        */

        // Get JWT from LocalStorage
        const token = localStorage.getItem('jwt')

        // If there is no JWT, go to login page
        if (!token) {
            window.location.href = 'login.html'
        } else {


        // Connect to WebSocket using JWT
        //const ws = new WebSocket('ws://localhost:8080?token=' + encodeURIComponent(token))
        // Connect to WebSocket server on Render using JWT
        const ws = new WebSocket('wss://websocket-pastebin-yeua.onrender.com?token=' + encodeURIComponent(token))

        // Show connection status
        ws.onopen = () => {
            document.getElementById('status').textContent = 'Connected to server'
        }

        // Receive text from server
        ws.onmessage = (event) => {
            document.getElementById('received').value = event.data
        }

        // Show disconnected status
        ws.onclose = (event) => {
            document.getElementById('status').textContent = 'Disconnected'

            // If JWT is invalid or expired - go to login.html
            if (event.code === 1008) {
                localStorage.removeItem('jwt')
                window.location.href = 'login.html'
            }

        }

        // Send text to server
        document.getElementById('send').addEventListener('click', () => {
            const text = document.getElementById('message').value

            if (ws.readyState === WebSocket.OPEN) {
                ws.send(text)
            }
        })

    //Moved to login.html
    /*} catch (error) {
        document.getElementById('status').textContent = error.message
        console.error(error)
    }*/

    // Reconnect button
    document.getElementById('reconnect').addEventListener('click', () => {
        window.location.reload()
    })
}
