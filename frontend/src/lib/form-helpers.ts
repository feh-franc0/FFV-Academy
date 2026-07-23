/**
 * form-helpers — utilitários compartilhados de formulário.
 *
 * Mantém a lógica fora dos componentes pra ser unit-testável e reusada
 * entre StudyRequestForm e (futuro) ProfilePreferencesForm.
 */

/**
 * Aplica máscara de telefone brasileiro: (XX) XXXXX-XXXX para celular,
 * (XX) XXXX-XXXX para fixo. Aceita qualquer input e formata pelo número
 * de dígitos extraídos.
 *
 * Ex.: '11987654321' → '(11) 98765-4321'
 *      '1133334444'  → '(11) 3333-4444'
 *      '119'         → '(11) 9'
 *      ''            → ''
 */
export function maskBrazilianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // 11 dígitos → celular
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Extrai só os dígitos do telefone formatado (envia limpo pro backend). */
export function unmaskPhone(formatted: string): string {
  return formatted.replace(/\D/g, '');
}

/**
 * Detecta typos comuns de domínio de email e sugere a correção mais próxima.
 *
 * Usa lista curada dos provedores brasileiros mais comuns. Não é IA — é
 * tabela de distância de Levenshtein implícita pelos misspellings frequentes.
 *
 * Retorna null se não detectou typo. Retorna o email sugerido se detectou.
 */
const COMMON_DOMAINS = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com.br',
  'yahoo.com',
  'icloud.com',
  'live.com',
  'bol.com.br',
  'uol.com.br',
  'protonmail.com',
  'edu.br',
  'usp.br',
  'unicamp.br',
  'ufmg.br',
];

const COMMON_TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotnail.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloook.com': 'outlook.com',
  'yaho.com.br': 'yahoo.com.br',
  'yaho.com': 'yahoo.com',
  'icloid.com': 'icloud.com',
};

export function suggestEmailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf('@');
  if (at < 1 || at === trimmed.length - 1) return null;

  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);

  // Tabela exata de typos
  if (COMMON_TYPOS[domain]) return `${local}@${COMMON_TYPOS[domain]}`;

  // Distância de Levenshtein 1 para domínios comuns
  for (const candidate of COMMON_DOMAINS) {
    if (domain === candidate) return null; // já está certo
    if (levenshtein(domain, candidate) === 1) return `${local}@${candidate}`;
  }

  return null;
}

/** Levenshtein simples — só pra distância 1 com early exit. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 1) return 2; // early exit, só queremos dist=1
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  let curr: number[] = new Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost,
      );
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    // Early exit: se a melhor linha já passou de 1, dá pra parar
    if (rowMin > 1) return 2;
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}
