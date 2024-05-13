import './App.css';
import {useEffect, useState} from 'react';

function App(){
    const [msg,setMsg] = useState('')
    
    useEffect(()=>{
        fetch('http://localhost:5000/hello',{
            method:'POST',
            headers:{ // 요청헤더(request header)설정
                'Content-Type':'application/json'
            },
            body: JSON.stringify({//json 문자열로 전송
                userId:'test',
                email:'test@gmail.com'
            })
        })
        .then(res=>res.json())
        .then(data => setMsg(data))
    },[])

    return(
        <div>{msg.userId} / {msg.email}</div>
    )
}

export default App;
