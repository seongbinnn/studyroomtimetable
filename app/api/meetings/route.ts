import { env } from "cloudflare:workers";
export const dynamic = "force-dynamic";
export async function GET(){try{const r=await env.DB.prepare("SELECT id, name FROM meetings ORDER BY id DESC").all();return Response.json(r.results)}catch{return Response.json({error:"database unavailable"},{status:503})}}
export async function POST(request:Request){try{const {name}=await request.json();if(typeof name!=="string"||!name.trim())return Response.json({error:"name required"},{status:400});const r=await env.DB.prepare("INSERT INTO meetings (name, created_at) VALUES (?, datetime('now'))").bind(name.trim()).run();return Response.json({id:r.meta.last_row_id,name:name.trim()})}catch{return Response.json({error:"database unavailable"},{status:503})}}
