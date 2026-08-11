import { EmptyState, PageHeader } from "../../components/ui";

export default function QualityControl() {
  return (
    <>
      <PageHeader
        title="Quality control"
        subtitle="Inspection insights and flower acceptance decisions"
        action="+ New inspection"
      />
      <EmptyState title="Quality-control data will appear once the API is connected." />
    </>
  );
}
