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
        let token = localStorage.getItem('jwt')

        // Check if access token has expired 
        // Jag delar upp JWT-token i tre delar och läser payload-delen. Sedan avkodar jag den från Base64URL och omvandlar JSON-texten till ett JavaScript-objekt.
        // Jag jämför tokenens utgångstid med den aktuella tiden. 
        // Om tokenen har gått ut behöver klienten begära en ny access token med hjälp av refresh token.
        /*
        AI-användning – Del 3!

        När jag testade min WebSocket Pastebin märkte jag att JWT-tokenen
        gick ut efter 15 minuter, men inte alltid uppdaterades automatiskt.

        Jag använde ChatGPT för att få hjälp med felsökningen och för att
        skapa funktionen isTokenExpired().

        ChatGPT hjälpte mig att förstå hur JWT-payload fungerar och hur
        man kontrollerar tokenens utgångstid (exp).

        Jag valde att skriva funktionen i enkla steg med kommentarer
        för att lättare förstå och kunna förklara koden.
        */
        function isTokenExpired(token) {
            try {
                // JWT has three parts separated by dots
                const parts = token.split('.')

                // The second part contains the token data
                const payload = parts[1]

                // Decode the JWT payload
                const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))

                // Convert JSON text into a JavaScript object
                const data = JSON.parse(decoded)

                // Check if the token has expired
                return Date.now() >= data.exp * 1000

            } catch (error) {
                return true
            }
        }


        // Del3 Get a new access token using refresh token
        async function refreshAccessToken() {
            const refreshToken = localStorage.getItem('refresh_token')

            if (!refreshToken) {
                return false
            }

            try {
                const response = await fetch('https://virtual-board-authentication.onrender.com/users/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refresh_token: refreshToken })
                })

                if (!response.ok) {
                    return false
                }

                const data = await response.json()

                // Save new access token
                localStorage.setItem('jwt', data.jwt)
                return true

            } catch (error) {
                console.error('Token refresh failed:', error)
                return false
            }
        }

        // Del 3 Automatically check JWT every 10 seconds
         setInterval(async () => {
            const currentToken = localStorage.getItem('jwt')

            if (currentToken && isTokenExpired(currentToken)) {
                 const refreshed = await refreshAccessToken()

                if (refreshed) {
                     // Reload page to reconnect with the new JWT
                     window.location.reload()
                } else {
                    // Go to login if refresh token is invalid
                    localStorage.removeItem('jwt')
                    localStorage.removeItem('refresh_token')
                    window.location.href = 'login.html'
                 }
             }
        }, 10000)
            

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
        ws.onclose = async (event) => {
            document.getElementById('status').textContent = 'Disconnected'

           // If access token expired, get a new one
            /*if (event.code === 1008 && event.reason === 'Token expired!') {
                const refreshed = await refreshAccessToken()

                if (refreshed) {
                    // Reconnect with the new JWT
                    window.location.reload()
                    return
                }
            }

            // If JWT is invalid or expired - go to login.html
            if (event.code === 1008) {
                localStorage.removeItem('jwt')
                localStorage.removeItem('refresh_token') // Del 3 remove refresh token on logout
                window.location.href = 'login.html'
            }*/

            //Del 3 If authorization failed, try to refresh the token
            if (event.code === 1008) {
                const refreshed = await refreshAccessToken()

                if (refreshed) {
                    window.location.reload()
                } else {
                     localStorage.removeItem('jwt')
                    localStorage.removeItem('refresh_token')
                    window.location.href = 'login.html'
                }
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

    // Del 2 Reconnect button
    document.getElementById('reconnect').addEventListener('click', () => {
        window.location.reload()
    })

    // Del 3 Logout button
    document.getElementById('logout').addEventListener('click', async () => {
        const refreshToken = localStorage.getItem('refresh_token')

        // Delete refresh token from database
        if (refreshToken) {
            try {
                await fetch('https://virtual-board-authentication.onrender.com/users/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': refreshToken
                    }
                })
            } catch (error) {
                console.error('Logout failed:', error)
            }
        }

        // Remove tokens from LocalStorage
        localStorage.removeItem('jwt')
        localStorage.removeItem('refresh_token')

        // Close WebSocket connection
        ws.close()
        // to login page
        window.location.href = 'login.html'
    })

}
