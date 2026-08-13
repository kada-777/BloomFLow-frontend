import MasterDataPage from "../../components/common/MasterDataPage/MasterDataPage";

export default function Branches() {
  return (
    <MasterDataPage
      resource="branches"
      title="Branches"
      subtitle="Monitor operations across your branch network"
      addLabel="Add Branch"
      searchPlaceholder="Search branch name or location..."
      emptyMessage="No branches available."
      searchableFields={["name", "location"]}
      columns={[
        { key: "name", label: "BRANCH NAME" },
        { key: "location", label: "LOCATION" },
      ]}
      fields={[
        { name: "name", label: "Branch Name", required: true, placeholder: "Example: Jakarta Branch" },
        { name: "location", label: "Location", required: true, placeholder: "Example: South Jakarta" },
      ]}
      formCopy={{
        entityName: "Branch",
        createTitle: "Add New Branch",
        createSubtitle: "Add a branch to the BloomFlow network",
        editTitle: "Edit Branch",
        editSubtitle: "Update branch information",
      }}
    />
  );
}
