import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
const colors = ["#6557e8", "#e36b5d", "#37a885", "#d79a30", "#4c87d9", "#c65aa6"];

function unavailable() {
  return Response.json({ error: "Supabase is not configured" }, { status: 503 });
}

export async function GET(request: Request) {
  const supabase = getSupabase();
  if (!supabase) return unavailable();

  const meetingId = new URL(request.url).searchParams.get("meetingId");
  if (!meetingId) return Response.json([]);

  const { data, error } = await supabase
    .from("availability")
    .select("participant_name, slot")
    .eq("meeting_id", meetingId)
    .order("participant_name")
    .order("slot");

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const entries = new Map<string, number[]>();
  for (const row of data) {
    entries.set(row.participant_name, [
      ...(entries.get(row.participant_name) ?? []),
      row.slot,
    ]);
  }

  return Response.json(
    [...entries].map(([name, slots], index) => ({
      name,
      slots,
      color: colors[index % colors.length],
    })),
  );
}

export async function POST(request: Request) {
  const supabase = getSupabase();
  if (!supabase) return unavailable();

  const { meetingId, name, slots } = (await request.json()) as {
    meetingId?: unknown;
    name?: unknown;
    slots?: unknown;
  };
  if (typeof meetingId !== "string" || typeof name !== "string" || !Array.isArray(slots)) {
    return Response.json({ error: "invalid input" }, { status: 400 });
  }

  const participantName = name.trim();
  const cleanSlots = [...new Set(slots.filter((slot) => Number.isInteger(slot) && slot >= 0 && slot < 336))];
  const { error: deleteError } = await supabase
    .from("availability")
    .delete()
    .eq("meeting_id", meetingId)
    .eq("participant_name", participantName);

  if (deleteError) return Response.json({ error: deleteError.message }, { status: 500 });
  if (cleanSlots.length === 0) return Response.json({ ok: true });

  const { error: insertError } = await supabase.from("availability").insert(
    cleanSlots.map((slot) => ({
      meeting_id: meetingId,
      participant_name: participantName,
      slot,
    })),
  );

  return insertError
    ? Response.json({ error: insertError.message }, { status: 500 })
    : Response.json({ ok: true });
}
