import { PageHeader } from "../ui";

export default function DashboardHeader({ title, subtitle, showAction = true }) {
  return <PageHeader title={title} subtitle={subtitle} action={showAction ? "Export report" : null} />;
}
