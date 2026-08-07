import { EmptyState, PageHeader } from "../../components/ui";

export default function Forecasting() {
  return (
    <>
      <PageHeader
        title="Demand forecasting"
        subtitle="AI-guided demand signals for smarter purchasing"
        action="Review recommendations"
      />
      <EmptyState title="Forecast data will appear once the API is connected." />
    </>
  );
}
