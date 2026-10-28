import Hero from "@/components/site/Hero";
import PostList from "@/components/site/post-list";
import { Suspense } from "react";
import Loading from "../loading";

import { getPublicPosts } from "@/lib/data/dal/post.dal";

async function Feed() {
  return <PostList items={await getPublicPosts()} />;
}

const page = () => {
  return (
    <div>
      <Hero />
      <Suspense fallback={<Loading />}>
        <Feed />
      </Suspense>
    </div>
  );
};

export default page;
