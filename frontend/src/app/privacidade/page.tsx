import type { Metadata } from 'next';
import Link from 'next/link';
import { BackButton } from '@/components/BackButton';
import { BASE, social } from '@/lib/metadata-social';

/**
 * /privacidade — política de privacidade.
 *
 * Existia um link para esta rota dentro do checkbox de consentimento de e-mail
 * marketing do LoginModal, e a rota não existia: o usuário clicava para ler a
 * política no momento exato de entregar o e-mail e tomava 404.
 *
 * O texto abaixo descreve o que o código REALMENTE faz — verificado em
 * api-client.ts (JWT em memória, refresh em cookie httpOnly), engine.ts/
 * AuthProvider (progresso em localStorage/IndexedDB), layout.tsx (Plausible e
 * CSP), leaderboard-api.ts (nome exposto no ranking público) e nos endpoints
 * /api/v1/* consumidos pelo frontend.
 *
 * ⚠️ REVISÃO JURÍDICA PENDENTE. Os campos de identificação do controlador estão
 * marcados com [PREENCHER] — a LGPD exige controlador identificável e canal de
 * contato do titular, e isso não é dado que eu possa inventar. Publicar com os
 * marcadores é pior do que não publicar: preencha antes de subir para produção.
 */

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Quais dados a FFV Academy coleta, por quê, com quem compartilha, por quanto tempo guarda e quais são os seus direitos como titular.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/privacidade` },
  ...social({ titulo: `Política de Privacidade — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/privacidade' }),
  title: 'Política de Privacidade',
  description: DESCRICAO_CARTAO,
};

const ATUALIZADO = '29 de julho de 2026';

function Secao({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 scroll-mt-24" aria-labelledby={id}>
      <h2 id={id} className="text-xl font-bold">
        {titulo}
      </h2>
      <div className="mt-3 space-y-3 text-[0.95rem] leading-relaxed" style={{ color: 'var(--ffv-muted)' }}>
        {children}
      </div>
    </section>
  );
}

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <p className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--ffv-muted)' }}>
        Documento legal
      </p>
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Política de Privacidade</h1>
      <p className="mt-3 text-sm" style={{ color: 'var(--ffv-muted)' }}>
        Última atualização: {ATUALIZADO}
      </p>

      <div
        className="mt-8 rounded-2xl p-4 text-[0.9rem] leading-relaxed"
        style={{
          background: 'color-mix(in srgb, var(--ffv-blue) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--ffv-blue) 28%, transparent)',
        }}
      >
        <strong>Resumo honesto:</strong> a FFV Academy é gratuita e não vive de vender
        dado. Você pode usar a plataforma inteira <em>sem criar conta</em> — nesse
        caso o seu progresso fica só no seu navegador e nada é enviado para
        servidor nenhum. Conta existe para sincronizar entre dispositivos e
        aparecer no ranking. Não usamos cookie de rastreamento publicitário.
      </div>

      <Secao id="controlador" titulo="1. Quem é o controlador">
        <p>
          A FFV Academy é operada por <strong>[PREENCHER: nome/razão social]</strong>,
          inscrito sob <strong>[PREENCHER: CPF/CNPJ]</strong>, com contato em{' '}
          <strong>[PREENCHER: e-mail do encarregado]</strong>. Esse é o canal para
          exercer qualquer direito descrito na seção 7.
        </p>
      </Secao>

      <Secao id="dados" titulo="2. Quais dados coletamos">
        <p>Depende de você ter conta ou não.</p>
        <div tabIndex={0} role="group" aria-label="Tabela de dados coletados, rolável na horizontal" className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ffv-blue)]">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--ffv-bg2)' }}>
                <th className="px-3 py-2 text-left font-semibold" style={{ borderBottom: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}>
                  Dado
                </th>
                <th className="px-3 py-2 text-left font-semibold" style={{ borderBottom: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}>
                  Quando
                </th>
                <th className="px-3 py-2 text-left font-semibold" style={{ borderBottom: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}>
                  Para quê
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['E-mail', 'Ao criar conta', 'Autenticação por link/código mágico. É o identificador da conta.'],
                ['Nome', 'Ao criar conta', 'Exibição no perfil e no ranking público (ver seção 4).'],
                ['Telefone', 'Opcional, ao criar conta', 'Canal alternativo de acesso. Você pode deixar em branco.'],
                ['Progresso de estudo', 'Sempre (local); sincronizado se logado', 'XP, nível, streak, módulos concluídos, respostas de quiz, cartas de revisão espaçada.'],
                ['Preferências', 'Se logado', 'Meta diária, hub preferido, configurações de interface.'],
                ['Resultados de simulado', 'Se logado', 'Histórico de tentativas e emissão de certificado.'],
                ['Comentários', 'Se você escrever um', 'Discussão pública em módulos.'],
                ['Dados de pagamento', 'Só se você comprar algo', 'Processados pela Stripe. Não recebemos nem armazenamos número de cartão.'],
              ].map(([dado, quando, para]) => (
                <tr key={dado}>
                  <td className="px-3 py-2 align-top font-medium" style={{ borderBottom: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}>
                    {dado}
                  </td>
                  <td className="px-3 py-2 align-top" style={{ borderBottom: '1px solid var(--ffv-border)' }}>{quando}</td>
                  <td className="px-3 py-2 align-top" style={{ borderBottom: '1px solid var(--ffv-border)' }}>{para}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          <strong>Sem conta:</strong> o progresso fica exclusivamente no
          armazenamento do seu navegador (<code>localStorage</code> e{' '}
          <code>IndexedDB</code>). Ele não sai do seu dispositivo. Limpar os dados
          do site apaga esse progresso de forma irreversível.
        </p>
      </Secao>

      <Secao id="base-legal" titulo="3. Com que base legal">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Execução de contrato</strong> (art. 7º, V da LGPD) — e-mail,
            nome, progresso e preferências: sem eles não há como entregar conta,
            sincronização e certificado.
          </li>
          <li>
            <strong>Consentimento</strong> (art. 7º, I) — telefone, exibição no
            ranking público e comunicações de novidades por e-mail. Você opta e
            pode revogar.
          </li>
          <li>
            <strong>Legítimo interesse</strong> (art. 7º, IX) — métricas agregadas
            de uso, para saber quais módulos funcionam. Sem perfilamento
            individual.
          </li>
        </ul>
      </Secao>

      <Secao id="ranking" titulo="4. O ranking é público">
        <p>
          Se você tem conta e pontua, <strong>seu nome e seu XP aparecem no
          ranking público</strong> em <Link href="/ranking" style={{ color: 'var(--ffv-blue)' }}>/ranking</Link>,
          visível para qualquer visitante. Isso é parte do desenho da plataforma,
          mas é opcional: se você não quiser aparecer, use a plataforma sem conta,
          ou peça a remoção pelo contato da seção 1.
        </p>
        <p>
          Não publicamos e-mail, telefone nem histórico de respostas de ninguém.
        </p>
      </Secao>

      <Secao id="terceiros" titulo="5. Com quem compartilhamos">
        <p>Não vendemos dado. Os terceiros abaixo são os que efetivamente recebem algo:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Plausible Analytics</strong> — métricas de audiência sem
            cookies e sem identificador individual. Não recebe seu e-mail nem seu
            progresso.
          </li>
          <li>
            <strong>Stripe</strong> — apenas se você fizer uma compra. O pagamento
            acontece na infraestrutura deles; não temos acesso ao cartão.
          </li>
          <li>
            <strong>Google Fonts</strong> — as fontes são servidas pelo Google, que
            recebe o seu IP ao carregá-las, como qualquer requisição HTTP.
          </li>
          <li>
            <strong>Hostinger</strong> — provedor da infraestrutura onde a
            aplicação e o banco rodam. Os servidores estão nos Estados Unidos, o
            que implica transferência internacional de dados (art. 33 da LGPD).
          </li>
        </ul>
      </Secao>

      <Secao id="seguranca" titulo="6. Como protegemos">
        <ul className="list-disc space-y-2 pl-5">
          <li>Todo o tráfego é cifrado em trânsito (HTTPS com HSTS).</li>
          <li>
            Não usamos senha: o acesso é por código enviado ao seu e-mail, então
            não há senha sua para vazar.
          </li>
          <li>
            O token de acesso vive <strong>somente na memória da aba</strong> —
            nunca em <code>localStorage</code> nem em cookie legível por
            JavaScript. A renovação usa cookie <code>httpOnly</code>, inacessível a
            script.
          </li>
          <li>
            Nenhuma medida é absoluta. Se identificarmos incidente com risco
            relevante, comunicaremos os titulares e a ANPD conforme o art. 48.
          </li>
        </ul>
      </Secao>

      <Secao id="direitos" titulo="7. Seus direitos">
        <p>
          A LGPD (art. 18) te garante confirmação de tratamento, acesso, correção,
          anonimização, portabilidade, eliminação, informação sobre
          compartilhamento e revogação de consentimento.
        </p>
        <p>Parte você exerce sozinho, parte depende de pedido. Sendo exato:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Portabilidade:</strong>{' '}
            <Link href="/preferencias" className="inline-flex min-h-[24px] items-center" style={{ color: 'var(--ffv-blue)' }}>/preferencias</Link>{' '}
            baixa os dados da sua conta em JSON, e{' '}
            <Link href="/progresso" className="inline-flex min-h-[24px] items-center" style={{ color: 'var(--ffv-blue)' }}>/progresso</Link>{' '}
            exporta o seu progresso de estudo.
          </li>
          <li>
            <strong>Eliminação dos dados locais:</strong> o botão{' '}
            <em>Limpar este dispositivo</em> em{' '}
            <Link href="/preferencias" className="inline-flex min-h-[24px] items-center" style={{ color: 'var(--ffv-blue)' }}>/preferencias</Link>{' '}
            limpa o que está guardado no seu navegador, na hora. Sua conta continua
            existindo.
          </li>
          <li>
            <strong>Eliminação da conta:</strong> o botão{' '}
            <em>Excluir minha conta</em> em{' '}
            <Link href="/preferencias" className="inline-flex min-h-[24px] items-center" style={{ color: 'var(--ffv-blue)' }}>/preferencias</Link>{' '}
            executa a exclusão imediatamente, por autoatendimento. Apagamos o
            e-mail e o telefone do cadastro, o seu nome, o progresso sincronizado
            (XP, sequência, cartas de revisão) e a sua presença no ranking público.
            Os eventos de uso agregados deixam de ter qualquer vínculo com você.
            {' '}
            <strong>Duas coisas sobrevivem, e é importante que você saiba antes de
            clicar:</strong> certificados já emitidos — porque terceiros a quem você
            os mostrou podem estar conferindo o código — e registros de compra, pelo
            prazo fiscal. Se quiser a eliminação também desses, escreva para o
            contato da seção 1; avaliamos caso a caso, porque envolve documento já
            entregue a outra pessoa.
          </li>
          <li>
            <strong>Demais direitos</strong> (confirmação, acesso, correção,
            anonimização, informação sobre compartilhamento, revogação de
            consentimento): pelo mesmo contato, no mesmo prazo.
          </li>
        </ul>
      </Secao>

      <Secao id="retencao" titulo="8. Por quanto tempo guardamos">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Dados de conta e progresso:</strong> enquanto a conta existir.
            Ao excluir a conta (seção 7), o e-mail, o telefone, o nome e o progresso
            sincronizado são apagados na hora — não em 30 dias.
          </li>
          <li>
            <strong>Certificados emitidos:</strong> mantidos indefinidamente, para
            que a verificação pública por hash continue funcionando para quem você
            já compartilhou.
          </li>
          <li>
            <strong>Registros fiscais de compra:</strong> pelo prazo que a
            legislação tributária exigir.
          </li>
          <li>
            <strong>Progresso local (sem conta):</strong> fica no seu navegador até
            você limpar. Nunca esteve conosco.
          </li>
        </ul>
      </Secao>

      <Secao id="menores" titulo="9. Crianças e adolescentes">
        <p>
          O conteúdo é técnico e voltado a público profissional. Não coletamos
          intencionalmente dado de menores de 18 anos sem consentimento de
          responsável. Se identificar esse caso, avise pelo contato da seção 1 para
          removermos.
        </p>
      </Secao>

      <Secao id="mudancas" titulo="10. Mudanças nesta política">
        <p>
          Alterações relevantes serão anunciadas na plataforma antes de entrar em
          vigor, e a data no topo desta página sempre reflete a versão atual.
        </p>
      </Secao>

      <div className="mt-12 flex flex-wrap gap-3 border-t pt-8" style={{ borderColor: 'var(--ffv-border)' }}>
        <BackButton href="/" className="inline-flex items-center gap-1.5 text-sm underline">
          Voltar para a home
        </BackButton>
        <span style={{ color: 'var(--ffv-muted)' }}>·</span>
        <Link href="/preferencias" className="text-sm underline" style={{ color: 'var(--ffv-blue)' }}>
          Exportar ou apagar meus dados
        </Link>
      </div>
    </div>
  );
}
