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

export const executeCpp = async (filePath, input) => {
  const jobID = path.basename(filePath).split(".")[0];
  const filename = `${jobID}.exe`;
  const outPath = path.join(outputPath, filename);

  return new Promise((resolve, reject) => {
    const process = exec(
      `g++ ${filePath} -o ${outPath} && cd ${outputPath} && .\\${filename}`,
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        }
        if (stderr) {
          reject(stderr);
        }

        resolve(stdout);
      }
    );
    if (input) {
      process.stdin.write(input);
      process.stdin.end();
    }
  });
};
