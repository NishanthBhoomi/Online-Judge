import express  from 'express';
import DBConnection  from './database/db.js';
import router from './routes/routes.js';
import cookieParser from "cookie-parser";
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const app= express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//middlewares
app.use(cors({
    origin: 'https://www.codingjudge.online',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine","ejs");

DBConnection();

app.use('/',router);

app.get("/",(req,res)=>{
    res.render('index', { email: 'example@example.com', status: 'not verified' });
});

app.listen(8000,()=>{
    console.log('Server is listening  on port 8000');
});