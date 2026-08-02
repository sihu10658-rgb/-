# Echo Bot Backup App

간단한 룰 기반 에코 봇입니다. HTTP API로 동작하며, min-n 유틸(endpoint 제공)도 포함되어 있습니다.

Endpoints
- GET /?message=hello        -> { "reply": "..." }
- POST /message { "message": "..." } -> { "reply": "..." }
- GET /min-n?x=0.5[&tol=1e-14] -> { "x", "tol", "n" }

로컬 실행
1. npm install
2. npm start
3. curl 'http://localhost:3000/?message=ping'

Docker
- docker build -t echo-bot-app .
- docker run -p 3000:3000 echo-bot-app
