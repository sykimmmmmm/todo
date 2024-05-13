/* 
스키마(데이터 구조)
클래스 정의 생성자 함수 정의 -> 객체 생성
*/
const mongoose = require('mongoose')
const moment = require('moment')
const { Schema } = mongoose
const { Types:{ ObjectId } } = Schema
// ObjectId : MONGODB ID 값의 자료형(data type)

const todoSchema = new Schema({ //스키마 정의
    author:{
        type : ObjectId,
        required : true,
        ref : 'User' // User 라는 데이터 모델 -> 조금 있다가 정의(사용자 ID값)
    },
    category:{
        type: String,
        required: true,
        trim: true
    },
    imgUrl: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type : String,
        required : true,
        trim : true // 문자열 양쪽 공백 제거
    },
    description: {
        type: String,
        trim: true
    },
    isDone: {
        type: Boolean,
        default: false //브라우저에서 전송된 값이 없으면 자동 설정
    },
    createdAt: {
        type: Date,
        default: Date.now // 현재시간
    },
    lastModifiedAt: {
        type: Date,
        default: Date.now // 현재시간
    },
    finishedAt: {
        type: Date,
        default: Date.now // 현재시간
    }
    //아주 복잡한 몽고 db 필드 더 추가되어야 됨
})

todoSchema.path('category').validate(function(value){
    return /오락|공부|음식|자기계발|업무|패션|여행/.test(value)
},'category `{VALUE}` 는 잘못된 형식입니다')

todoSchema.virtual('status').get(function(){
    return this.isDone? "종료" : "진행중"
})

todoSchema.virtual('createdAgo').get(function(){
    return moment(this.createdAt).locale('ko').fromNow()
})

todoSchema.virtual('lastModifiedAgo').get(function(){
    return moment(this.lastModifiedAt).locale('ko').fromNow()
})

todoSchema.virtual('finishedAgo').get(function(){
    return moment(this.finishedAt).locale('ko').fromNow()
})

// 스키마 -> 컴파일 (몽고 db가 인식할 수 있는 데이터 구조로 변환) -> 모델
const Todo = mongoose.model('Todo',todoSchema) // 컬렉션 이름이 Todo 에서 첫번째 글자를 소문자로 변환하고 맨 끝에 s붙임
module.exports = Todo

// const todo = new Todo({//메모리에만 존재
//     author:'111111111111111111111111',//몽고 db의 고유 ID값 (24자리)
//     title:'새로운 todo 연습',
//     description:'새로운 todo 만들어보기 연습'
// })
// todo.save() //실제 데이터베이스에 저장
// .then(()=> console.log('할일 생성 성공'))
// (async ()=>{
//     try{
//         await save()
//     }catch(e){
//         console.log(e)
//     }
// })()