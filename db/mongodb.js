const mongoose= require('mongoose')

//connect to mongodb
mongoose.connect('mongodb+srv://master-admin:Krishna1@cluster0.kkkqqbr.mongodb.net/')

const UserSchema=new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const TaskSchema=new mongoose.Schema({
    id: String,
    title: String,
    desc: String,
    priority: String,
    status: String,
    deadline: String,
    custom: String
})

const UsersData=mongoose.model('UsersData', UserSchema)
const TaskData=mongoose.model('TaskData', TaskSchema)

module.exports={
    UsersData,
    TaskData
}