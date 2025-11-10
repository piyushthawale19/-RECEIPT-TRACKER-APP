import { AuthConfig } from "convex/server";

const clerkDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;
if (!clerkDomain) {
  throw new Error(
    "Missing CLERK_JWT_ISSUER_DOMAIN in environment variables. Set this to your Clerk JWT issuer URL in the Convex dashboard.",
  );
}

export default {
  providers: [
    {
      domain: clerkDomain,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
