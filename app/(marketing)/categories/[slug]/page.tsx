import { Suspense } from "react";

import CategoryDetails from "../_component/CategoryDetails";
import Loading from "../loading";

const CategoryPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  return (
    <Suspense fallback={<Loading />}>
      <CategoryDetails params={params} />
    </Suspense>
  );
};

export default CategoryPage;
