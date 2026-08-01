import { PageHeader, ThemeToggle } from "../../components/ui";
export default function Settings() {
  const sections = [
    ["Profile", "Your name, photo and work details"],
    ["Company", "BloomFlow organization details"],
    ["Notifications", "Operational alerts and daily digests"],
    ["Appearance", "Interface and display preferences"],
    ["Security", "Password and active sessions"],
    ["System", "Data retention and integrations"],
  ];
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your workspace preferences"
      />
      <div className="settings">
        {sections.map(([a, b]) => (
          <article key={a}>
            <div>
              <h3>{a}</h3>
              <p>{b}</p>
            </div>
            {a === "Appearance" ? (
              <ThemeToggle />
            ) : (
              <button className="text-button">Configure →</button>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
