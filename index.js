const express = require('express');
const session = require('express-session');
const app = express()
const bcrypt  = require('bcrypt')
require('dotenv').config();
app.set('view engine', 'ejs');

const {PrismaClient} = require('@prisma/client');
const { byPassLogin, IsloggedIn } = require('./middlewares');
const userClient = new PrismaClient().user
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(session({
    secret: process.env.SECRET_KEY, 
    resave: false,
    saveUninitialized: false, // Prevents creating session for unauthenticated users
    cookie: { secure: false },  // Set 'true' if you're using HTTPS in production
    name: "login.test", cookie:{
        maxAge: 10000*60*60
    }
}));
app.use((req,res,next)=>{
    res.locals.user = req.session.user
    next()
    });


app.get('/', IsloggedIn, (req, res)=>{
    // res.render('home')
    res.render('home')
})

app.get('/register', byPassLogin ,(req, res)=>{
    res.render('register')
})


// create user 
app.post('/register', async(req, res)=>{
    const {username, email, password} = req.body

    try {
        // const allUser = await userClient.findUnique({username});

        // if (allUser.username ===username) return res.status(422).json({error:"Username is taken already"})
        const hashedPassword = await bcrypt.hash(password, 10) 
        const user = await userClient.create({
            data: {username, email, password:hashedPassword}
        })
        res.status(200).redirect('login')

    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Failed to create user"})    }
})

// log user in 

app.get('/login', byPassLogin, (req, res)=>{
    res.render('login')
})
app.post('/login', async(req, res)=>{
    const{username, password} = req.body
    try {
        const user = await userClient.findUnique({where:{username} });
        
        if(!user)  return res.status(404).send('User not found');
        const ismatched= await bcrypt.compare(password, user.password);
        if(!ismatched) return res.status(401).send('Invalid credentials');
        req.session.user = {
            id: user.id,
            username: user.username,
            name: user.name
        };
        res.status(200).redirect('/')
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.get('/logout', (req,res)=>{
    req.session.destroy();
    res.clearCookie('login.test')
    res.redirect('/')
})


const port = process.env.PORT || 5000
app.listen(port, ()=>{
    console.log(`Connect to port ${port}`)
})



