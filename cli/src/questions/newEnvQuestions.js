import { isValidKey, validKeyErrorMessage } from "../helpers.js";
import { RUN_OPTION_QUESTION } from "./sharedQuestions.js";
import fetch from "node-fetch";
import { setTimeout } from "timers/promises";

const apiKeyValidators = {
  OpenAIApiKey: /^sk-[a-zA-Z0-9]{48}$/,
  serpApiKey: /^[a-zA-Z0-9]{40}$/,
  replicateApiKey: /^r8_[a-zA-Z0-9]{37}$/,
};

const apiEndpoints = {
  OpenAI: "https://api.openai.com/v1/models",
  SERP: "https://google.serper.dev/search",
  Replicate: "https://api.replicate.com/v1/models/replicate/hello-world",
};

const apiRequestOptions = {
  OpenAI: {
    method: "GET",
    headers: {
      "Authorization": "Bearer {{OpenAIApiKey}}",
    },
  },
  SERP: {
    method: "POST",
    headers: {
      "X-API-KEY": "{{serpApiKey}}",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: "apple inc" }),
  },
  Replicate: {
    method: "GET",
    headers: {
      "Authorization": `Token {{replicateApiKey}}`,
    },
  },
};

const errorMessages = {
  OpenAI: "Invalid OpenAI API key. Please check your key and try again.",
  SERP: "Invalid SERP API key. Please check your key and try again.",
  Replicate: "Invalid Replicate API key. Please check your key and try again.",
};

export const newEnvQuestions = [
  RUN_OPTION_QUESTION,
  {
    type: "input",
    name: "OpenAIApiKey",
    message:
      "Enter your openai key (eg: sk...) or press enter to continue with no key:",
    validate: async (apikey) => {
      if (apikey === "") return true;

      if (!isValidKey(apikey, apiKeyValidators.OpenAI)) {
        return validKeyErrorMessage;
      }

      const requestOptions = { ...apiRequestOptions.OpenAI, headers: { ...apiRequestOptions.OpenAI.headers, "OpenAIApiKey": apikey } };
      try {
        const response = await fetch(apiEndpoints.OpenAI, requestOptions);
        if (!response.ok) {
          if (response.status === 401) {
            return errorMessages.OpenAI;
          }
          throw new Error("Invalid OpenAI API response.");
        }

        const data = await response.json();
        if (!Array.isArray(data.data)) {
          throw new Error("Invalid OpenAI API response.");
        }

        return true;
      } catch (error) {
        return errorMessages.OpenAI;
      }
    },
  },
  {
    type: "input",
    name: "serpApiKey",
    message:
      "What is your SERP API key (https://serper.dev/)? Leave empty to disable web search.",
    validate: async (apikey) => {
      if (apikey === "") return true;

      if (!isValidKey(apikey, apiKeyValidators.serpApiKey)) {
        return validKeyErrorMessage;
      }

      const requestOptions = { ...apiRequestOptions.SERP, headers: { ...apiRequestOptions.SERP.headers, "serpApiKey": apikey } };
      try {
        const response = await fetch(apiEndpoints.SERP, requestOptions);
        if (!response.ok) {
          if (response.status === 401) {
            return errorMessages.SERP;
          }
          throw new Error("Invalid SERP API response.");
        }

        const data = await response.json();
        if (!data.organic_results) {
          throw new Error("Invalid SERP API response.");
        }

        return true;
      } catch (error) {
        return errorMessages.SERP;
      }
    },
  },
  {
    type: "input",
    name: "replicateApiKey",
    message:
      "What is your Replicate API key (https://replicate.com/)? Leave empty to just use DALL-E for image generation.",
    validate: async (apikey) => {
      if (apikey === "") return true;

      if (!isValidKey(apikey, apiKeyValidators.Replicate)) {
        return validKeyErrorMessage;
      }

      const requestOptions = { ...apiRequestOptions.Replicate, headers: { ...apiRequestOptions.Replicate.headers, "replicateApiKey": apikey } };
      try {
        const response = await fetch(apiEndpoints.Replicate, requestOptions);
        if (!response.ok) {
          if (response.status === 401) {
            return errorMessages.Replicate;
          }
          throw new Error("Invalid Replicate API response.");
        }

        const data = await response.json();
        if (data.error) {
          throw new Error("Invalid Replicate API response.");
        }

        return true;
      } catch (error) {
        return errorMessages.Replicate;
      }
    },
  },
];

// Add a delay between each API request to avoid hitting rate limits
const delay = 1000; // 1 second
newEnvQuestions.forEach((question, index) => {
  if (question.validate) {
    question.validate = async (apikey) => {
      const result = await question.validate(apikey);
      if (result !== true) {
        return result;
      }
      await setTimeout(delay * index);
      return result;
    };
  }
});
