#!/usr/bin/env python3
"""Gera artigos Next.js a partir de CURRICULUM para slugs sem page.tsx."""
import re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(ROOT, 'src/lib/curriculum.ts')) as f:
    content = f.read()

# Parse trails (id, name, color)
trail_meta_pat = re.compile(
    r"id:\s*'(trail\d+)',\s*name:\s*'([^']+)',\s*\n?\s*color:\s*'([^']+)'"
)
trails = {}
for m in trail_meta_pat.finditer(content):
    trails[m.group(1)] = {'name': m.group(2), 'color': m.group(3), 'start': m.start()}

# Determine trail for each position
sorted_trails = sorted(trails.items(), key=lambda kv: kv[1]['start'])
def trail_id_for(pos):
    current = None
    for tid, meta in sorted_trails:
        if meta['start'] <= pos:
            current = tid
        else:
            break
    return current

# Parse modules
mod_pat = re.compile(
    r"\{\s*slug:\s*'([^']+)',\s*title:\s*'([^']+)',\s*icon:\s*'([^']+)',\s*xp:\s*(\d+),\s*readTime:\s*(\d+),\s*desc:\s*'([^']*)',\s*seoDesc:\s*'([^']*)',\s*keywords:\s*'([^']*)'([^}]*)\}"
)
slug_to_title = {}
modules = []
for m in mod_pat.finditer(content):
    pos = m.start()
    tid = trail_id_for(pos)
    if tid is None: continue
    rest = m.group(9)
    next_slugs = re.findall(r"'([^']+)'", re.search(r"nextSuggested:\s*\[([^\]]*)\]", rest).group(1)) if re.search(r"nextSuggested:\s*\[", rest) else []
    mod = {
        'trail_id': tid,
        'slug': m.group(1), 'title': m.group(2), 'icon': m.group(3),
        'xp': int(m.group(4)), 'readTime': int(m.group(5)),
        'desc': m.group(6), 'seoDesc': m.group(7), 'keywords': m.group(8),
        'next': next_slugs,
    }
    modules.append(mod)
    slug_to_title[mod['slug']] = mod['title']

def jss(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

def make_page(m):
    t = trails[m['trail_id']]
    desc = m['desc']
    # Split desc into parts for sections
    parts = re.split(r'(?<=[.!?])\s+', desc)
    third = max(1, len(parts) // 3)
    s1 = ' '.join(parts[:third])
    s2 = ' '.join(parts[third:2*third]) if len(parts) > third else 'Detalhes técnicos adicionais estão nas referências do módulo.'
    s3 = ' '.join(parts[2*third:]) if len(parts) > 2*third else 'Aplicação prática: integrar este módulo com o próximo na trilha e revisitar quando encontrar problemas reais.'
    kws = m['keywords']

    correct_opt = (desc[:200] + '...') if len(desc) > 200 else desc
    correct_context = f'Aplicar quando o problema casar com as palavras-chave do módulo ({kws}); fora desse contexto, soluções mais simples servem melhor'

    next_prop = ''
    if m['next']:
        n = m['next'][0]
        nt = slug_to_title.get(n, n)
        next_prop = f'\n      nextSlug="{jss(n)}"\n      nextTitle="{jss(nt)}"'

    return f"""import {{ getModuleMetadata }} from '@/lib/metadata';
import {{ ModuleLayout }} from '@/components/ModuleLayout';
import type {{ QuizQuestion }} from '@/components/ModuleLayout';
import {{ Section, Callout }} from '@/components/article/primitives';

export const metadata = getModuleMetadata('{m['slug']}');
const accent = '{t['color']}';

const quiz: QuizQuestion[] = [
  {{
    question: 'Qual o ponto central de "{jss(m['title'])}"?',
    options: [
      'Apenas detalhe de implementação — pouco relevante',
      '{jss(correct_opt)}',
      'Moda passageira sem aplicação em produção',
      'Receita universal que resolve todo problema',
    ],
    correct: 1,
    explanation: '{jss(desc)} Este é o núcleo pedagógico do módulo.',
  }},
  {{
    question: 'Qual é o anti-pattern mais comum relacionado a este tema?',
    options: [
      'Seguir especificação à risca sem desvios',
      'Copiar receita sem entender contexto, otimizar cedo sem medir, ou ignorar trade-offs reais — os três canônicos em engenharia sênior',
      'Documentar demais',
      'Estudar fundamentos antes de implementar',
    ],
    correct: 1,
    explanation: 'Engenharia sênior é sobre decisão consciente baseada em restrições reais, não receita mágica. O módulo destaca os cuidados específicos do tema. Medir antes de otimizar, conhecer o contexto antes de copiar padrão.',
  }},
  {{
    question: 'Quando aplicar o conteúdo deste módulo em produção?',
    options: [
      'Nunca — é só acadêmico',
      '{jss(correct_context)}',
      'Sempre, independente do contexto',
      'Apenas em projetos greenfield sem legado',
    ],
    correct: 1,
    explanation: 'Aplicação real casa características do problema com a ferramenta/técnica do módulo. Palavras-chave ({jss(kws)}) indicam quando o tema é relevante. Fora desse contexto, complexidade extra custa sem ganho.',
  }},
];

export default function Page() {{
  return (
    <ModuleLayout
      slug="{m['slug']}"
      title="{jss(m['title'])}"
      icon="{m['icon']}"
      xp={{{m['xp']}}}
      readTime={{{m['readTime']}}}
      trailName="{jss(t['name'])}"
      trailColor={{accent}}{next_prop}
      quiz={{quiz}}
    >
      <Section title="Mental model" accent={{accent}}>
        <p>{jss(s1)}</p>
      </Section>

      <Section title="Em detalhes técnicos" accent={{accent}}>
        <p>{jss(s2)}</p>
        <p>
          <strong>Palavras-chave do módulo:</strong> {jss(kws)}.
        </p>
      </Section>

      <Section title="Take-aways" accent={{accent}}>
        <p>{jss(s3)}</p>
        <Callout tone="success" icon="✅">
          {jss(m['seoDesc'])}
        </Callout>
      </Section>
    </ModuleLayout>
  );
}}
"""

aprenda = os.path.join(ROOT, 'src/app/aprenda')
created = 0
for m in modules:
    path = os.path.join(aprenda, m['slug'], 'page.tsx')
    if os.path.exists(path):
        continue
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(make_page(m))
    created += 1

print(f"Criados: {created}")
