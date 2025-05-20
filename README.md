# websocket

##Installation
1. Run commands:
    `cd websocket`
    `npm i`   
2. Run migrate:
`cd migrations`
 `migrate-mongo up` 
You create
DB: websocket
User:
    - email = admin@admin.com,
    - password = qwerty

3. Run commands:
`cd ../client`
`npm i` 
   
4. run server and client:
`cd ../`
`npm run dev`  

5. Open http://localhost:4200

### Error

If "Error: listen EADDRINUSE :::3000" - run `sudo kill $(sudo lsof -t -i:3000)`
