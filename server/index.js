const express = require('express')
const app = express()
const cors = require('cors')
const logger = require('morgan')
const mongoose = require('mongoose')
const axios = require('axios')
const usersRouter = require('./src/routes/users')
const todosRouter = require('./src/routes/todos')
const config = require('./config')
const {asyncFunction, wrap} = require('./async')

const corsOptions = {//CORS 옵션
    origin : 
    [
        'http://127.0.0.1:5500','http://localhost:5500','http://127.0.0.1:5501',
        'http://localhost:5501','http://localhost:3000','http://127.0.0.1:3000'
    ], //해당 url 주소만 요청을 허락
    credentials : true // 사용자 인증이 필요한 리소스를 요청할 수 있도록 허용함
}


mongoose.connect(config.MONGODB_URL)//프로미스 
.then(()=> console.log('데이터베이스 연동'))
.catch(e=> console.log(`데이터 연결 실패!!! : ${e}`))


/* ****************************** 공통 미들웨어 ************************************* */
app.use(cors(corsOptions)) //cors 설정 미들웨어
app.use(express.json())//요청본문(request body) 파싱(해석)을 위한 미들웨어
app.use(logger('tiny'))//로거설정
/* ********************************************************************************* */

/* ********************************* REST API 미들웨어 ****************************** */
app.use('/api/users', usersRouter) //User 라우터
app.use('/api/todos', todosRouter) //Todo 라우터
/* ********************************************************************************* */

app.get('/hello',(req,res)=>{
    res.json('서버에서 보낸 응답!')
})

app.post('/hello',(req,res)=>{
    console.log(req.body)
    res.json({ userId: req.body.userId, email: req.body.email })
})

app.get('/error',(req,res)=>{
    throw new Error('서버에 치명적인 오류 발생')
})

app.get('/fetch', async(req,res)=>{
    //OPEN API 데이터 요청
    const response = await axios.get('https://jsonplaceholder.typicode.com/todos')
    // console.log(response)
    res.send({todos:response.data})
})

/* 비동기 에러 처리 연습 */
app.get('/async-function', wrap(asyncFunction),(req,res,next)=>{
    console.log(req.a)
    res.json(req.a)
})

/**
 * 사용자가 요청한 URL 이 없거나 서버 자체 오류가 발생한 경우 이를 처리하는 로직을 폴백 핸들러(fallback handler) 
 * 폴백 핸들러는 반드시 내가 접속하고자 하는 URL 주소보다 아래쪽에 위치해야 한다. */
app.use((req,res,next)=>{
    res.status(404).send('페이지를 찾을 수 없습니다...')
})

app.use((err,req,res,next)=>{//에러처리 미들웨어 / 폴백 핸들러
    console.log(err.stack)
    res.status(500).send('서버 에러 발생!')
})

app.listen(5000,()=>{
    console.log('server is running on port 5000...')
})