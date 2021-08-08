
const mysql=require('mysql');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const {promisify}=require('util');


const db=mysql.createConnection({
    host:process.env.DATABASE_HOST,
    port:process.env.DATABASE_PORT,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE
});

exports.login= async(req,res)=>{
try {
    const {email, password}=req.body;
    if(!email || !password)
    {
        return res.status(400).render('login',{
            message:"Please provide an E-mail  and Password"
        });
    }
    
    db.query('SELECT * FROM users where email= ?', [email], async(error,results)=>{

        console.log(results);

        if(!results || !(await bcrypt.compare(password, results[0].password)))
       { 
           
        res.status(401).render('login',{
            message:"E-mail  or Password is incorrect"
        });

       }

       else
       {
           const id=results[0].id;

           const token=jwt.sign({id: id},process.env.JWT_SECRET,{
               expiresIn:process.env.JWT_EXPIRES_IN
           });
           console.log("The token is: "+token);

        const cookieOptions= {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            httpOnly: true
        }
        res.cookie('jwt',token, cookieOptions);
        res.status(200).redirect("/profile");
       }
    });

} catch (error) {
    console.log(error);
    
}

}


exports.register=(req,res)=>{
    
    console.log(req.body);

    const{fname, lname, email, phno, password, repassword} = req.body;

    db.query('SELECT email FROM users WHERE email= ?', [email], async(error,results)=>
    {
        if(error)
        {
        console.log(error);
        }
        if(results.length>0)
        {
            return res.render('register',{
                message:'E-mail is already in use'
            });
        }
        else if(password!==repassword)
        {
            return res.render('register',{
                message:'Password do not match'
            });
        }

        let hashedpassword = await bcrypt.hash(password,8);
         console.log(hashedpassword);

        db.query('INSERT INTO users SET ?',{fname: fname, lname: lname, email: email, phno: phno, password: hashedpassword },(error,results)=>{
            if(error)
            {
                console.log(error);

            }
           else{
               console.log(results);
             return res.render('register',{
                message:'User Registered successfully.'
            });
            }
        });
    });
};

exports.isloggedIn= async(req, res, next)=>{

    console.log(req.cookies);
    if(req.cookies.jwt)
    {
        try {
            //varify the user
            const decoded= await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
            console.log(decoded);
           
            //check if the user still exits
            
            db.query('select * from users where id=?',[decoded.id],(error,results)=>{
            console.log(results);
            
            if(!results){
                next();
            }

            req.user=results[0];
            return next();
            });
        } catch (error) {
            console.log(error);
            return next();
        }

    }
    else{
        next();
    }
}

exports.logout= async(req, res)=>{
    res.cookie('jwt','logout',{
expires: new Date(Date.now()+2*1000),
httpOnly: true
    });

    res.status(200).redirect('/login');
}