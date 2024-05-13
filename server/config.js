const dotenv = require('dotenv')

dotenv.config() // process.env 객체에 .env에 정의한 환경변수 추가

module.exports = {
    MONGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET: process.env.JWT_SECRET
}