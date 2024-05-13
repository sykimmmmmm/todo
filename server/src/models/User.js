const mongoose = require('mongoose')
const moment = require('moment')
const { Schema } = mongoose

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,//unique: 색인(primary key) email은 중복불가
    },
    userId: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModifiedAt: {
        type: Date,
        default: Date.now
    }
})

// .co.kr .gov .com
userSchema.path('email').validate(function(value){
    return /^[a-zA-Z0-9]+@{1}[a-z]+(\.[a-z]{2})?(\.[a-z]{2,3})$/.test(value)
},'email `{VALUE}`는 잘못된 이메일 형식입니다')//밸리데이트에는 데이터검증을위한 콜백함수

// 숫자,특문 최소 1개포함 (7~15자)
userSchema.path('password').validate(function(value){
    return /^(?=.*[0-9])(?=.*[!@#$%^&*~])[a-zA-Z0-9~!@#$%^&*]{7,15}/.test(value)
},'password `{VALUE}`는 잘못된 비밀번호 형식입니다.')

userSchema.virtual('status').get(function(){
    return this.isAdmin ? "관리자":"사용자"
})

userSchema.virtual('createdAgo').get(function(){
    return moment(this.createdAt).locale('ko').fromNow()
})

userSchema.virtual('lastModifiedAgo').get(function(){
    return moment(this.lastModifiedAt).locale('ko').fromNow()
})

const User = mongoose.model('User',userSchema)
module.exports = User

//user 데이터 생성 테스트
// const user = new User({
//     name:'sykim',
//     email:'sykim@gmail.com',
//     userId:'sykim',
//     password:'1q2w3e4r',
//     isAdmin:true,
// })
// user.save().then(()=>{
//     console.log('회원가입 성공')
// })