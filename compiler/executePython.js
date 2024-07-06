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

export const executePython = (filePath, input, timeLimit, memoryLimit) => {
  return new Promise((resolve, reject) => {
    const startTime = process.hrtime();

    const execProcess = exec(
      `python ${filePath}`,
      { timeout: timeLimit * 1000, maxBuffer: 1024 * 1024 }, // Increased maxBuffer for larger outputs
      (error, stdout, stderr) => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const elapsedTime = seconds + nanoseconds / 1e9;

        if (error) {
          if (error.code==='ENOMEM' || stderr.includes('MemoryError')) {
            reject({ type: 'memory', message: 'Memory Limit Exceeded' });
          }else if (error.signal === 'SIGTERM') {
            reject({ type: 'time', message: 'Time Limit Exceeded' });
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