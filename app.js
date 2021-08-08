const express=require('express');
const path=require('path');
const mysql=require('mysql');
const dotenv=require('dotenv');
const cookieParser=require('cookie-Parser');
dotenv.config({path:'./.env'});
const app=express();

const db=mysql.createConnection({
    host:process.env.DATABASE_HOST,
    port:process.env.DATABASE_PORT,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE
});

const publicDirectory=path.join(__dirname,'./public');
app.use(express.static(publicDirectory));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());

app.set('view engine','hbs');

db.connect((error)=>{
    if(error)
   {  
      console.log(error);
   }
    else
    {
    console.log('MYSQL Connected...');
    }
});

//Define Routes
app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));


app.listen(3000,()=>{
    console.log("listening to port 3000");
});

