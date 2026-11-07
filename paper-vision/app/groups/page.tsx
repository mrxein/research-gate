import GroupBoard from "@/components/GroupBoard";
import { Page } from "@/components/ui";

export default function Groups() {
  return (
    <Page title="My groups" sub="Drag papers into groups, rename groups, or use the Move menu on each paper.">
      <GroupBoard />
    </Page>
  );
}