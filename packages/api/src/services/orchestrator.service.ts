import { prisma } from "@conversio/db";
import type { OrchestrationDecision } from "@conversio/shared";
import { EventType } from "@conversio/shared";
import { conversationRepository } from "../repositories/conversation.repository";
import { publishEvent } from "../jobs/event-publisher";

export class OrchestratorService {
  /**
   * Decides who should handle the next turn in a conversation.
   * Priority: FLOW > LYRO > AGENT (human ownership is sticky)
   */
  async decide(
    tenantId: string,
    conversationId: string,
  ): Promise<OrchestrationDecision> {
    const conversation = await conversationRepository.findById(
      tenantId,
      conversationId,
    );

    // Human ownership is sticky — never override
    if (conversation.currentOwnerType === "AGENT") {
      return "AGENT_HANDLES";
    }

    // Check for active flow run
    const activeFlowRun = await prisma.flowRun.findFirst({
      where: {
        conversationId,
        status: { in: ["RUNNING", "WAITING_INPUT"] },
      },
    });

    if (activeFlowRun) {
      return "FLOW_HANDLES";
    }

    // Check if Lyro is enabled for this tenant and channel
    const lyroConfig = await prisma.lyroConfig.findUnique({
      where: { tenantId },
    });

    if (
      lyroConfig?.enabled &&
      lyroConfig.channels.includes(conversation.channel)
    ) {
      // Don't re-route to Lyro if it already handed off
      if (conversation.currentOwnerType !== "LYRO") {
        return "LYRO_HANDLES";
      }
    }

    // Default to human agents
    return "AGENT_HANDLES";
  }

  /**
   * Applies the orchestration decision by updating conversation ownership.
   */
  async transition(
    tenantId: string,
    conversationId: string,
    decision: OrchestrationDecision,
  ): Promise<void> {
    const conversation = await conversationRepository.findById(
      tenantId,
      conversationId,
    );
    const previousOwnerType = conversation.currentOwnerType;

    switch (decision) {
      case "FLOW_HANDLES":
        await conversationRepository.updateOwner(tenantId, conversationId, "FLOW");
        break;
      case "LYRO_HANDLES":
        await conversationRepository.updateOwner(tenantId, conversationId, "LYRO");
        break;
      case "AGENT_HANDLES":
        // Only update if not already owned by an agent
        if (conversation.currentOwnerType !== "AGENT") {
          await conversationRepository.updateOwner(
            tenantId,
            conversationId,
            "UNASSIGNED",
          );
        }
        break;
      case "NO_HANDLER":
        break;
    }

    const updated = await conversationRepository.findById(tenantId, conversationId);

    if (updated.currentOwnerType !== previousOwnerType) {
      await publishEvent({
        id: crypto.randomUUID(),
        tenantId,
        type: EventType.CONVERSATION_OWNER_CHANGED,
        payload: {
          conversationId,
          tenantId,
          previousOwnerType,
          newOwnerType: updated.currentOwnerType,
          newOwnerId: updated.currentOwnerId ?? undefined,
        },
        ts: new Date().toISOString(),
        source: "orchestrator",
      });
    }
  }
}

export const orchestratorService = new OrchestratorService();
