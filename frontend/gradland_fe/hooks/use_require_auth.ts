import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { use_current_user } from "./use_profile";

// Redirects to /login if the session check fails (expired refresh token,
// no cookies, etc). Use this on any page that requires a logged-in user.
export const use_require_auth = () => {
  const router = useRouter();
  const query = use_current_user();

  useEffect(() => {
    if (query.isError) router.replace("/auth/login");
  }, [query.isError, router]);

  return query;
};
