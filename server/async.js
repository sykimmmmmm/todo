const asyncFunction = (req,res,next)=>{
    return new Promise(resolve =>{
        // throw new Error('dd')
        setTimeout(()=>{
            resolve({message:'success'})
        },3000)
    }).then(result=>{
        req.a=result
        next()
    })
}

// const wrap = (asyncFn)=>{
//     return (async (req,res,next)=>{
//         try{
//             return await asyncFn(req,res,next)
//         }catch(error){
//             return next(error)
//         }
//     })
// }
const wrap = (asyncFn) => {
      return (async (req, res, next) => {
        try {
            return await asyncFn(req, res, next)
        } catch (error) {
          return next(error)
        }
      })  
    }
module.exports = {asyncFunction,wrap}