const express = require('express')
const User = require('../models/User')//데이터 CURD를 위한 모델 가져오기
const expressAsyncHandler = require('express-async-handler')
const { generateToken, isAuth } = require('../../auth')
const { validationResult, oneOf } = require('express-validator')
const { validateUserName, validateUserEmail, validateUserPassword } = require('../../validator')
const { limitUsage } = require('../../limiter')

const router = express.Router()//라우터 모듈

const validateUserInfo = [validateUserName(),validateUserEmail(),validateUserPassword()]// 폼검증을 위한 미들웨어


router.post('/register', limitUsage, validateUserInfo, expressAsyncHandler(async (req, res, next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){//폼검증에 실패한 경우
        console.log(errors.array())
        res.status(400).json({code:400,message:'Invalid Form data for user', error: errors.array()})
    }else{
        console.log(req.body)
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            userId: req.body.userId,
            password: req.body.password,
        })
        try{
            const newUser = await user.save()
            const { name, email, userId, isAdmin, createdAt, status, createdAgo, lastModifiedAgo  } = newUser
            res.json({
                code:200 , token: generateToken(newUser), //사용자 식별 + 권한검사를 위한 용도
                name, email, userId, isAdmin, createdAt, // 사용자에게 보여주기 위한 용도
                status,
                createdAgo,
                lastModifiedAgo
            })
        }catch(e){
            console.log(e)
            if(e.code === 11000){
                return res.status(400).json({code:400, message:'이메일 중복'})
            }
            res.status(400).json({code:400,message:'Invalid User Data'})
        }
        // user.save() //사용자 정보DB 저장
        // .then(()=>{
        //     const {name, email, userId, isAdmin, createdAt, status, createdAgo, lastModifiedAgo } = user
        //     res.json({
        //         code:200 , token: generateToken(user), //사용자 식별 + 권한검사를 위한 용도
        //         name, email, userId, isAdmin, createdAt, // 사용자에게 보여주기 위한 용도
        //         status: user.status,
        //         createdAgo: user.createdAgo,
        //         lastModifiedAgo: user.lastModifiedAgo
        //     })
        // })
        // .catch(e=>{
        //     console.log(e)
        //     if(e.code === 11000){
        //         return res.status(400).json({code:400, message:'이메일 중복'})
        //     }
        //     res.status(400).json({code:400,message:'Invalid User Data'})
        // })
        // if(!newUser){
        //     res.status(400).json({code:400,message:'Invalid User Data'})
        // }else{
        //     const {name, email, userId, isAdmin, createdAt } = newUser
        //     res.json({
        //         code:200 , token: generateToken(newUser), //사용자 식별 + 권한검사를 위한 용도
        //         name, email, userId, isAdmin, createdAt // 사용자에게 보여주기 위한 용도
                
        //     })
        // }
    }
}))

router.post('/login', limitUsage, [validateUserEmail(),validateUserPassword()], expressAsyncHandler(async (req, res, next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors.array())
        res.status(400).json({
            code:400,
            message:'Invalid Form data for user',
            error: errors.array()
        })
    }else{
        console.log(req.path)
        // console.log(req.body)
        const loginUser = await User.findOne({
            email:req.body.email,
            password:req.body.password
        })
        if(!loginUser){
            res.status(401).json({code:401, message:'Invalid Email or Invalid Password'})
        }else{
            const { name, email, userId, isAdmin, createdAt, createdAgo } = loginUser
            res.json({
                code:200,
                token: generateToken(loginUser),
                name, email, userId, isAdmin, createdAt, createdAgo
            })
        }
    }
}))

router.post('/logout', limitUsage, (req, res, next)=>{
    res.json('로그아웃')
})

router.put('/', limitUsage, oneOf(validateUserInfo,{message:'At least one field of User must be provided'}), isAuth, expressAsyncHandler(async (req, res, next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors.array())
        res.status(400).json({
            code:400,
            message:'Invalid Form data for user',
            error : errors.array()
        })
    }else{
        const user = await User.findById(req.user._id)//회원인지 검사 //로그인한 사용자의id를 어떻게 조회하는가?
        if(!user){
            res.status(404).json({code:404, message:"User not Found!"})
        }else{
            user.name = req.body.name || user.name
            user.email = req.body.email || user.email
            user.password = req.body.password || user.password
            user.userId = req.body.userId || user.userId
            user.lastModifiedAt = new Date() //사용자 정보 수정 시각
            
            const updatedUser = await user.save() //실제 사용자 정보 수정을 db에 반영
            const { name, email, userId, isAdmin, createdAt, createdAgo, lastModifiedAgo, status } = updatedUser
            res.json({
                code:200,
                token: generateToken(updatedUser),
                name, email, userId, isAdmin, createdAt, createdAgo, lastModifiedAgo, status
            })
        }
    }
}))

router.delete('/', limitUsage, isAuth, expressAsyncHandler(async (req, res, next)=>{
    const user = await User.findByIdAndDelete(req.user._id)
    if(!user){
        res.status(404).json({code:404, message:'User Not Found'})
    }else{
        res.status(204).json({code:204, message: 'User deleted successfully'})
    }
}))
module.exports = router