import React from "react";
// @ts-ignore
import { LazySuspense } from "react-loosely-lazy";
import { useRouter, Link } from "@atlaskit/router";

import { ErrorBoundary } from "./error-boundary";

const Loading = () => (
  <div>
    <br />
    loading via LazySuspense fallback component...
  </div>
);

const RouteSidebar = () => {
  const [{ route }] = useRouter();
  // @ts-ignore
  if (!route.sidebar) return null;
  return (
    <aside>
      <ErrorBoundary>
        <LazySuspense fallback={<Loading />}>
          {/* 
       // @ts-ignore */}
          <route.sidebar />
        </LazySuspense>
      </ErrorBoundary>
    </aside>
  );
};

const RouteComponent = () => {
  const [{ route }] = useRouter();
  return (
    <main>
      <ErrorBoundary>
        <LazySuspense fallback={<Loading />}>
          {/* 
       // @ts-ignore */}
          <route.component />
        </LazySuspense>
      </ErrorBoundary>
    </main>
  );
};

export const Layout = () => {
  return (
    <section>
      <header>
        <Link href="/">Home</Link>
      </header>
      <RouteSidebar />
      <RouteComponent />
    </section>
  );
};
