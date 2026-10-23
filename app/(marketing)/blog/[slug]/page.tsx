import { Suspense } from "react";
import BlogPostPage from "../_component/BlogDetails";
import Loading from "../../loading";

const page = ({ params }: { params: Promise<{ slug: string }> }) => {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <BlogPostPage params={params} />
      </Suspense>
    </div>
  );
};

export default page;
