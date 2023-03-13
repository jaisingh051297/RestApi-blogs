const router = require('express').Router();
const User =require("../models/User");
const bcrypt=require('bcrypt');
const multer=require('multer');
const sharp=require('sharp');

const storage = multer({
    limits:{
      fileSize:2000000
    },
    fileFilter(req,file,cb){
      if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
        return cb( new Error("Please upload correct image"));
      }
      cb(undefined,true);
    }
  });

//REGISTER
router.post('/register',storage.single('profilePic') ,async(req,res)=>{    
    try{
        const salt=await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password,salt);
        const newUser = new User({
            username:req.body.username,
            email:req.body.email,
            password:hashedPass,
        })
        if(req.file.buffer){
            const bufferImg = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
            newUser.profilePic=bufferImg
        }
        const user= await newUser.save();
        res.status(200).json(user);
    }catch(err){
        res.status(500).json(err);
    }
})

// LOGIN
router.post('/login', async(req,res)=>{
    try{
        const user = await User.findOne({username : req.body.username});
        if(!user){
            res.status(400).json("Wrong credentials !");
            return;
        }
        const validated = await bcrypt.compare(req.body.password, user.password);
        if(!validated){
           res.status(400).json("Wrong credentials !");
           return ;
        } 
        const {password, ...others} =user._doc  // excluding the password credential.
        res.status(200).json(others);
    }catch(err){
        res.status(500).json(err);
    }
})

module.exports=router