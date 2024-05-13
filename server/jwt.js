const jwt = require('jsonwebtoken')


//HS256 암호화 알고리즘 -> 대칭키 알고리즘
const token = jwt.sign({ email: 'test@gmail.com '},'secret',{
    expiresIn : '1s',
})
new Promise((r)=>{
    setTimeout(r,1000)
}).then(()=>{
    //사용자 식별(권한검사)+ 사용자정보 위변조 여부 검사
    const decoded = jwt.decode(token,{complete:true})
    console.log(decoded)
    const verified = jwt.verify(token,'secret')
    console.log('veri',verified)
})
console.log('token',token)//jwt토큰 혹은 시그니쳐(signiture) -> base64문자열