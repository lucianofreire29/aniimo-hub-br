import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

function loadLocalEnv(){const p=resolve(process.cwd(),".env.local");if(!existsSync(p))return;for(const r of readFileSync(p,"utf8").split(/\r?\n/)){const l=r.trim();if(!l||l.startsWith("#"))continue;const s=l.indexOf("=");if(s<1)continue;const k=l.slice(0,s).trim();let v=l.slice(s+1).trim();if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);if(!process.env[k])process.env[k]=v;}}

function assertCoverage(label,row,expectedTotal,expectedNames,expectedDescriptions=null){
  if(row.total!==expectedTotal)throw new Error(`${label}: total=${row.total}, esperado=${expectedTotal}.`);
  if(expectedNames!==null&&row.nomes_pt_br!==expectedNames)throw new Error(`${label}: nomes PT-BR=${row.nomes_pt_br}/${expectedNames}.`);
  if(expectedDescriptions!==null&&row.descricoes_pt_br!==expectedDescriptions)throw new Error(`${label}: descrições PT-BR=${row.descricoes_pt_br}/${expectedDescriptions}.`);
  const parts=[`${row.total} registros`];if(expectedNames!==null)parts.push(`${row.nomes_pt_br} nomes PT-BR`);if(expectedDescriptions!==null)parts.push(`${row.descricoes_pt_br} descrições PT-BR`);console.log(`   OK ${label}: ${parts.join(" | ")}`);
}

async function main(){
  loadLocalEnv();const url=process.env.DATABASE_URL;if(!url)throw new Error("DATABASE_URL não encontrada no .env.local.");const sql=neon(url);
  console.log("1/3 Auditando glossário e taxonomias...");
  for(const [table,label,total] of [["elementos","Elementos",9],["funcoes","Funções",5],["estagios","Estágios",3],["pathfindings","Pathfindings",3],["regioes","Regiões",15]]){
    const [r]=await sql.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER (WHERE nome_pt_br IS NOT NULL AND btrim(nome_pt_br)<>'')::int nomes_pt_br FROM ${table}`);assertCoverage(label,r,total,total,null);
  }
  const [mob]=await sql.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER (WHERE nome_pt_br IS NOT NULL AND btrim(nome_pt_br)<>'')::int nomes_pt_br,COUNT(*) FILTER (WHERE descricao IS NOT NULL AND btrim(descricao)<>'' AND descricao_pt_br IS NOT NULL AND btrim(descricao_pt_br)<>'')::int descricoes_pt_br FROM mobilidades`);assertCoverage("Mobilidades",mob,19,19,18);
  const [traits]=await sql.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER (WHERE nome_pt_br IS NOT NULL AND btrim(nome_pt_br)<>'')::int nomes_pt_br,COUNT(*) FILTER (WHERE descricao_pt_br IS NOT NULL AND btrim(descricao_pt_br)<>'')::int descricoes_pt_br FROM traits`);assertCoverage("Traits",traits,54,54,54);

  console.log("2/3 Auditando conteúdo principal...");
  const [forms]=await sql.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER (WHERE nome_pt_br IS NOT NULL AND btrim(nome_pt_br)<>'')::int nomes_pt_br,COUNT(*) FILTER (WHERE descricao IS NOT NULL AND btrim(descricao)<>'' AND descricao_pt_br IS NOT NULL AND btrim(descricao_pt_br)<>'')::int descricoes_pt_br FROM aniimo_formas`);assertCoverage("Formas",forms,225,225,185);
  const [aniimos]=await sql.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER (WHERE descricao_pt_br IS NOT NULL AND btrim(descricao_pt_br)<>'')::int descricoes_pt_br FROM aniimos`);assertCoverage("Aniimos",aniimos,95,null,95);
  const [skills]=await sql.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER (WHERE nome_pt_br IS NOT NULL AND btrim(nome_pt_br)<>'')::int nomes_pt_br,COUNT(*) FILTER (WHERE descricao IS NOT NULL AND btrim(descricao)<>'' AND descricao_pt_br IS NOT NULL AND btrim(descricao_pt_br)<>'')::int descricoes_pt_br FROM habilidades`);assertCoverage("Habilidades",skills,364,364,327);
  const [items]=await sql.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER (WHERE nome_pt_br IS NOT NULL AND btrim(nome_pt_br)<>'')::int nomes_pt_br FROM itens WHERE ativo=TRUE`);assertCoverage("Itens ativos",items,20,20,null);

  console.log("3/3 Finalizando...");
  console.log("\nAuditoria geral PT-BR concluída: cobertura principal validada.");
}
main().catch(e=>{console.error("\nFalha na auditoria geral PT-BR:");console.error(e instanceof Error?e.message:e);process.exitCode=1;});
