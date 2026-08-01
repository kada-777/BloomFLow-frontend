import { PageHeader } from "../../components/ui";
import FlowerCard from "../../components/common/FlowerCard";
import { flowers } from "../../utils/data";
export default function FlowerCatalog() {
  return (
    <>
      <PageHeader
        title="Flower catalog"
        subtitle="The central product library for every branch"
        action="+ Add flower"
      />
      <div className="catalog-grid">
        {flowers.map((flower, index) => (
          <FlowerCard key={flower.name} flower={flower} index={index} />
        ))}
      </div>
    </>
  );
}
