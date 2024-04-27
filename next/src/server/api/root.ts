import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { agentService } from "../services/agentService";

const agentRouter = createTRPCRouter({
  getAgents: publicProcedure.query(() => {
    return agentService.getAgents();
  }),

  getAgentById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return agentService.getAgentById(input.id);
    }),

  createAgent: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(({ input }) => {
      return agentService.createAgent(input);
    }),

  updateAgent: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(({ input }) => {
      return agentService.updateAgent(input);
    }),

  deleteAgent: publicProcedure.input(z.object({ id: z.string() })).mutation(
    ({ input }) => {
      return agentService.deleteAgent(input.id);
    }
  ),
});

export type AppRouter = typeof appRouter;
