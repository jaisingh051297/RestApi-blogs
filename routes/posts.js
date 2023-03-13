const router = require('express').Router();
const Post = require('../models/Post');
const User = require("../models/User");
const multer = require('multer');
const sharp = require('sharp');

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


// CREATE NEW POST
router.post('/',storage.single('photo'), async (req, res) => {

    try{
        const user = await User.findOne({username : req.body.username});
        if(user){
            const newPost = new Post(req.body);
            if(req.file.buffer){
                const bufferImg = await sharp(req.file.buffer).resize({width:550,height:450}).png().toBuffer()
                newPost.photo=bufferImg
            }
            try {
                const savedPost = await newPost.save();
                res.status(200).json(savedPost);
            } catch (err) {
                res.status(500).json(err);
            }
        }else{
            res.status(401).json("Only register user can create Post.")
        } 
    }catch(err){
        res.status(500).json(err);
    }   
})

// UPDATE POST
router.put('/:id',storage.single('photo'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.username === req.body.username) {
            try {
                const updatedPost = await Post.findByIdAndUpdate(
                    req.params.id,
                    { $set: req.body },
                    { new: true }
                )
                if(req.file.buffer){
                    const bufferImg = await sharp(req.file.buffer).resize({width:550,height:450}).png().toBuffer()
                    updatedPost.photo=bufferImg
                }
                res.status(200).json(updatedPost)
            } catch (err) {
                res.status(500).json(err)
            }
        } else {
            res.status(401).json("you can update only your post");
        }

    } catch (err) {
        res.status(500).json(err);
    }
})

// DELETE POST
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(post.username === req.body.username) {
            try {
                await Post.findByIdAndDelete(req.params.id)
                res.status(200).json("Post has been deleted..");
            } catch (err) {
                res.status(500).json(err);
            }
        } else {
            res.status(401).json("You can delete only your post!");
        }
    }catch (err){
        res.status(500).json(err);
    }
})

//GET POST
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
});

//GET ALL POST
router.get("/", async (req, res) => {
    const username=req.query.user;
    const catName=req.query.cat;
    try {
        let posts;
        if(username){
            posts=await Post.find({username})

        } else if(catName){
            posts=await Post.find({categories:{
                $in: [catName],
            },
            })
        }else{
            posts=await Post.find();
        }
        res.status(200).json(posts);
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
});

module.exports = router