import MasterDataPage from "../../components/common/MasterDataPage/MasterDataPage";

export default function Farms() {
  return (
    <MasterDataPage
      resource="farms"
      title="Supplier Farms"
      subtitle="Cultivation capacity, harvesting, and partner health"
      addLabel="Tambah Farm"
      searchPlaceholder="Cari nama atau lokasi farm..."
      emptyMessage="Belum ada farm yang tersedia."
      searchableFields={["name", "location"]}
      columns={[
        { key: "name", label: "NAMA FARM" },
        { key: "location", label: "LOKASI" },
      ]}
      fields={[
        { name: "name", label: "Nama Farm", required: true, placeholder: "Contoh: Kebun Bunga Bandung" },
        { name: "location", label: "Lokasi", required: true, placeholder: "Contoh: Bandung, Jawa Barat" },
      ]}
      formCopy={{
        entityName: "Farm",
        createTitle: "Tambah Farm Baru",
        createSubtitle: "Tambahkan farm pemasok ke BloomFlow",
        editTitle: "Edit Farm",
        editSubtitle: "Perbarui informasi farm",
      }}
    />
  );
}
