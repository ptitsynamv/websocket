# websocket

Installation
1. git clone ...

2. Run commands:

    cd websocket
    
    npm i
    

3. Run migrate:

    cd migrations
    
    migrate-mongo up

You create
DB: websocket
User:
    email = admin@admin.com,
    password = qwerty

4. Run commands:

    cd ../client
    
    npm i

5. run server and client:

    cd ../
    
    npm run dev

6. Open http://localhost:4200


For check "gravatar для загрузки аватара пользователя по его email" use  email: 'ptitsynamv@gmail.com'
If "Error: listen EADDRINUSE :::3000" - sudo kill $(sudo lsof -t -i:3000)
