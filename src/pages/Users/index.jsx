import { EmptyState, PageHeader } from "../../components/ui";

export default function Users() {
  return (
    <>
      <PageHeader
        title="Team & permissions"
        subtitle="Manage access across BloomFlow operations"
        action="+ Invite user"
      />
      <EmptyState title="User data will appear once the API is connected." />
    </>
  );
}
