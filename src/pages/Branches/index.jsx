import { EmptyState, PageHeader } from "../../components/ui";

export default function Branches() {
  return (
    <>
      <PageHeader
        title="Branches"
        subtitle="Monitor operations across your branch network"
        action="+ Add branch"
      />
      <EmptyState title="Branch data will appear once the API is connected." />
    </>
  );
}
