import { create } from "zustand";

type ConversationFolder =
  | "UNASSIGNED"
  | "ASSIGNED"
  | "LYRO"
  | "RESOLVED"
  | "SPAM";

type InboxState = {
  activeFolder: ConversationFolder;
  activeConversationId: string | null;
  setFolder: (folder: ConversationFolder) => void;
  setActiveConversation: (id: string | null) => void;
};

export const useInboxStore = create<InboxState>((set) => ({
  activeFolder: "UNASSIGNED",
  activeConversationId: null,

  setFolder: (folder) =>
    set({ activeFolder: folder, activeConversationId: null }),

  setActiveConversation: (id) => set({ activeConversationId: id }),
}));
