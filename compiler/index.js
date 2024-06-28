import express from 'express';
import { executeCpp } from './executeCpp.js';
import { executeJava } from './executeJava.js';
import { executePython } from './executePython.js';
import { generateFile } from './generateFile.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const PORT = 5000;

app.post('/run', async (req, res) => {
    const { language="cpp",code, input="" } = req.body;
  
    if(code == undefined){
      return res.status(400).json({
        message:"Code is empty",
        success:false
      });
    }
  
    try {
      const filePath= await generateFile(language,code);
      let output;
      if(language=="cpp" || language=="c"){
        output = await executeCpp(filePath,input);
      }else if(language=="java"){
        output = await executeJava(filePath,input);
      }else if(language=="py"){
        output = await executePython(filePath,input);
      }else{
        return res.status(401).json({
          message:"Unsupported Language ",
          success:false
        });
      }
      res.status(200).json({filePath,output});
    } catch (error) {
      res.status(500).json({
        message: "Error "+error.message,
        success: false
      });
    }
});

app.get("/",(req,res)=>{
    res.send("Welcome");
});

app.listen(PORT, () => {
    console.log(`Compiler server running on port ${PORT}`);
});
