import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type UserLinkProps = {
  username?: string | null;
  children: ReactNode;
  className?: string;
};

export function UserLink({ username, children, className = "" }: UserLinkProps) {
  if (!username) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      to={`/profile/${username}`}
      className={`text-primary hover:underline transition-all cursor-pointer font-medium ${className}`}
    >
      {children}
    </Link>
  );
}
