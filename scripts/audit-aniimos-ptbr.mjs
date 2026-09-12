import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

function loadLocalEnv(){const p=resolve(process.cwd(),".env.local");if(!existsSync(p))return;for(const r of readFileSync(p,"utf8").split(/\r?\n/)){const l=r.trim();if(!l||l.startsWith("#"))continue;const s=l.indexOf("=");if(s<1)continue;const k=l.slice(0,s).trim();let v=l.slice(s+1).trim();if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);if(!process.env[k])process.env[k]=v;}}

async function main(){
  loadLocalEnv();const url=process.env.DATABASE_URL;if(!url)throw new Error("DATABASE_URL não encontrada no .env.local.");const sql=neon(url);
  console.log("1/3 Auditando descrições dos Aniimos...");
  const rows=await sql.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER (WHERE descricao IS NOT NULL AND btrim(descricao)<>'')::int origem,COUNT(*) FILTER (WHERE descricao_pt_br IS NOT NULL AND btrim(descricao_pt_br)<>'')::int pt_br FROM aniimos`);const r=rows[0];
  if(r.total!==95||r.origem!==95||r.pt_br!==95)throw new Error(`Cobertura inválida: total=${r.total}, origem=${r.origem}, pt_br=${r.pt_br}.`);
  console.log("   OK 95/95 descrições em PT-BR.");
  console.log("2/3 Auditando rastreabilidade...");
  const meta=await sql.query(`SELECT COUNT(*)::int total FROM traducoes_pt_br WHERE entidade='aniimos' AND campo='descricao'`);if(meta[0].total!==95)throw new Error(`Metadados incompletos: ${meta[0].total}/95.`);console.log("   OK 95/95 metadados de tradução.");
  console.log("3/3 Finalizando...");console.log("\nDescrições dos 95 Aniimos localizadas e auditadas.");
}
main().catch(e=>{console.error("\nFalha na auditoria dos Aniimos:");console.error(e instanceof Error?e.message:e);process.exitCode=1;});
