const express = require('express')
const Todo = require('../models/Todo')
const expressAsyncHandler = require('express-async-handler')
const { isAuth, isAdmin } = require('../../auth')
const mongoose = require('mongoose')
const {Types:{ ObjectId }} = mongoose
const { validationResult } = require('express-validator')
const { validateTodoTitle, validateTodoDescription, validateTodoCategory } = require('../../validator')
const { limitUsage } = require('../../limiter')

const router = express.Router()
const validateTodoInfo = [validateTodoTitle(), validateTodoDescription(), validateTodoCategory()]

router.get('/', limitUsage, isAuth, expressAsyncHandler( async (req, res, next)=>{
    const todos = await Todo.find({author:req.user._id}).populate('author',['name','userId',"-_id"])
    if(todos.length === 0){
        res.status(404).json({code:404, message:'Failed to find todos'})
    }else{
        res.json({code:200, todos:todos.map(todo =>{
            return {
                ...todo._doc,
                createdAgo: todo.createdAgo, //가상필드조회
                lastModifiedAgo: todo.lastModifiedAgo,
                finishedAgo : todo.finishedAgo,
                status: todo.status
            }
        })})
    }
}))
router.get('/:id', limitUsage, isAuth, expressAsyncHandler( async (req, res, next)=>{
    const todo = await Todo.findOne({
        author: req.user._id,
        _id: req.params.id
    }).populate('author',['name','userId','-_id'])
    if(!todo){
        res.status(404).json({code:404, message:'Todo Not Found'})
    }else{
        res.json({code:200, todo: {
            ...todo._doc,
            createdAgo: todo.createdAgo,
            lastModifiedAgo: todo.lastModifiedAgo,
            finishedAgo: todo.finishedAgo,
            status: todo.status
        }})
    }
}))
router.post('/', limitUsage, validateTodoInfo, isAuth, expressAsyncHandler(async (req, res, next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors.array())
        res.status(400).json({
            code:400,
            message:"Invalid Form data for todo",
            error: errors.array()
        })
    }else{
        //중복체크 - 로그인한 사용자 기준으로 할일목록에서 할일제목이 중복이 되면 저장x
        const searchedTodo = await Todo.findOne({
            author: req.user._id, //isAuth에서 전달된 값
            title: req.body.title
        })
        if(searchedTodo){
            res.json({code:204, message: 'Todo you want to create already exists in DB!'})
        }else{
            const todo = new Todo({
                author: req.user._id,
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
                imgUrl: req.body.imgUrl
            })
            const newTodo = await todo.save() // 새로운 할일 DB 생성
            if(!newTodo){
                res.status(401).json({code:401, message:'Failed to save todo!'})
            }else{
                res.status(201).json({
                    code:201, 
                    message:'New Todo Created',
                    newTodo //새로운 할일을 팝업창을 띄워서 사용자에게 안내하는 용도
                })//201: created(생성)
            }
        }
    }
}))
router.put('/:id', limitUsage, validateTodoInfo, isAuth,expressAsyncHandler( async(req, res, next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors.array())
        res.status(400).json({
            code:400,
            message:'Invalid Form data for todo',
            error: errors.array()
        })
    }else{
        const todo = await Todo.findOne({
            author: req.user._id,
            _id: req.params.id
        })
        if(!todo){
            res.status(404).json({code:404, message:'Todo Not Found!'})
        }else{
            todo.title = req.body.title || todo.title
            todo.description = req.body.description || todo.description
            todo.isDone = req.body.isDone || todo.isDone
            todo.category = req.body.category || todo.category
            todo.imgUrl = req.body.imgUrl || todo.imgUrl
            todo.lastModifiedAt = new Date() //수정시각 업데이트
            todo.finishedAt = todo.isDone ? todo.lastModifiedAt : todo.finishedAt
            
            const updatedTodo = await todo.save() //실제 todo 업데이트
            res.json({code:200 , message:'Todo Updated!' , updatedTodo})
        }
    }
}))
router.delete('/:id', limitUsage, isAuth, expressAsyncHandler( async (req, res, next)=>{
    const todo = await Todo.findOne({
        author: req.user._id,
        _id: req.params.id
    })
    if(!todo){
        res.status(404).json({code:404, message:'Todo Not Found'})
    }else{
        await Todo.deleteOne({
            author: req.user._id,
            _id: req.params.id
        })
        res.status(204).json({code:204,messeage:'Todo deleted successfully'})
    }
}))


/* 관리자용 */
router.get('/group/:field', limitUsage,  isAuth, isAdmin, isfilterValid , expressAsyncHandler( async (req, res, next) =>{
        const docs = await Todo.aggregate([
            {
                $group:{
                    _id:`$${req.params.field}`,
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 } // 아이디 기준 정렬
            }
        ])
        console.log(`Number Of group : ${docs.length}`)//그룹 갯수
        // docs.sort((d1,d2)=>d1._id - d2._id) 
        res.json({ code:200, docs })
}))

router.get('/group/mine/:field', limitUsage,  isAuth, isfilterValid, expressAsyncHandler( async ( req, res, next)=>{//사용자 대시보드
        const docs = await Todo.aggregate([
            {
                $match: { author: new ObjectId(req.user._id) }//내가 작성한 할일
            },
            {
                $group: {
                    _id : `$${req.params.field}`,
                    count: { $sum : 1 }
                }
            },
            {
                $sort: { _id: 1 } // 아이디 기준 정렬
            }
        ])
        console.log(`Number Of group : ${docs.length}`)//그룹 갯수
        res.json({ code:200, docs })
}))

router.get('/group/date/:field', limitUsage, isAuth, isAdmin, isDateValid, expressAsyncHandler( async (req, res, next ) =>{
    const docs = await Todo.aggregate([
        {
            $group:{
                _id: { year: { $year : `$${req.params.field}`}, month: { $month : `$${req.params.field}`} },
                count: { $sum : 1 }
            }
        },
        {
            $sort: { _id: 1 } // 아이디 기준 정렬
        }
    ])
    console.log(`Number Of group : ${docs.length}`)//그룹 갯수
    docs.sort((d1,d2)=>d1._id - d2._id) // 아이디 기준 정렬
    res.json({ code:200, docs })
}))

router.get('/group/mine/date/:field', limitUsage, isAuth, isDateValid, expressAsyncHandler( async (req, res, next) =>{
    const docs = await Todo.aggregate([
        {
            $match: { author: new ObjectId(req.user._id) }//내가 작성한 할일
        },
        {
            $group:{
                _id: { year: { $year : `$${req.params.field}`}, month: { $month : `$${req.params.field}`} },
                count: { $sum : 1 }
            }
        },
        {
            $sort: { _id: 1 } // 아이디 기준 정렬
        }
    ])
    console.log(`Number Of group : ${docs.length}`)//그룹 갯수
    docs.sort((d1,d2)=>d1._id - d2._id) // 아이디 기준 정렬
    res.json({ code:200, docs })
}))

module.exports = router

function isDateValid(req, res, next ){
    const fields = ['createdAt', 'lastModifiedAt', 'finishedAt']
    // if(req.params.field === 'createdAt' || req.params.field === 'lastModifiedAt' || req.params.field === 'finishedAt'){
    if(fields.includes(req.params.field)){
        next()
    }else{
        res.status(400).json({code:400, message:'you gave wrong field to group documents!'})
    }
}
function isfilterValid(req,res,next){
    const fields = ['category', 'isDone']
    // if(req.params.field === 'category' || req.params.field === 'isDone' ){
    if(fields.includes(req.params.field) ){
        next()
    }else{
        res.status(400).json({code:400, message:'you gave wrong field to group documents !'})
    }
}