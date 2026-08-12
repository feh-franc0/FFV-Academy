import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * Revalidação sob demanda de uma página de módulo.
 *
 * O problema que isto resolve: `/aprenda/[slug]` tem ISR de 1 hora. Um artigo
 * editado no admin ficava até 60 minutos mostrando a versão antiga — inclusive
 * uma correção de erro factual, que é justamente o caso em que a espera dói.
 * A alternativa era um deploy para propagar uma vírgula.
 *
 * ## Por que autenticar contra o backend, e não com um segredo
 *
 * O editor do admin roda no NAVEGADOR. Qualquer segredo que ele precisasse
 * enviar estaria no bundle, legível por qualquer visitante — ou seja, não seria
 * segredo. Então a rota confere a credencial que o usuário JÁ tem: repassa o
 * token de acesso ao backend e só revalida se ele responder que o portador é
 * admin.
 *
 * Isso mantém uma única fonte de verdade sobre quem é admin (o backend) e evita
 * inventar um segundo mecanismo de autorização que envelheceria em separado.
 *
 * ## Por que autorizar, se revalidar é "inofensivo"
 *
 * Não é. Uma rota aberta permite invalidar as 415 páginas em laço e forçar
 * re-renderização de todas ao mesmo tempo — trabalho de servidor gratuito para
 * quem chama e caro para quem hospeda.
 */

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

/** Slug de módulo: mesma forma aceita pelo currículo. */
const SLUG_VALIDO = /^[a-z0-9][a-z0-9-]{1,80}$/;

interface Corpo {
  slug?: unknown;
}

export async function POST(req: Request) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json(
      { erro: 'Autenticação obrigatória.' },
      { status: 401 },
    );
  }

  if (!API) {
    // Sem backend configurado não há como verificar quem está chamando, e
    // revalidar sem verificar é pior que não revalidar.
    return NextResponse.json(
      { erro: 'API não configurada neste ambiente.' },
      { status: 503 },
    );
  }

  let corpo: Corpo;
  try {
    corpo = (await req.json()) as Corpo;
  } catch {
    return NextResponse.json({ erro: 'Corpo não é JSON válido.' }, { status: 400 });
  }

  const slug = typeof corpo.slug === 'string' ? corpo.slug.trim() : '';
  if (!SLUG_VALIDO.test(slug)) {
    // Sem isto, `slug` controlado pelo chamador entra direto num caminho de
    // revalidação — e `../` ali é caminho arbitrário, não slug.
    return NextResponse.json({ erro: 'Slug inválido.' }, { status: 400 });
  }

  // Quem é o portador do token? A resposta vem do backend, não daqui.
  let perfil: Response;
  try {
    perfil = await fetch(`${API}/api/v1/me`, {
      headers: { Authorization: auth },
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { erro: 'Não foi possível verificar a credencial.' },
      { status: 502 },
    );
  }

  if (!perfil.ok) {
    return NextResponse.json({ erro: 'Credencial recusada.' }, { status: 401 });
  }

  const dados = (await perfil.json()) as { role?: string };
  if (dados.role !== 'admin') {
    return NextResponse.json({ erro: 'Requer perfil admin.' }, { status: 403 });
  }

  revalidatePath(`/aprenda/${slug}`);

  return NextResponse.json({ revalidado: `/aprenda/${slug}` });
}
