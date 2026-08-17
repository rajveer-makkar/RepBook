import { fetchFeedbackSummary, toProp } from "@/lib/adaptive";
import { createClient, getUser } from "@/lib/supabase/server";
import NewProgramForm from "@/components/NewProgramForm";

export default async function NewProgramPage() {
  const user = await getUser();
  const supabase = await createClient();
  const feedback = await fetchFeedbackSummary(supabase, user!.id);
  return <NewProgramForm feedback={feedback ? toProp(feedback) : null} />;
}