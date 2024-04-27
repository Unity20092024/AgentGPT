import inquirer from "inquirer";
import dotenv from "dotenv";
import { printTitle } from "./helpers.js";
import {
  doesEnvFileExist,
  generateEnv,
  testEnvFile,
} from "./envGenerator.js";
import { newEnvQuestions } from "./questions/newEnvQuestions.js";
import { existingEnvQuestions } from "./questions/existingEnvQuestions.js";
import { spawn } from "child_process";
import chalk from "chalk";

const handleExistingEnv = async () => {
  console.log(chalk.yellow("Existing ./next/env file found. Validating..."));

  try {
    await testEnvFile();
  } catch (e) {
    console.error(e.message);
    return;
  }

  const answers = await inquirer.prompt(existingEnvQuestions);
  handleRunOption(answers.runOption);
};

const handleNewEnv = async () => {
  if (process.env.NODE_ENV !== "development") {
    console.error("Env file can only be created in development mode.");
    process.exit(1);
  }

  const answers = await inquirer.prompt(newEnvQuestions);

  try {
    dotenv.config({ path: "./.env" });
    generateEnv(answers);
    console.log("\nEnv files successfully created!");
  } catch (e) {
    console.error("Error creating env files:", e.message);
    process.exit(1);
  }

  handleRunOption(answers.runOption);
};

const handleRunOption = (runOption) => {
  if (runOption === "docker-compose") {
    const dockerComposeUp = spawn("docker-compose", ["up", "--build"], {
      stdio: "inherit",
    });

    dockerComposeUp.on("error", (error) => {
      console.error(`Error running docker-compose: ${error.message}`);
    });
  }

  if (runOption === "manual") {
    console.log(
      "Please go into the ./next folder and run `npm install && npm run dev`."
    );
    console.log(
      "Please also go into the ./platform folder and run `poetry install && poetry run python -m reworkd_platform`."
    );
    console.log(
      "Please use or update the MySQL database configuration in the env file(s)."
    );
  }
};

printTitle();

if (doesEnvFileExist()) {
  handleExistingEnv();
} else {
  handleNewEnv();
}
