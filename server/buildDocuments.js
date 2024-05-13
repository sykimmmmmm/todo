const mongoose = require('mongoose')
const User = require('./src/models/User')
const Todo = require('./src/models/Todo')
const config = require('./config')

const category = ['오락', '공부', '음식', '자기계발', '업무', '패션', '여행']
const done = [true, false]
const users = [] //생성된 사용자를 저장

mongoose.connect(config.MONGODB_URL)//프로미스 
.then(()=> console.log('데이터베이스 연동'))
.catch(e=> console.log(`데이터 연결 실패!!! : ${e}`))

//랜덤 날짜 생성
const generateRandomDate = (from, to) => { //from - 시작날짜 to - 끝날짜
    return new Date(
        from.getTime() + Math.random() * (to.getTime() - from.getTime())
    )
}

// 배열에서 랜덤값 선택
const selectRandomValue = arr => {
    return arr[Math.floor(Math.random()*arr.length)]
}

//랜덤 문자열 생성
const generateRandomStr = n => {
    const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    const str = new Array(n).fill('a')
    return str.map(s => alphabet[Math.floor(Math.random()*alphabet.length)]).join('')
}

//사용자 데이터 생성 테스트
const createUsers = async (n, users) =>{
    console.log('creating users now...')
    for(let i = 0 ; i<n; i++){
        const user = new User({
            name: generateRandomStr(5),
            email: `${generateRandomStr(7)}@gmail.com`,
            userId: generateRandomStr(10),
            password: generateRandomStr(13),
        })
        users.push(await user.save())
    }
    return users
}
//todo 데이터 생성 테스트
const createTodos = async (n, user) =>{
    console.log(`creating todos by ${user.name} now`)
    const createDate = generateRandomDate(new Date(2024,0,1), new Date())
    for(let i = 0; i<n; i++){
        const todo = new Todo({
            author: user._id,
            title: generateRandomStr(10),
            description: generateRandomStr(19),
            imgUrl: `https://www.${generateRandomStr(10)}.com/${generateRandomStr(10)}.png`,
            category: selectRandomValue(category),
            isDone: selectRandomValue(done),
            createdAt: createDate,
            lastModifiedAt: generateRandomDate(createDate, new Date()),
            finishedAt: generateRandomDate(createDate, new Date())
        })
        await todo.save()
    }
}

//사용자와 해당 할일 순서대로 생성
const buildData = async (users) =>{
    users = await createUsers(7,users)
    users.forEach(user => createTodos(30,user))
}

buildData(users)