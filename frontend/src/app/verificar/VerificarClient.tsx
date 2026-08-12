'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getCertificateLocal } from '@/lib/certificates';

/**
 * Shape local do resultado de verificação.
 *
 * `score` segue OPCIONAL mesmo depois de o backend passar a expô-lo (ago/2026,
 * `CertificateDTO` em handlers/dto.go). O motivo não é mais a ausência do campo,
 * e sim que este cliente conversa com backends de versões diferentes: durante
 * qualquer janela de deploy, ou contra uma instância antiga, a resposta chega
 * sem `score`. Tratar ausência como zero foi o defeito original — fazia um
 * certificado válido de 86% aparecer como 0% para quem estava conferindo o
 * documento de outra pessoa. Ausente e zero são coisas diferentes, e a tela
 * simplesmente omite a linha quando não sabe.
 */
interface RegistroVerificado {
  hash: string;
  simuladoId: string;
  score?: number;
  name: string;
  issuedAt: string;
}
import { getSimulado } from '@/lib/simulados';

/**
 * Verificação de certificado.
 *
 * Três defeitos que esta versão corrige:
 *
 * 1. NÃO HAVIA CAMPO. A página — linkada no footer — dizia "informe o hash do
 *    certificado na URL: /verificar?h=HASH". A instrução para o usuário final era
 *    montar uma query string à mão. O conteúdo visível inteiro tinha 118
 *    caracteres.
 *
 * 2. ERRO DE REDE VIRAVA "CERTIFICADO INVÁLIDO". O `.catch(() => {})` engolia a
 *    falha e caía no mesmo estado de "não encontrado". Ou seja: com o servidor
 *    fora, a página afirmava que um certificado legítimo não constava. Dizer que
 *    o documento de alguém é inválido quando você só não conseguiu checar é o
 *    pior erro possível numa tela de verificação.
 *
 * 3. AVISO OBSOLETO. Exibia "quando tivermos backend, a verificação será global"
 *    — mas a consulta ao backend já estava implementada logo acima.
 *
 * Agora são cinco estados distintos e nomeados, e cada um diz a verdade:
 * `vazio`, `verificando`, `valido`, `nao-encontrado`, `indisponivel`.
 */

type Estado =
  | { tipo: 'vazio' }
  | { tipo: 'verificando' }
  | { tipo: 'valido'; registro: RegistroVerificado }
  | { tipo: 'nao-encontrado'; hash: string; apenasLocal: boolean }
  | { tipo: 'indisponivel'; hash: string };

const FORMATO_HASH = /^[a-f0-9]{16,128}$/;

export function VerificarClient() {
  const [entrada, setEntrada] = useState('');
  const [erroFormato, setErroFormato] = useState<string | null>(null);
  const [estado, setEstado] = useState<Estado>({ tipo: 'vazio' });
  const campoRef = useRef<HTMLInputElement>(null);

  const verificar = useCallback(async (bruto: string, atualizarUrl: boolean) => {
    const hash = bruto.trim().toLowerCase();

    if (!hash) {
      setErroFormato('Cole o código do certificado para verificar.');
      campoRef.current?.focus();
      return;
    }
    if (!FORMATO_HASH.test(hash)) {
      setErroFormato(
        'O código deve ter entre 16 e 128 caracteres, usando apenas números e as letras de a a f.',
      );
      campoRef.current?.focus();
      return;
    }

    setErroFormato(null);
    setEstado({ tipo: 'verificando' });

    if (atualizarUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('h', hash);
      window.history.replaceState(null, '', url);
    }

    // 1. Certificado emitido neste dispositivo — resposta imediata, sem rede.
    const local = getCertificateLocal(hash);
    if (local) {
      setEstado({ tipo: 'valido', registro: local });
      return;
    }

    // 2. Consulta o registro público no backend.
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
    if (!apiBase) {
      // Sem backend configurado só é possível afirmar sobre este dispositivo.
      setEstado({ tipo: 'nao-encontrado', hash, apenasLocal: true });
      return;
    }

    try {
      const resp = await fetch(
        `${apiBase}/api/v1/certificates/${encodeURIComponent(hash)}`,
      );

      if (resp.status === 404) {
        setEstado({ tipo: 'nao-encontrado', hash, apenasLocal: false });
        return;
      }
      if (!resp.ok) {
        // 5xx e afins: o servidor respondeu, mas não com um veredito.
        setEstado({ tipo: 'indisponivel', hash });
        return;
      }

      const json = await resp.json();
      setEstado({
        tipo: 'valido',
        registro: {
          hash: json.hash ?? hash,
          // campos como o Go realmente serializa (CertificateDTO): camelCase,
          // titular em `holderName`. Os aliases cobrem versões antigas do DTO.
          simuladoId: json.simuladoId ?? json.simulado_id ?? '',
          score: typeof json.score === 'number' ? json.score : undefined,
          name: json.holderName ?? json.student_name ?? json.name ?? 'Anônimo',
          issuedAt: json.issuedAt ?? json.issued_at ?? '',
        },
      });
    } catch {
      // Rede fora, DNS, timeout: NÃO é "certificado inválido". É "não deu para
      // verificar" — e a diferença importa para quem depende deste documento.
      setEstado({ tipo: 'indisponivel', hash });
    }
  }, []);

  // Link compartilhado com ?h=... verifica sozinho ao abrir.
  useEffect(() => {
    const h = new URLSearchParams(window.location.search).get('h');
    if (h) {
      setEntrada(h);
      void verificar(h, false);
    }
  }, [verificar]);

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <nav className="mb-8 text-xs" style={{ color: 'var(--ffv-muted)' }}>
        <Link
          href="/"
          className="inline-flex min-h-[24px] items-center"
          style={{ color: 'var(--ffv-muted)' }}
        >
          FFV Academy
        </Link>
        <span className="mx-1" aria-hidden="true">/</span>
        <span style={{ color: 'var(--foreground)' }}>Verificar certificado</span>
      </nav>

      <h1 className="mb-2 text-2xl font-bold">Verificação de certificado</h1>
      <p className="mb-8 text-sm" style={{ color: 'var(--ffv-muted)' }}>
        Cole o código que aparece no rodapé do certificado para confirmar que ele
        foi emitido pela FFV Academy.
      </p>

      <form
        onSubmit={e => {
          e.preventDefault();
          void verificar(entrada, true);
        }}
        className="mb-8"
      >
        <label htmlFor="hash-certificado" className="mb-2 block text-sm font-semibold">
          Código do certificado
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="hash-certificado"
            ref={campoRef}
            value={entrada}
            onChange={e => {
              setEntrada(e.target.value);
              if (erroFormato) setErroFormato(null);
            }}
            placeholder="ex: 4f3a9c1e8b7d2065…"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!!erroFormato}
            aria-describedby={erroFormato ? 'erro-hash' : 'dica-hash'}
            className="min-w-0 flex-1 rounded-lg px-3 py-2.5 font-mono text-sm"
            style={{
              background: 'var(--ffv-bg2)',
              border: `1px solid ${erroFormato ? 'var(--ffv-red, #f78166)' : 'var(--ffv-border)'}`,
              color: 'var(--foreground)',
            }}
          />
          <button
            type="submit"
            disabled={estado.tipo === 'verificando'}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
            style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)' }}
          >
            {estado.tipo === 'verificando' ? 'Verificando…' : 'Verificar'}
          </button>
        </div>

        {erroFormato ? (
          <p id="erro-hash" role="alert" className="mt-2 text-xs" style={{ color: 'var(--ffv-red, #f78166)' }}>
            {erroFormato}
          </p>
        ) : (
          <p id="dica-hash" className="mt-2 text-xs" style={{ color: 'var(--ffv-muted)' }}>
            O código está impresso no rodapé do PDF, ao lado do QR code.
          </p>
        )}
      </form>

      {/* aria-live: o resultado chega depois da ação, e o leitor de tela precisa saber */}
      <div aria-live="polite">
        {estado.tipo === 'verificando' && (
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            Consultando o registro…
          </p>
        )}

        {estado.tipo === 'valido' && (
          <section
            className="rounded-xl p-6"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(63,185,80,0.35)' }}
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="text-3xl" aria-hidden="true">✅</span>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--ffv-green)' }}>
                  Certificado válido
                </p>
                <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                  Emitido pela FFV Academy
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <dt style={{ color: 'var(--ffv-muted)' }}>Titular</dt>
              <dd>{estado.registro.name}</dd>
              <dt style={{ color: 'var(--ffv-muted)' }}>Certificação</dt>
              <dd>
                {getSimulado(estado.registro.simuladoId)?.certification ??
                  estado.registro.simuladoId}
              </dd>
              {typeof estado.registro.score === 'number' && (
                <>
                  <dt style={{ color: 'var(--ffv-muted)' }}>Pontuação</dt>
                  <dd>{estado.registro.score}%</dd>
                </>
              )}
              <dt style={{ color: 'var(--ffv-muted)' }}>Emitido em</dt>
              <dd>
                {estado.registro.issuedAt
                  ? new Date(estado.registro.issuedAt).toLocaleDateString('pt-BR')
                  : '—'}
              </dd>
            </dl>
          </section>
        )}

        {estado.tipo === 'nao-encontrado' && (
          <section
            className="rounded-xl p-6"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(247,129,102,0.35)' }}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl" aria-hidden="true">⚠️</span>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--ffv-red)' }}>
                  Certificado não encontrado
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--ffv-muted)' }}>
                  {estado.apenasLocal
                    ? 'Não foi possível consultar o registro central agora, e este código não consta neste dispositivo. Tente de novo em alguns minutos antes de concluir que o certificado é inválido.'
                    : 'Este código não consta no registro da FFV Academy. Confira se ele foi copiado por inteiro — o código é longo e é comum faltar o final.'}
                </p>
              </div>
            </div>
          </section>
        )}

        {estado.tipo === 'indisponivel' && (
          <section
            className="rounded-xl p-6"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(210,153,34,0.4)' }}
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="text-3xl" aria-hidden="true">🔌</span>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--ffv-yellow, #d29922)' }}>
                  Não foi possível verificar agora
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--ffv-muted)' }}>
                  Não conseguimos falar com o servidor de certificados. Isso{' '}
                  <strong>não</strong> quer dizer que o certificado é inválido — quer
                  dizer que a checagem não aconteceu.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void verificar(estado.hash, false)}
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
            >
              Tentar novamente
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
