//search about req.cookies and res.cookie

const express = require ("express");
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/user')
const Post = require('./models/Post')
const bcrypt = require ('bcryptjs')
const jwt = require('jsonwebtoken')
const app = express()
const cookieParser = require("cookie-parser")
const multer = require('multer')
const uploadMiddleware = multer({dest:'uploads/'})
const fs = require ('fs')

const salt = bcrypt.genSaltSync(11)
const secret = 'awesojme rand string'
app.use(cors({credentials:true,origin:"http://localhost:3000"}));
//this is middleware revise it
app.use(express.json());
//connection string
//mongodb+srv://raghavonpc:JhOTspU5rYhnZGft@cluster0.jcxqrgc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

//we will use cookie parser 
app.use(cookieParser())

//images to show in djhjgfdsjhl
app.use("/uploads" , express.static(__dirname+ '/uploads'))


//why was no async function connected??
mongoose.connect('mongodb+srv://raghavonpc:JhOTspU5rYhnZGft@cluster0.jcxqrgc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(()=>console.log("connected to server"))
app.post("/register",async (req,res)=>{
    const {username,password} = req.body
    try{
    const userDoc = await User.create({username,
        password:bcrypt.hashSync(password,salt)
    })
    res.json(userDoc)
    }catch(error){
        res.status(400).json(error)
    }
    //why cant a server send 2 requests it is bcoz of http protocol
    // res.json({requestData:{username,password}})
   
}) 

app.post("/login",async (req,res)=>{
    const {username,password} = req.body;
    //from our database find user whose username is there or not for login
    const userDoc = await User.findOne({username})
    const passok = bcrypt.compareSync(password,userDoc.password)
    // res.json(passok)
    if (passok){
        //logged in 
        //install json web token(JWT)
        //do gpt this thing 
        jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{
            if(err) throw err
            
            // res.json(token)
            //to send it as cookie 
            res.cookie('token',token).json({
                id:userDoc._id,
                username
            })
            //copy paste the setcookie from there
            //we get cors error to avoid that setcredaentials in cors to true 
        })
        

    }else{
        res.status(400).json("wrong credentials")
    }
})
//to make protected routes we need to make sure he is logged in so we use cookie to make routes protected install cookie parser for that
app.get("/profile",(req,res)=>{
    const {token} = req.cookies;
    jwt.verify(token, secret , {}, (err,info)=>{
        if(err){
            throw err
        }
        else res.json(info)
    })
    
})
//now when we did this in network tab it returned username , is , iat(=>id created at)

//now creating the logout functionality

app.post("/logout",(req,res)=>{
    //yaha pe hamlog tokren ko empty string mai badal rahe hai whren logout is called 
    res.cookie('token' , '').json('ok')

})

//now creating a new post
//install multer
app.post('/post' , uploadMiddleware.single('file'),async(req,res) => {
    //to rename the fiole extension to 
    const { originalname,path } = req.file
    const parts = originalname.split('.')
    const ext = parts[parts.length - 1]
    //we will use fs here 
    const newpath= path+'.'+ext
    fs.renameSync(path,newpath)

    const {token} = req.cookies;
    jwt.verify(token, secret , {}, async (err,info)=>{
        if(err){
            throw err
        }

    const {title,summary,content} = req.body

    const postDoc = await Post.create({
        title,
        summary,
        content,
        cover:newpath,
        author:info.id
    })
    res.json(postDoc)
})
})

//to show our new created article
app.get('/post', async (req,res)=>{
        res.json(await Post.find()
        .populate('author',['username'])
        .sort({createdAt: -1})
        .limit(50)
    )
})

//backend to individual post
app.get('/post/:id',async(req,res) =>{
    const {id} = (req.params)
    const postDoc = await Post.findById(id).populate('author')
    res.json(postDoc)
})

app.listen(4000)