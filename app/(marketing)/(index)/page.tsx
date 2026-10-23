import Hero from "@/components/site/Hero";
import PostList from "@/components/site/post-list";
import { Suspense } from "react";
import Loading from "../loading";

const page = () => {
  return (
    <div>
      <Hero />
      <Suspense fallback={<Loading />}>
        <PostList />
      </Suspense>
    </div>
  );
};

export default page;
