import type { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-12">
      {children}
    </div>
  );
};

export default AuthLayout;
