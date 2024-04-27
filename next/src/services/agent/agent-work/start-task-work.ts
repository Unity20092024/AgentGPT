import type AgentWork from "./agent-work";
import type AutonomousAgent from "../autonomous-agent";

export default class StartGoalWork implements AgentWork {
  private tasksValues: string[] = [];
  private goalMessage?: string;

  constructor(private parent: AutonomousAgent) {}

  async run(): Promise<void> {
    this.goalMessage = this.parent.messageService.sendGoalMessage(this.parent.model.getGoal());
    this.tasksValues = await this.parent.api.getInitialTasks();
    await this.parent.api.createAgent();
  }

  async conclude(): Promise<void> {
    if (!this.goalMessage) {
      throw new Error("goalMessage is not defined");
    }

    const taskMessages = this.parent.createTaskMessages(this.tasksValues);
    this.parent.api.saveMessages([this.goalMessage, ...taskMessages]);
  }

  onError(e: unknown): boolean {
    this.parent.messageService.sendErrorMessage(e);
    return true;
  }

  next(): undefined {
    return undefined;
  }
}
