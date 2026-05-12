import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, KeyValue, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('figma-to-code-pipeline');

const accent = '#a855f7';

const quiz: QuizQuestion[] = [
  { question: 'Em 2026, "Figma to code" 100% automático é viável para produção?', options: ['Sim, sempre', 'Não — ainda gera código frágil e não-semântico em UIs reais; pipelines sérios usam Figma Variables → tokens sync + designers e devs colaborando em DS compartilhado', 'Apenas em mobile', 'Apenas para landing pages'], correct: 1, explanation: 'Ferramentas como Anima, Builder.io, Locofy melhoraram mas ainda exportam código não-semântico, com hardcoded values, ignorando DS. Útil para protótipo; ruim para prod. O futuro provável: Figma Variables como source-of-truth + tokens.' },
  { question: 'Figma Variables (lançado 2023) servem para:', options: ['Apenas cores', 'Definir tokens nativos no Figma (cor, número, string, boolean), com modes (light/dark, brand A/B), e exportar para Style Dictionary / código. É o "design tokens nativo"', 'Substituir CSS', 'Animação'], correct: 1, explanation: 'Variables + modes destravaram tokens reais no Figma. Antes era plug-in (Tokens Studio); agora é nativo. Export via API + Style Dictionary build → CSS/JS automáticos.' },
  { question: 'MCP Figma server permite ao Claude/Cursor:', options: ['Editar Figma', 'Ler designs do Figma com contexto estruturado (frames, variants, tokens) para gerar código alinhado ao design — sem screenshot OCR; sem copy-paste manual', 'Apenas exportar PNG', 'Não existe'], correct: 1, explanation: 'MCP (Model Context Protocol) Figma server expõe nodes/variables/styles via tool calls. Claude Code / Cursor consomem direto — pedem "implemente este frame" sem você descrever. Lançou em 2024 e virou padrão em 2025-2026.' },
  { question: 'Anima vs Builder.io:', options: ['Idênticos', 'Anima: foco em exportar componentes React/Vue/Angular de frames Figma. Builder.io: visual development platform — designers editam visualmente o produto vivo, sem exportar; também tem AI-assist', 'Anima não existe', 'Builder.io não tem AI'], correct: 1, explanation: 'Anima é "export tool" (Figma → código). Builder.io é "visual CMS" (edita o site direto). Casos de uso distintos: marketing pages dinâmicas vs componentes app.' },
  { question: 'Variables sync com Style Dictionary:', options: ['Não funciona', 'Workflow: Figma Variables → REST API ou plugin → JSON → Style Dictionary → CSS custom properties / TS tokens. Single source of truth no Figma, gera artefatos em build', 'Apenas one-way', 'Substitui código'], correct: 1, explanation: 'Pipeline maduro em 2026. Designer muda token no Figma; PR gerado automaticamente com novo build; CI valida; merge. Times sérios (Stripe, Vercel, Linear) operam assim.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="figma-to-code-pipeline" title="Figma → código: tokens sync, MCP Figma, Anima, Builder.io" icon="🎨" xp={60} readTime={12}
      trailName="Design Systems Engineering" trailColor={accent} quiz={quiz}>
      <Section title="A promessa e a realidade" accent={accent}>
        <p className="text-sm leading-6">A promessa: "designer mexe no Figma, código atualiza sozinho". A realidade em 2026: parcialmente, com pipeline bem desenhado. Componentes 100% automáticos ainda geram código frágil. O que <i>funciona bem</i> é tokens sync e geração assistida via AI com MCP.</p>
      </Section>
      <Section title="Pipeline pragmático" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: '1. Tokens', v: 'Figma Variables como source. Export via Variables API REST.' },
          { k: '2. Build', v: 'Style Dictionary processa JSON → CSS custom props + TS tokens' },
          { k: '3. Componentes', v: 'Implementados manualmente em DS — Figma documenta, código é canonical' },
          { k: '4. AI-assisted', v: 'MCP Figma + Claude/Cursor → gera código novo alinhado ao DS' },
          { k: '5. Visual regression', v: 'Chromatic compara prod vs Figma frames' },
        ]} />
      </Section>
      <Section title="Variables → tokens via API" accent={accent}>
        <CodeBlock lang="typescript">{`// Exporta variables do Figma file
import { figmaToTokens } from '@your-org/figma-tokens-sync';

const tokens = await figmaToTokens({
  fileKey: process.env.FIGMA_FILE_KEY!,
  token: process.env.FIGMA_TOKEN!,
});

// Saída: estrutura compatível Style Dictionary
// {
//   color: { brand: { primary: { value: '#1f2937' } } },
//   spacing: { '4': { value: '16px' } },
// }
fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));

// Build via Style Dictionary
// Saída: CSS custom properties + TS tokens types`}</CodeBlock>
      </Section>
      <Section title="MCP Figma — Claude lê design" accent={accent}>
        <CodeBlock lang="bash">{`# Instalar MCP server Figma
claude mcp add figma --command npx --args -y @figma/mcp-server

# No prompt:
> Implemente o frame "Login Form" do Figma file abc123 usando nosso DS Button e Input`}</CodeBlock>
        <Callout tone="info">Claude vê estrutura do frame (nodes, layout, variants), tokens aplicados — gera código semântico usando seu DS.</Callout>
      </Section>
      <Section title="Ferramentas comparadas" accent={accent}>
        <ComparisonTable accent={accent} headers={['Tool', 'Foco', 'Quando usar']} rows={[
          ['Figma Variables nativo', 'Tokens', 'Sempre — fundação'],
          ['Style Dictionary', 'Tokens build', 'Padrão indústria'],
          ['Tokens Studio (plugin)', 'Tokens avançados (pré-Variables)', 'Legado, ou casos avançados'],
          ['Anima', 'Frame → React/Vue/Angular', 'Protótipo, landing'],
          ['Builder.io', 'Visual CMS + AI', 'Marketing pages dinâmicas'],
          ['Locofy', 'Frame → código + lógica', 'POC'],
          ['MCP Figma + Claude/Cursor', 'AI gera código alinhado', '2026 padrão para componentes novos'],
        ]} />
      </Section>
      <Callout tone="success" icon="🎓">Trilha Design Systems Engineering concluída. Badge <b>DS Architect</b> desbloqueado.</Callout>
    </ModuleLayout>
  );
}
