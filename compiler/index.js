import express from "express";
import { compileCpp, runExecutable } from "./executeCpp.js";
import { compileJava,executeJava } from "./executeJava.js";
import { executePython } from "./executePython.js";
import { generateFile } from "./generateFile.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 5000;

app.post("/run", async (req, res) => {
  const { time, space, language = "cpp", code, input = "" } = req.body;

  if (code == undefined) {
    return res.status(400).json({
      message: "Code is empty",
      success: false,
    });
  }
 
  const convertTimeToFloat = (time) => {
    const timeValue = parseFloat(time);
    const timeUnit = time.slice(-1);
    if (timeUnit === "s") {
      return timeValue;
    } else if (timeUnit === "m") {
      return timeValue * 60;
    } else if (timeUnit === "h") {
      return timeValue * 3600;
    } else {
      throw new Error("Invalid time unit");
    }
  };

  const convertSpaceToFloat = (space) => {
    const spaceValue = parseFloat(space);
    const spaceUnit = space.slice(-2);
    if (spaceUnit === "KB") {
      return spaceValue / 1024;
    } else if (spaceUnit === "MB") {
      return spaceValue;
    } else if (spaceUnit === "GB") {
      return spaceValue * 1024;
    } else {
      throw new Error("Invalid space unit");
    }
  };

  const Time = convertTimeToFloat(time);
  const Space = convertSpaceToFloat(space);
  try {
    const filePath = await generateFile(language, code);
    let output;
    if (language == "cpp" || language == "c") {
      output = await compileCpp(filePath);
      output = await runExecutable(output, input, Time, Space);
    } else if (language == "java") {
      output= await compileJava(code);
      output = await executeJava(output, input,2*Time,Space);
    } else if (language == "py") {
      output = await executePython(filePath, input,3*Time,Space);
    } else {
      return res.status(401).json({
        message: "Unsupported Language ",
        success: false,
      });
    }

    res.status(200).json({ filePath, output });
  } catch (error) {
    let errorMessage;
    switch (error.type) {
      case "compilation":
        errorMessage = "Compilation Error: " + error.message;
        break;
      case "runtime":
        errorMessage = "Runtime Error: " + error.message;
        break;
      case "time":
        errorMessage = "Time Limit Exceeded";
        break;
      case "memory":
        errorMessage = "Memory Limit Exceeded";
        break;
      default:
        errorMessage = "Error: " + error.message;
    }
    res.status(500).json({
      message: errorMessage,
      type: error.type,
      success: false,
    });
  }
});

app.post("/submit", async (req, res) => {
  const { problem, language, code } = req.body;

  try {
    const testcases = problem.testcases;
    const results = [];
    let finalstatus = "Accepted";
    let executablePath = null;
    const filePath = await generateFile(language, code);

    if (language === "cpp" || language === "c") {
      try{
        executablePath = await compileCpp(filePath);
      } catch (error) {
        return res.status(500).json({
          message: "Compilation Error: " + error.message,
          type: "compilation",
          success: false,
        });
      }
    }
    if(language === "java"){
      try {
        executablePath = await compileJava(code);
      } catch (error) {
        return res.status(500).json({
          message: "Compilation Error: " + error.message,
          type: "compilation",
          success: false,
        });
      }
    }
    const time=problem.timeConstraints;
    const space=problem.spaceConstraints;
    const convertTimeToFloat = (time) => {
        const timeValue = parseFloat(time);
        const timeUnit = time.slice(-1);
        if (timeUnit === "s") {
          return timeValue;
        } else if (timeUnit === "m") {
          return timeValue * 60;
        } else if (timeUnit === "h") {
          return timeValue * 3600;
        } else {
          throw new Error("Invalid time unit");
        }
      };
    
      const convertSpaceToFloat = (space) => {
        const spaceValue = parseFloat(space);
        const spaceUnit = space.slice(-2);
        if (spaceUnit === "KB") {
          return spaceValue / 1024;
        } else if (spaceUnit === "MB") {
          return spaceValue;
        } else if (spaceUnit === "GB") {
          return spaceValue * 1024;
        } else {
          throw new Error("Invalid space unit");
        }
      };
    
      const Time = convertTimeToFloat(time);
      const Space = convertSpaceToFloat(space);

    let i = -1;
    for (let index = 0; index < testcases.length; index++) {
      const testcase = testcases[index];
      const input = testcase.input;
      try {
        let output;
        if (language === "cpp" || language === "c") {
          output = await runExecutable(executablePath, input,Time,Space);
        } else if (language === "java") {
          output = await executeJava(executablePath, input,2*Time,Space);
        } else if (language === "py") {
          output = await executePython(filePath, input,3*Time,Space);
        }
        output = output.trim();
        const answer = testcase.output.trim();
        const status = output === answer;

        if (status) {
          finalstatus = "Accepted";
        }else {
          finalstatus = "Wrong Answer";
        }

        results.push({
          input: testcase.input,
          output,
          answer,
          status,
        });

        if (!status) {
          i = index;
          break;
        }
      } catch (error) {
        console.log("Error while running code with testcases ", error);
        results.push({
          input: testcase.input,
          output: error.message || "Error",
          answer: testcase.output,
          status: false,
        });
        i = index;
        finalstatus = error.type === 'time' ? "Time Limit Exceeded" :
                      error.type === 'memory' ? "Memory Limit Exceeded" :
                      error.type === 'runtime' ? "Runtime Error" :
                      "Error Running Code";
        break;
      }
    }
    if (i != -1) {
      res.status(200).json({
          results,
          type:finalstatus,
          input: testcases[i].input,
          answer: testcases[i].output,
          output: results[i].output,
        });
      } else {
        res.status(200).json({ results, type:finalstatus });
      }
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      type:error.type|| "Internal Server Error",
      error_message:error.message, 
      success: false,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.listen(PORT, () => {
  console.log(`Compiler server running on port ${PORT}`);
});
