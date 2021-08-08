const express=require('express');
const authController=require('../controllers/auth');
const router=express.Router();

router.get('/login',(req,res)=>{
    res.render('login');
});

router.get('/index1',(req,res)=>{
   
    res.render('register');

});

router.get('/profile',authController.isloggedIn,(req,res)=>{
  if(req.user)
  {
    res.render('profile',{
        user:req.user,
    });
  }
  else{
      res.redirect('/login');
  }
    

});


module.exports=router;