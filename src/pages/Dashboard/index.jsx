import { useOutletContext } from "react-router-dom";
import { EmptyState, PageHeader } from "../../components/ui";

const roleCopy = {
  "Super Admin": ["Supply chain overview", "Live intelligence across your branch network"],
  "Head Office": ["Warehouse command center", "Balance stock, plan distribution, and purchase with confidence"],
  "Branch Staff": ["Branch operations", "Keep shelves fresh and fulfil local demand"],
};

export default function Dashboard() {
  const { role } = useOutletContext();
  const [title, subtitle] =
    roleCopy[role] || ["Account access", "Your assigned workspace"];

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} action="Export report" />
      <EmptyState title="Dashboard data will appear once the API is connected." />
    </>
  );
}
