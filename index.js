const express = require('express');
const session = require('express-session');
const app = express()
const bcrypt  = require('bcrypt')
require('dotenv').config();
app.set('view engine', 'ejs');

const {PrismaClient} = require('@prisma/client')
const userClient = new PrismaClient().user
app.use(express.json())
app.use(express.urlencoded({extended:false}))


app.get('/', (req, res)=>{
    // res.render('home')
    res.render('home')
})

app.get('/register', (req, res)=>{
    res.render('register')
})


// create user 
app.post('/register', async(req, res)=>{
    const {username, email, password} = req.body

    try {
        const hashedPassword = await bcrypt.hash(password, 10) 
        const user = await userClient.createMany({
            data: {username, email, password:hashedPassword}
        })
        res.status(200).redirect('login')

    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Failed to create user"})    }
})

// log user in 

app.get('/login', (req, res)=>{
    res.send("Hello login")
})


const port = process.env.PORT || 5000
app.listen(port, ()=>{
    console.log(`Connect to port ${port}`)
})



