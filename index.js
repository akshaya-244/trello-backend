const express=require("express")
const axios=require('axios')
const serverless = require('serverless-http');
var cors=require('cors')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { UsersData, TaskData } = require("./db/mongodb")

const app=express()
const port=8000

app.use(express.json())
app.use(cors())

app.get('/',(req, res) => {
    res.send("hello")
})

const JWT_SECRET="Akshaya1*";

//create update delete
app.post('/signup',async (req, res) => {
    const {name, email, password}=req.body;
    const hashedPassword=await bcrypt.hash(password,10);
    try{
        const checkIfAlreadyPresent=await UsersData.findOne({email})
        console.log(checkIfAlreadyPresent)
        if(!checkIfAlreadyPresent){
            const response= await UsersData.create({
                name,
                email, 
                hashedPassword
            })
            res.json({
                response
              })
        }
        else{
            res.json({
                msg:"Email already in use!"
            })
        }
        
       
    }
    catch(error)
    {
        console.log(error)
        res.status(500).json({error: "Unexpected error just occured"})
    }

})

app.post('/login',async (req, res) => {
    const { email, password}=req.body;
    try{
        const response= await UsersData.findOne({
            email
        })
        
        console.log(response)
        const checkPassword = bcrypt.compare(password, response.hashedPassword);
        if(!response || !checkPassword){
            return res.status(401).send('Invalid credentials');
        }

        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({
            token
          })
    }
    catch(error)
    {
        console.log(error)
        res.status(500).json({error: "Unexpected error just occured"})
    }

})




const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // No token, unauthorized

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token is invalid or expired
        req.user = user; // Attach user info to request object
        next();
    });
};

//Create a task
app.post('/createTask', authenticateToken, async (req, res) => {
    const { id, title, desc, status, priority, deadline, custom } = req.body;

    try {
        console.log(title)
        const newTask = await TaskData.create({
            id,
            title,
            desc,
            status,
            priority,
            deadline,
            custom
        });

        res.status(201).json(newTask); // Send the created document as the response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

//update a task
app.post('/updateTask',authenticateToken,async(req,res) => {
    const {id, title, desc, status, priority, deadline, custom} = req.body;
    const response=await TaskData.updateOne({
        id},

        { $set: {  title, desc, status, priority, deadline, custom}}
    )
    res.json({
        response
    })
})
app.get('/allTasks', async(req , res) => {
    const response=await TaskData.find({})
    return res.json({response})
})

app.delete('/deleteTask' , authenticateToken,async(req,res)=>{
    const {id}=req.body
    const response=await TaskData.deleteOne({
        id
    })
    res.json({
        msg:"Deleted successfully"
    })
})

app.listen(port, () => {
    console.log("Listening")
})

// module.exports.handler = serverless(app);