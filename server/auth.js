const config = require('./config')
const jwt = require('jsonwebtoken')

const generateToken = (user)=>{//토큰 생성 유틸리티 함수
    return jwt.sign({
        _id: user._id,
        name:user.name,
        userId:user.Id,
        isAdmin:user.isAdmin,
        createdAt:user.createdAt,
    },config.JWT_SECRET,{ // 비밀키
        expiresIn:'1d',
        issuer:'sykimmmmmm'
    })
}

/** 사용자권한 검증 */
const isAuth = (req,res,next)=> { //사용자 권한 검증하는 미들웨어
    const bearerToken = req.headers.authorization // 요청헤더의 Authorization 속성
    if(!bearerToken){
        return res.status(401).json({message:'Token is not supplied!'})
    }else{
        const token = bearerToken.slice(7,bearerToken.length)//bearer 글자 제거
        jwt.verify(token, config.JWT_SECRET, (err, userInfo) =>{
            if(err && err.name === 'TokenExpiredError'){//토큰 만료
                return res.status(419).json({code:419, message:'Token expired!'})
            }else if(err){//토큰 위변조되어 복호화x
                return res.status(401).json({code:401, message:'Invalid Token!'})
            }
            req.user = userInfo
            next()//권한이 있는 사용자의 서비스 허용
        })
    }
}

/** 관리자여부 검증 */
const isAdmin = (req,res,next)=>{//관리자 여부 검증
    if(req.user && req.user.isAdmin){
        next()
    }else{
        return res.status(401).json({code:401, message:'You are not valid admin user'})
    }
}



module.exports={
    generateToken,
    isAuth,
    isAdmin
}