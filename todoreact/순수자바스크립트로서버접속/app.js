fetch('http://localhost:5000/hello')
.then(res=>res.json())
.then(data=>console.log(data))