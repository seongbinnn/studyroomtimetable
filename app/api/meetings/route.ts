import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function unavailable() {
  return Response.json({ error: "Supabase is not configured" }, { status: 503 });
}

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) return unavailable();

  const { data, error } = await supabase
    .from("meetings")
    .select("id, name")
    .order("created_at", { ascending: false });

  return error
    ? Response.json({ error: error.message }, { status: 500 })
    : Response.json(data);
}

export async function POST(request: Request) {
  const supabase = getSupabase();
  if (!supabase) return unavailable();

  const { name } = await request.json();
  if (typeof name !== "string" || !name.trim()) {
    return Response.json({ error: "name required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("meetings")
    .insert({ name: name.trim() })
    .select("id, name")
    .single();

  return error
    ? Response.json({ error: error.message }, { status: 500 })
    : Response.json(data);
}
