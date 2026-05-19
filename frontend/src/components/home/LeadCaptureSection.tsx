'use client';

import { useState } from 'react';

import { StudyRequestForm } from './StudyRequestForm';

// LeadCaptureSection — reescrita para o pivot 2026-05.
//
// Antes: card de cadastro magic-link para devs ("crie sua conta grátis").
// Depois: formulário completo de solicitação de experiência de estudo
// personalizada, focado em estudantes de qualquer área.
//
// O storytelling do lado esquerdo explica o problema (estudo desorganizado),
// e o lado direito é o formulário (StudyRequestForm.tsx) — multipart com
// upload opcional, conectado ao backend Go via lib/study-request-api.ts.

const BENEFITS = [
  {
    icon: '🎯',
    title: 'Trilha feita para o seu objetivo',
    desc: 'Diga o que precisa estudar — prova, concurso, faculdade, carreira — e montamos a sequência que faz sentido pra você.',
  },
  {
    icon: '📎',
    title: 'Use os materiais que você já tem',
    desc: 'Envie PDFs, slides, apostilas ou prints. Vamos partir do conteúdo da sua faculdade ou do seu curso — não de algo genérico.',
  },
  {
    icon: '🧩',
    title: 'Mais que texto: módulos, questões, prática',
    desc: 'Não é um chatbot que cospe parágrafos. Entregamos uma experiência organizada com módulos sequenciais, quizzes e revisão.',
  },
  {
    icon: '🆓',
    title: 'Gratuito enquanto criamos juntos',
    desc: 'Sua solicitação vira combustível pra plataforma evoluir. Você ganha a trilha personalizada; a gente aprende com você.',
  },
];

export function LeadCaptureSection() {
  // Anchor pra CTA externo (botão "Solicitar minha experiência" em outras seções).
  const [scrollKey] = useState(0);
  void scrollKey; // placeholder pra futuras integrações de re-foco no form

  return (
    <section
      id="solicitar-experiencia"
      className="px-6 py-20 relative overflow-hidden"
      style={{ borderTop: '1px solid var(--ffv-border)' }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 80% 50%, color-mix(in srgb, var(--ffv-blue) 6%, transparent) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr,0.9fr] gap-16 items-start">
        {/* ── Lado esquerdo: storytelling ─────────────────────────── */}
        <div>
          <p
            className="font-mono uppercase tracking-widest text-xs mb-4"
            style={{ color: 'var(--ffv-blue)', letterSpacing: '0.12em' }}
          >
            Por que isso importa pra você
          </p>

          <h2
            style={{
              fontSize: 'var(--text-4xl-r)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: 20,
            }}
          >
            Você não precisa estudar com{' '}
            <span style={{ color: 'var(--ffv-blue)' }}>materiais soltos e bagunçados.</span>
          </h2>

          <div
            className="space-y-4 text-sm"
            style={{ color: 'var(--ffv-muted)', lineHeight: 1.75, maxWidth: 560 }}
          >
            <p>
              Faculdade, cursinho, curso livre, concurso — em todos eles você acaba com PDFs, slides,
              vídeos e listas de exercícios espalhados. O conteúdo existe, mas a{' '}
              <strong style={{ color: 'var(--foreground)' }}>experiência de aprender</strong> não.
            </p>
            <p>
              Nós transformamos o seu material e o seu objetivo em uma jornada estruturada — com
              módulos, questões, exemplos e revisão — para qualquer área de estudo.
            </p>
            <p>
              Medicina Veterinária, Engenharia, Direito, Administração, Tecnologia, concursos,
              faculdade em geral. Se você consegue dizer{' '}
              <strong style={{ color: 'var(--foreground)' }}>o que precisa estudar</strong>, a gente
              monta o caminho.
            </p>
          </div>

          {/* Benefits */}
          <ul className="mt-8 space-y-4">
            {BENEFITS.map(b => (
              <li key={b.icon} className="flex items-start gap-3">
                <span className="text-xl mt-0.5 shrink-0">{b.icon}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    {b.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
                    {b.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Lado direito: formulário ─────────────────── */}
        <div className="lg:sticky lg:top-24">
          <StudyRequestForm />
        </div>
      </div>
    </section>
  );
}
