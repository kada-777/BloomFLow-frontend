import MasterDataPage from "../../components/common/MasterDataPage/MasterDataPage";

export default function FlowerCatalog() {
  return (
    <MasterDataPage
      resource="flowers"
      title="Flower Catalog"
      subtitle="The central product library for every branch"
      addLabel="Add Flower"
      searchPlaceholder="Search flower name or variety..."
      emptyMessage="No flowers available."
      searchableFields={["name", "variety"]}
      sortOptions={[
        { value: "default", label: "Default" },
        { value: "name_asc", label: "Flower A-Z" },
        { value: "name_desc", label: "Flower Z-A" },
      ]}
      columns={[
        { key: "name", label: "FLOWER NAME" },
        { key: "variety", label: "VARIETY" },
      ]}
      fields={[
        { name: "name", label: "Flower Name", required: true, placeholder: "Example: Red Rose" },
        { name: "variety", label: "Variety", required: true, placeholder: "Example: Rose" },
      ]}
      formCopy={{
        entityName: "Flower",
        createTitle: "Add New Flower",
        createSubtitle: "Add a flower to the BloomFlow catalog",
        editTitle: "Edit Flower",
        editSubtitle: "Update flower information",
      }}
    />
  );
}
