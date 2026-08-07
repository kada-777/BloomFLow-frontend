import { EmptyState, PageHeader } from "../../components/ui";

export default function FlowerCatalog() {
  return (
    <>
      <PageHeader
        title="Flower catalog"
        subtitle="The central product library for every branch"
        action="+ Add flower"
      />
      <EmptyState title="Flower catalog data will appear once the API is connected." />
    </>
  );
}
