import { PageHeader } from "../ui";

export default function DashboardHeader({ title, subtitle }) {
  return <PageHeader title={title} subtitle={subtitle} action="Export report" />;
}
