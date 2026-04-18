import type { Message, MessageDisplayNode, MessageGroupNode } from "../types";

/**
 * Groups consecutive messages with the same groupedId (Telegram Albums)
 * into a single display node.
 */
export const groupMessages = (messages: Message[]): MessageDisplayNode[] => {
  const result: MessageDisplayNode[] = [];
  let currentGroup: MessageGroupNode | null = null;

  messages.forEach((m) => {
    const groupId = m.groupedId;

    if (groupId) {
      if (currentGroup && currentGroup.groupedId === groupId) {
        currentGroup.items.push(m);
      } else {
        currentGroup = {
          isGroup: true,
          groupedId: groupId,
          items: [m],
          key: `group-${groupId}-${m.messageId}`,
        };
        result.push(currentGroup);
      }
    } else {
      currentGroup = null;
      result.push({
        isGroup: false,
        item: m,
        key: m.messageId,
      });
    }
  });

  return result;
};
