import MasterDataPage from "../../components/common/MasterDataPage/MasterDataPage";

export default function Branches() {
  return (
    <MasterDataPage
      resource="branches"
      title="Branches"
      subtitle="Monitor operations across your branch network"
      addLabel="Tambah Branch"
      searchPlaceholder="Cari nama atau lokasi branch..."
      emptyMessage="Belum ada branch yang tersedia."
      searchableFields={["name", "location"]}
      columns={[
        { key: "name", label: "NAMA BRANCH" },
        { key: "location", label: "LOKASI" },
      ]}
      fields={[
        { name: "name", label: "Nama Branch", required: true, placeholder: "Contoh: Cabang Jakarta" },
        { name: "location", label: "Lokasi", required: true, placeholder: "Contoh: Jakarta Selatan" },
      ]}
      formCopy={{
        entityName: "Branch",
        createTitle: "Tambah Branch Baru",
        createSubtitle: "Tambahkan branch ke jaringan BloomFlow",
        editTitle: "Edit Branch",
        editSubtitle: "Perbarui informasi branch",
      }}
    />
  );
}
