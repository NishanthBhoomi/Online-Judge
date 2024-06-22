import express  from 'express';
import DBConnection  from './database/db.js';
import router from './routes/routes.js';
import cookieParser from "cookie-parser";
import cors from 'cors';

const app= express();

//middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

DBConnection();

app.use('/',router);

app.get("/",(req,res)=>{
    res.send("Welcome");
});

app.listen(8000,()=>{
    console.log('Server is listening  on port 8000');
});