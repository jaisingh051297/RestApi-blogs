const express=require('express');
const { default: mongoose } = require('mongoose');
const authRoute=require('./routes/auth');
const userRoute=require('./routes/users');
const postRoute=require('./routes/posts');
const categoryRoute=require('./routes/categories');
const dotenv=require('dotenv');
dotenv.config();

const PORT=process.env.PORT || 5000

const app=express()
app.use(express.json());

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
.then(function(){
    console.log("Connected to MongoDB")
})
.catch((err) => console.log(err));


app.use('/api/auth',authRoute);
app.use('/api/users',userRoute);
app.use('/api/posts',postRoute);
app.use('/api/categories',categoryRoute);

app.listen(PORT,()=>{
    console.log("server is listing At Port ! "+`${PORT}`);
})
