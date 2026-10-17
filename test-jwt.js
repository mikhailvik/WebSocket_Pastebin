const WebSocket = require('ws')

const ws = new WebSocket(
    'ws://localhost:8080?token=' + encodeURIComponent(process.env.TEST_JWT)
)

ws.on('open', () => {
    console.log('Connected with JWT!')
    ws.send('Hello from authorized user!')
})

ws.on('message', (message) => {
    console.log('Received:', message.toString())
    ws.close()
})

ws.on('close', (code, reason) => {
    console.log('Connection closed:', code, reason.toString())
})

ws.on('error', (error) => {
    console.log('Error:', error.message)
})
