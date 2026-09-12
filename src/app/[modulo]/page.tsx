import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ModulePlaceholder, type ModuleFeature } from "@/components/module-placeholder";

type ModuleConfig = {
  eyebrow: string;
  title: string;
  description: string;
  status?: string;
  features: ModuleFeature[];
  primaryAction?: { href: string; label: string };
};

const moduleConfigs: Record<string, ModuleConfig> = {
  mapa: {
    eyebrow: "Exploração",
    title: "Mapa interativo",
    description:
      "Base para explorar regiões, habitats, pontos de interesse e informações úteis do mundo de Aniimo.",
    features: [
      { title: "Regiões", description: "Organizar áreas e subáreas do mapa com navegação clara." },
      { title: "Habitats", description: "Relacionar Aniimos às regiões oficiais cadastradas no banco." },
      { title: "Filtros", description: "Filtrar pontos do mapa por categoria, região e tipo de conteúdo." },
      { title: "Pontos de interesse", description: "Preparar marcadores para recursos, NPCs e locais importantes." },
      { title: "Busca", description: "Localizar rapidamente regiões, Aniimos e outros pontos cadastrados." },
      { title: "Dados oficiais", description: "Manter cada informação vinculada à sua fonte e verificação." },
    ],
    primaryAction: { href: "/aniimos", label: "Explorar catálogo" },
  },
  itens: {
    eyebrow: "Base de dados",
    title: "Itens",
    description:
      "Catálogo preparado para reunir itens, categorias, efeitos, obtenção e relações com outros conteúdos do jogo.",
    features: [
      { title: "Catálogo", description: "Listar itens com busca, filtros e categorias." },
      { title: "Detalhes", description: "Página individual para descrição, efeito e fonte oficial." },
      { title: "Obtenção", description: "Relacionar cada item aos locais ou atividades em que pode ser obtido." },
      { title: "Categorias", description: "Separar materiais, consumíveis e demais tipos oficiais." },
      { title: "Relacionamentos", description: "Conectar itens a Aniimos, regiões e sistemas quando aplicável." },
      { title: "Histórico", description: "Preparar o módulo para mudanças futuras em patches." },
    ],
  },
  colecao: {
    eyebrow: "Ferramenta",
    title: "Minha coleção",
    description:
      "Área pessoal para marcar Aniimos e formas, acompanhar progresso e visualizar o que ainda falta encontrar.",
    status: "Requer autenticação",
    features: [
      { title: "Checklist", description: "Marcar Aniimos e formas adicionados à coleção." },
      { title: "Progresso", description: "Exibir totais e percentual de conclusão da coleção." },
      { title: "Filtros", description: "Separar obtidos, pendentes, função, elemento e estágio." },
      { title: "Formas", description: "Controlar progresso por forma, não apenas por espécie." },
      { title: "Conta do usuário", description: "Salvar a coleção vinculada ao perfil autenticado." },
      { title: "Sincronização", description: "Preparar persistência para acesso em diferentes dispositivos." },
    ],
  },
  times: {
    eyebrow: "Ferramenta",
    title: "Montador de times",
    description:
      "Estrutura para montar composições, organizar funções e comparar opções usando os dados do catálogo.",
    features: [
      { title: "Slots do time", description: "Selecionar Aniimos e formas para uma composição." },
      { title: "Funções", description: "Visualizar DPS, Heal, Support, BREAK e REGEN no conjunto." },
      { title: "Elementos", description: "Analisar a distribuição elemental da composição." },
      { title: "Atributos", description: "Usar dados cadastrados para apoiar comparações." },
      { title: "Salvar times", description: "Persistir composições no perfil do usuário futuramente." },
      { title: "Compartilhar", description: "Preparar links públicos de composições quando o módulo estiver maduro." },
    ],
    primaryAction: { href: "/aniimos", label: "Consultar Aniimos" },
  },
  "tier-list": {
    eyebrow: "Comunidade",
    title: "Tier List",
    description:
      "Base para classificações, listas pessoais e votação da comunidade sem misturar opinião com dados oficiais.",
    features: [
      { title: "Tier comunitária", description: "Calcular rankings a partir de votos quando o sistema estiver disponível." },
      { title: "Listas pessoais", description: "Permitir que usuários montem classificações próprias." },
      { title: "Categorias", description: "Separar rankings por função, contexto ou atualização." },
      { title: "Versões", description: "Relacionar tier lists a períodos ou patches específicos." },
      { title: "Transparência", description: "Distinguir claramente dados oficiais de opinião da comunidade." },
      { title: "Compartilhamento", description: "Gerar visualizações fáceis de compartilhar futuramente." },
    ],
  },
  conquistas: {
    eyebrow: "Progresso",
    title: "Conquistas",
    description:
      "Área preparada para organizar conquistas, requisitos, progresso e objetivos pessoais do usuário.",
    features: [
      { title: "Lista de conquistas", description: "Organizar conquistas por categoria e status." },
      { title: "Requisitos", description: "Exibir condições conhecidas com referência às fontes." },
      { title: "Progresso pessoal", description: "Permitir marcar conquistas concluídas." },
      { title: "Filtros", description: "Separar concluídas, pendentes e categorias." },
      { title: "Perfil", description: "Relacionar progresso à conta autenticada." },
      { title: "Atualizações", description: "Preparar a estrutura para novas conquistas em patches futuros." },
    ],
  },
  codigos: {
    eyebrow: "Utilidade",
    title: "Códigos",
    description:
      "Página para reunir códigos divulgados oficialmente, recompensas, validade e situação de cada código.",
    features: [
      { title: "Códigos ativos", description: "Destacar códigos ainda válidos e confirmados." },
      { title: "Expirados", description: "Manter histórico sem confundir códigos antigos com ativos." },
      { title: "Recompensas", description: "Exibir recompensas somente quando houver informação confiável." },
      { title: "Fonte", description: "Registrar onde e quando cada código foi divulgado." },
      { title: "Validade", description: "Informar datas quando forem oficialmente conhecidas." },
      { title: "Copiar código", description: "Adicionar ação rápida de cópia na implementação funcional." },
    ],
  },
  guias: {
    eyebrow: "Conteúdo",
    title: "Guias e atualizações",
    description:
      "Espaço editorial para guias, explicações, notícias relevantes e notas de atualização em português.",
    features: [
      { title: "Guias", description: "Conteúdo organizado por assunto e nível de experiência." },
      { title: "Patch notes", description: "Resumir mudanças oficiais mantendo ligação com a fonte original." },
      { title: "Histórico de mudanças", description: "Aproveitar o banco para mostrar buffs e nerfs ao longo do tempo." },
      { title: "Busca", description: "Encontrar artigos por Aniimo, sistema ou atualização." },
      { title: "Categorias", description: "Separar guias, notícias, sistemas e atualizações." },
      { title: "Fontes", description: "Manter referências oficiais visíveis no conteúdo informativo." },
    ],
  },
  comunidade: {
    eyebrow: "Comunidade",
    title: "Comunidade Aniimo Brasil",
    description:
      "Estrutura inicial para reunir perfis, contribuições, listas e ferramentas sociais da comunidade brasileira.",
    status: "Planejamento",
    features: [
      { title: "Perfis públicos", description: "Exibir informações que o próprio usuário escolher compartilhar." },
      { title: "Contribuições", description: "Preparar espaço para conteúdo e colaboração moderada." },
      { title: "Times e listas", description: "Relacionar composições e tier lists públicas aos perfis." },
      { title: "Moderação", description: "Planejar regras e controles antes de liberar interação social." },
      { title: "Privacidade", description: "Separar informações públicas de dados privados da conta." },
      { title: "Identidade brasileira", description: "Criar um espaço útil para jogadores em português." },
    ],
  },
  perfil: {
    eyebrow: "Conta",
    title: "Meu perfil",
    description:
      "Área que futuramente concentrará autenticação, coleção, times, conquistas e preferências do usuário.",
    status: "Requer autenticação",
    features: [
      { title: "Dados da conta", description: "Gerenciar informações básicas da conta autenticada." },
      { title: "Minha coleção", description: "Acessar rapidamente o progresso dos Aniimos." },
      { title: "Meus times", description: "Reunir composições salvas pelo usuário." },
      { title: "Minhas conquistas", description: "Acompanhar objetivos concluídos e pendentes." },
      { title: "Preferências", description: "Guardar configurações como tema claro ou escuro." },
      { title: "Privacidade", description: "Definir o que pode ou não aparecer publicamente." },
    ],
  },
};

type ModulePageProps = {
  params: Promise<{ modulo: string }>;
};

export function generateStaticParams() {
  return Object.keys(moduleConfigs).map((modulo) => ({ modulo }));
}

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { modulo } = await params;
  const config = moduleConfigs[modulo];

  if (!config) return {};

  return {
    title: config.title,
    description: config.description,
  };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { modulo } = await params;
  const config = moduleConfigs[modulo];

  if (!config) notFound();

  return <ModulePlaceholder {...config} />;
}
