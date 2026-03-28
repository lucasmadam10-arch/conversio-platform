import { AppShell } from "../../components/AppShell";
import { ConversationList } from "./ConversationList";
import { ConversationThread } from "./ConversationThread";

export function InboxPage() {
  return (
    <AppShell>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <ConversationList />
        <ConversationThread />
      </div>
    </AppShell>
  );
}
