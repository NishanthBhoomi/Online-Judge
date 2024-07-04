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

export const compileCpp = async (filePath) => {
  const jobID = path.basename(filePath).split(".")[0];
  const filename = `${jobID}.out`;
  const outPath = path.join(outputPath, filename);

  return new Promise((resolve, reject) => {
    exec(
      `g++ ${filePath} -o ${outPath} `,
      (error, stdout, stderr) => {
        if (error) {
          return reject({ type: 'compilation', message: stderr || error.message });
        }
        if (stderr) {
          return reject({ type: 'compilation', message: stderr });
        }
        resolve(outPath);
      }
    );
  });
};


export const runExecutable = (executablePath, input, timeLimit, memoryLimitMB) => {
  return new Promise((resolve, reject) => {
    const startTime = process.hrtime();
    const memoryLimitKB = memoryLimitMB * 1024; 

    const command = `ulimit -v ${memoryLimitKB} && ${executablePath}`;

    const execProcess = exec(command, { timeout: timeLimit * 1000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const elapsedTime = seconds + nanoseconds / 1e9; 

      if (error) {
        if (error.signal === 'SIGTERM') {
          reject({ type: 'time', message: 'Time Limit Exceeded' });
        } else if (stderr.includes('Memory limit exceeded')) {
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
    });

    if (input) {
      execProcess.stdin.write(input);
      execProcess.stdin.end();
    }
  });
};