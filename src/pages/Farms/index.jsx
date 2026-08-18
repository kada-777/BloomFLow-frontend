import MasterDataPage from "../../components/common/MasterDataPage/MasterDataPage";

export default function Farms() {
  return (
    <MasterDataPage
      resource="farms"
      title="Supplier Farms"
      subtitle="Cultivation capacity, harvesting, and partner health"
      addLabel="Add Farm"
      searchPlaceholder="Search farm name or location..."
      emptyMessage="No farms available."
      searchableFields={["name", "location"]}
      columns={[
        { key: "name", label: "FARM NAME" },
        { key: "location", label: "LOCATION" },
      ]}
      fields={[
        { name: "name", label: "Farm Name", required: true, placeholder: "Example: Bandung Flower Farm" },
        { name: "location", label: "Location", required: true, placeholder: "Example: Bandung, West Java" },
      ]}
      formCopy={{
        entityName: "Farm",
        createTitle: "Add New Farm",
        createSubtitle: "Add a supplier farm to BloomFlow",
        editTitle: "Edit Farm",
        editSubtitle: "Update farm information",
      }}
    />
  );
}
