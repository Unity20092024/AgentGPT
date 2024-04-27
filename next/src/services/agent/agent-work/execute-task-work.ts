import { v1 } from "uuid";

import type AgentWork from "./agent-work";
import type { Message } from "../../../types/message";
import type { Task } from "../../../types/task";
import { toApiModelSettings } from "../../../utils/interfaces";
import { streamText } from "../../stream-utils";
import type { Analysis } from "../analysis";
import type AutonomousAgent from "../autonomous-agent";

export default class ExecuteTaskWork implements AgentWork {
  result = "";

  constructor(
    private readonly parent: AutonomousAgent,
    private readonly task: Task,
    private readonly analysis: Analysis
  ) {}

  run = async (): Promise<void> => {
    if (!this.parent.api || !this.parent.api.saveMessages || !this.parent.api.props || !this.parent.api.runId) {
      throw new Error("Missing required properties of parent.api");
    }

    if (!this.parent.model || !this.parent.model.getGoal || !this.parent.model.updateTaskResult || !this.parent.model.getLifecycle) {
      throw new Error("Missing required methods of parent.model");
    }

    if (!this.parent.messageService || !this.parent.messageService.sendMessage || !this.parent.messageService.updateMessage || !this.parent.messageService.sendErrorMessage) {
      throw new Error("Missing required methods of parent.messageService");
    }

    const executionMessage: Message = {
      ...this.task,
      id: v1(),
      status: "completed",
      info: "Loading...",
    };

    this.parent.messageService.sendMessage({ ...executionMessage, status: "completed" });

    try {
      await streamText(
        "/api/agent/execute",
        {
          run_id: this.parent.api.runId,
          goal: this.parent.model.getGoal(),
          task: this.task.value,
          analysis: this.analysis,
          model_settings: toApiModelSettings(this.parent.modelSettings, this.parent.session),
        },
        this.parent.api.props.session?.accessToken || "",
        () => {
          executionMessage.info = "";
        },
        (text) => {
          executionMessage.info += text;
          if (this.parent.model && this.task) {
            this.task = this.parent.model.updateTaskResult(this.task, executionMessage.info || "");
            this.parent.messageService.updateMessage(executionMessage);
          }
        },
        () => {
          if (this.parent.model && this.parent.model.getLifecycle) {
            if (this.parent.model.getLifecycle() === "stopped") {
              return true;
            }
          }
          throw new Error("Unexpected end of stream");
        }
      );
    } catch (e) {
      this.parent.messageService.sendErrorMessage(e);
      throw e;
    }

    this.result = executionMessage.info || "";
    if (this.parent.api && this.parent.api.saveMessages) {
      this.parent.api.saveMessages([executionMessage]);
    }

    if (this.parent.model && this.task) {
      this.task = this.parent.model.updateTaskStatus(this.task, "completed");
    }
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  conclude = async (): Promise<void> => {};

  next = (): void => {};

  onError = (e: unknown): boolean => {
    this.parent.messageService.sendErrorMessage(e);
    return true;
  };
}
