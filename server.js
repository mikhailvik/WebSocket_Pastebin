// WebSocket server for Pastebin!
const WebSocket = require('ws')

const jwt = require('jsonwebtoken')
require('dotenv').config()

const PORT = process.env.PORT || 8080

// Start WebSocket server on port 8080
const wss = new WebSocket.Server({ port: PORT })

console.log(`WebSocket server running on port ${PORT}!`)

// When a client connects we can see it
wss.on('connection', (ws, req) => {

    // Get JWT from URL
    const url = new URL(req.url, 'http://localhost')
    const token = url.searchParams.get('token')

    try {
        // Verify JWT
        const user = jwt.verify(token, process.env.JWT_SECRET)
        ws.userId = user.sub
        console.log(`User ${ws.userId} connected!`)

    } catch (error) {
        console.log('Authorization failed:', error.message)
        ws.close(1008, 'Authorization failed')
        return
    }

    // When a client sends some text
    ws.on('message', (message) => {
        const text = message.toString()
        console.log('Received:', text)

        // Send only to clients of the same user
        wss.clients.forEach((client) => {
            if (
                client.readyState === WebSocket.OPEN &&
                client.userId === ws.userId
            ) {
                client.send(text)
            }
        })
    })

    ws.on('close', () => {
        console.log(`User ${ws.userId} disconnected`)
    })
})