import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {v4 as uuid} from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dirCodes = path.join(__dirname, 'codes');

if(!fs.existsSync(dirCodes)){
    fs.mkdirSync(dirCodes, {recursive: true });
}

export const generateFile = async (language,code)=>{
    const jobID = uuid();
    const filename = `${jobID}.${language}`;
    const filePath = path.join(dirCodes,filename);

    await fs.writeFileSync(filePath,code);
    return filePath;
};