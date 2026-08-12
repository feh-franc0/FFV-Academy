/**
 * readableTextColor — escolhe o par de texto legível para um fundo de cor
 * ARBITRÁRIA (dado de conteúdo: `trail.color`, `cert.color`, `hub.color`),
 * não uma variável de tema.
 *
 * Por que não `var(--primary-foreground)`: aquele token é pensado para pares
 * com `var(--ffv-blue)`/`--ffv-red`/etc., que TROCAM de valor por tema (claro
 * vs escuro) — o token troca junto e o par continua legível nos dois. As
 * cores de trilha/hub/certificação em `curriculum/trails/*.ts`,
 * `curriculum/hubs.ts` e `cert-prep.ts` são hex FIXOS (mesmo valor nos dois
 * temas), então a mesma lógica não vale: medido em 11/ago/2026, seis delas
 * (`#336791`, `#146eb4`, `#3776ab`, `#326ce5`, `#1f6feb`, `#3178c6` — azuis de
 * marca como Postgres/AWS/Python/K8s) medem abaixo de 4,5:1 com texto ESCURO
 * fixo, embora a maioria das ~30 cores da paleta prefira texto escuro.
 *
 * A fórmula de luminância é a mesma de `paleta-contraste.test.ts` — mantida
 * em dois lugares porque um é teste (Node, sem import de app code) e o outro
 * é runtime de componente; divergir a fórmula seria pior que duplicá-la.
 */

const DARK = '#0d1117';
const LIGHT = '#ffffff';

function luminancia(hex: string): number {
  const h = hex.replace('#', '');
  const canal = (i: number) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4);
}

function razao(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/**
 * Retorna `#0d1117` (escuro) ou `#ffffff` (claro) — o que tiver MAIOR
 * contraste contra `bgHex`. Hex inválido (ex.: veio vazio de um dado
 * incompleto) cai para escuro, o padrão mais seguro contra a paleta atual.
 */
export function readableTextColor(bgHex: string): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(bgHex)) return DARK;
  const contrasteEscuro = razao(bgHex, DARK);
  const contrasteClaro = razao(bgHex, LIGHT);
  return contrasteEscuro >= contrasteClaro ? DARK : LIGHT;
}
