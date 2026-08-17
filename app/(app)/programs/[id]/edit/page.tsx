import { notFound } from "next/navigation";
import { fetchFeedbackSummary, toProp } from "@/lib/adaptive";
import { createClient, getUser } from "@/lib/supabase/server";
import ProgramEditor from "@/components/ProgramEditor";
import type { Answers } from "@/lib/types";

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  const supabase = await createClient();

  const { data: program } = await supabase
    .from("programs")
    .select("id, name, answers")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!program) notFound();

  const feedback = await fetchFeedbackSummary(supabase, user!.id);

  return (
    <ProgramEditor
      programId={id}
      initialName={program.name}
      initialAnswers={program.answers as Answers}
      feedback={feedback ? toProp(feedback) : null}
    />
  );
}