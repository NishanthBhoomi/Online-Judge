import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const extractClassWithMain = (code) => {
  const mainMethodMatch = code.match(/public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*\w+\s*\)/);
  
  if (!mainMethodMatch) {
    return null;
  }

  const mainMethodPosition = mainMethodMatch.index;

  const codeBeforeMain = code.substring(0, mainMethodPosition);

  const classMatch = codeBeforeMain.match(/public\s+class\s+(\w+)/g);

  if (!classMatch) {
    return null;
  }

  const lastClassMatch = classMatch[classMatch.length - 1];
  const classNameMatch = lastClassMatch.match(/public\s+class\s+(\w+)/);

  return classNameMatch ? classNameMatch[1] : null;
};

export const compileJava = async (code) => {
  return new Promise((resolve, reject) => {
    const className = extractClassWithMain(code);
    if (!className) {
      throw new Error("No public class with main method found");
    }

    const javaFilePath = path.join(outputPath, `${className}.java`);
    fs.writeFileSync(javaFilePath, code);

    exec(`javac -d ${outputPath} ${javaFilePath}`, (error, stdout, stderr) => {
      fs.unlinkSync(javaFilePath); 

      if (error) {
        return reject({ type: 'compilation', message: stderr || error.message });
      }
      if (stderr) {
        return reject({ type: 'compilation', message: stderr });
      }
      resolve(className);
    });
  });
};

export const executeJava = (className, input, timeLimit, memoryLimit) => {
  return new Promise((resolve, reject) => {
    const startTime = process.hrtime();

    const memoryOptions = `-Xmx${memoryLimit}m -Xms${memoryLimit}m`;

    const execProcess = exec(
      `java ${memoryOptions} -cp ${outputPath} ${className}`,
      { timeout: timeLimit * 1000, maxBuffer: 1024 * 1024 * 10 }, 
      (error, stdout, stderr) => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const elapsedTime = seconds + nanoseconds / 1e9;

        if (error) {
          if (error.signal === 'SIGTERM') {
            reject({ type: 'time', message: 'Time Limit Exceeded' });
          } else if (error.message.includes('OutOfMemoryError')) {
            reject({ type: 'memory', message: 'Memory Limit Exceeded' });
          } else {
            reject({ type: 'runtime', message: stderr || error.message });
          }
        } else if (elapsedTime > timeLimit) {
          reject({ type: 'time', message: 'Time Limit Exceeded' });
        } else if (stderr) {
          reject({ type: 'runtime', message: stderr });
        } else {
          resolve(stdout);
        }
      }
    );

    if (input) {
      execProcess.stdin.write(input);
      execProcess.stdin.end();
    }
  });
};