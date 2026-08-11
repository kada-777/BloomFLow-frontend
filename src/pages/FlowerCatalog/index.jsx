import MasterDataPage from "../../components/common/MasterDataPage/MasterDataPage";

export default function FlowerCatalog() {
  return (
    <MasterDataPage
      resource="flowers"
      title="Flower Catalog"
      subtitle="The central product library for every branch"
      addLabel="Tambah Bunga"
      searchPlaceholder="Cari nama atau varietas bunga..."
      emptyMessage="Belum ada bunga yang tersedia."
      searchableFields={["name", "variety"]}
      columns={[
        { key: "name", label: "NAMA BUNGA" },
        { key: "variety", label: "VARIETAS" },
      ]}
      fields={[
        { name: "name", label: "Nama Bunga", required: true, placeholder: "Contoh: Mawar Merah" },
        { name: "variety", label: "Varietas", required: true, placeholder: "Contoh: Rose" },
      ]}
      formCopy={{
        entityName: "Bunga",
        createTitle: "Tambah Bunga Baru",
        createSubtitle: "Tambahkan bunga ke katalog BloomFlow",
        editTitle: "Edit Bunga",
        editSubtitle: "Perbarui informasi bunga",
      }}
    />
  );
}
