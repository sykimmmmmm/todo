/* 유니버셜 관리자&사용자 로그인 후 차트 구분 */
const BASE_URL = 'http://localhost:5000'
const email = 'ywpdhxu@gmail.com' // 로그인용 이메일 // ywpdhxu@gmail.com sykim@gmail.com
const password = 'qwer12!@' // 로그인용 패스워드 // qwer12!@ 1q2w3e4r
const graphType = 'bar'//그래프종류
const field = 'lastModifiedAt' // 그룹핑 기준

async function login(email,password){
    const userJson = await fetch(`${BASE_URL}/api/users/login`,{
        headers:{
            'Content-Type':'application/json'
        },
        method: 'POST',
        body: JSON.stringify({email,password})
    })
    const user = await userJson.json()
    return user
}

async function getGroups(field,user){
    let base_url = `${BASE_URL}/api/todos/group`
    if(!user.isAdmin){ //조건 쿼리(conditional query)
        base_url += '/mine'
    }
    if(field === 'createdAt' || field === 'lastModifiedAt' || field === 'finishedAt'){ //조건 쿼리
        base_url += '/date'
    }
    const groupJson = await fetch(`${base_url}/${field}`,{
        headers: {
            'Content-Type':'application/json',
            'Authorization':`Bearer ${user.token}`
        }
    })
    const group = await groupJson.json()
    return group.docs
}

async function fetchData(email, password, field){
    const user = await login(email,password)//로그인
    localStorage.setItem('user',JSON.stringify(user))
    const group = await getGroups(field,user) 
    return group
}

function displayChart(type,group){
    const ctx = document.getElementById('myChart')

    new Chart(ctx, {
        type,
        data: {
            labels: group.filter(item=>item._id !== null && item._id !== undefined && item._id !== '')
            .map(item => item._id.year ? `${item._id.year}년 ${item._id.month}월` : 
                 typeof item._id === 'boolean' ? (item._id === true ? "종료" : "진행중") : 
                 item._id),
            datasets: [{
            label: '# of Todos',
            data: group.filter(item=>item._id !== null && item._id !== undefined && item._id !== '')
            .map(item =>item.count), //날짜
            borderWidth: 1,
            // backgroundColor: ['orange','purple','skyblue','green','red']
            backgroundColor: '#ffD700',
            borderColor:'#111'
        }]
        },
        options: {
            indexAxis : 'y',//가로방향 그래프
        scales: {
            y: {
            beginAtZero: true
            }
        },
        plugins:{
            colors:{
                enabled:true
            }
        }
        }
    })
}


fetchData(email,password,field)
.then(group => {
    console.log(group)
    displayChart(graphType,group)
    console.log(`${localStorage.getItem('user')}`)
})













/** db연동으로 로그인해서 차트구분하기 */
/* const BASE_URL = 'http://localhost:5000'
async function login(email,password){
    const userJson = await fetch(`${BASE_URL}/api/users/login`,{
        method :'POST',
        headers :{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            email, password
        })
    })
    const user = await userJson.json()
    return user
}

async function getGroups(field, token){
    const groupJson = await fetch(`${BASE_URL}/api/todos/group/${field}`,{
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
    })
    const group = await groupJson.json()
    return group.docs
}

async function fetchData(){
    const user = await login("sykim@gmail.com",'1q2w3e4r')//로그인
    const group = await getGroups('category', user.token)
    return group
}

fetchData()
.then(group=>{
    console.log(group)
    const ctx = document.getElementById('myChart')
        
    new Chart(ctx, {
        type: 'line',
        data: {
          labels: group.map(item=>item._id), //category
        //   labels: group.map(item=>item._id ? '종료':'진행중'), //isDone
        // labels: group.map(item=> `${item._id.year}년 ${item._id.month}월`), // 날짜
        datasets: [{
            label: '# of createdAt',
            data: group.map(item => item.count), //날짜
            borderWidth: 1,
            // backgroundColor: ['orange','purple','skyblue','green','red']
            backgroundColor: '#ffD700',
            borderColor:'#111'
        }]
        },
        options: {
        scales: {
            y: {
            beginAtZero: true
            }
        },
        plugins:{
            colors:{
                enabled:true
            }
        }
        }
    })

}) */








//db연동없이 해보기
/* const AdminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjM5N2FhODNhNTlmNmY2NDM3MmRlNDUiLCJuYW1lIjoic3lraW0iLCJpc0FkbWluIjp0cnVlLCJjcmVhdGVkQXQiOiIyMDI0LTA1LTA3VDAwOjQ5OjQ0LjgxN1oiLCJpYXQiOjE3MTUwNDMwMDYsImV4cCI6MTcxNTEyOTQwNiwiaXNzIjoic3lraW1tbW1tbSJ9.Fc2CDOvSDAdjAyHv_40_pCW7CaIePIXfikjstuV5f6g'
const userToken ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjM0NzlkMWI1MTQwZGE1MzY4Njc2MGQiLCJuYW1lIjoiaXBlcnMiLCJpc0FkbWluIjpmYWxzZSwiY3JlYXRlZEF0IjoiMjAyNC0wNS0wM1QwNTo0NDo0OS44NjFaIiwiaWF0IjoxNzE1MDQzNDQ5LCJleHAiOjE3MTUxMjk4NDksImlzcyI6InN5a2ltbW1tbW0ifQ.AxIU5aTvrYFXUmsdP-N0pP4oBhJDDJj7AGICYqkhZzo' 

fetch('http://localhost:5000/api/todos/group/category',{
    headers:{
        'Content-Type': 'application/json',
        "Authorization" : `Bearer ${AdminToken}`
    }
})//get 방식의 요청
.then(res=> res.json())
.then(data => {
    if(data.code === 400 || data.code === 401){
        console.log(data.message)
    }else{
        const group = data.docs
        console.log(data)
        const ctx = document.getElementById('myChart')
        
        new Chart(ctx, {
            type: 'line',
            data: {
              labels: group.map(item=>item._id), //category
            //   labels: group.map(item=>item._id ? '종료':'진행중'), //isDone
            // labels: group.map(item=> `${item._id.year}년 ${item._id.month}월`), // 날짜
            datasets: [{
                label: '# of createdAt',
                data: group.map(item => item.count), //날짜
                borderWidth: 1,
                // backgroundColor: ['orange','purple','skyblue','green','red']
                backgroundColor: '#ffD700',
                borderColor:'#111'
            }]
            },
            options: {
            scales: {
                y: {
                beginAtZero: true
                }
            },
            plugins:{
                colors:{
                    enabled:true
                }
            }
            }
        })
    }
}) */ 
