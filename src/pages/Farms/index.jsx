import { EmptyState, PageHeader } from "../../components/ui";

export default function Farms() {
  return (
    <>
      <PageHeader
        title="Supplier farms"
        subtitle="Cultivation capacity, harvesting, and partner health"
        action="+ Add farm"
      />
      <EmptyState title="Farm data will appear once the API is connected." />
    </>
  );
}
