import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "receipt-tracker",
  // Inngest will automatically read INNGEST_SIGNING_KEY from environment variables
  // Make sure to set this in your .env.local file
});
