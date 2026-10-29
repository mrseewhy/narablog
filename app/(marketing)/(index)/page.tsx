import Hero from "@/components/site/Hero";
import { HomeFeed } from "@/components/site/home-feed";
import { Suspense } from "react";
import Loading from "../loading";

import { getHomePostsPage } from "@/lib/data/dal/post.dal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

async function Feed() {
  const initialPage = await getHomePostsPage();
  return <HomeFeed key={initialPage.items[0]?.id ?? "empty"} initialPage={initialPage} />;
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
