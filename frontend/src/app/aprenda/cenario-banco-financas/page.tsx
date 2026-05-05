import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('cenario-banco-financas');

const ACCENT = '#60a5fa';

const quiz: QuizQuestion[] = [
  {
    question: 'Você recebe uma ligação dizendo "Your account is compromised — give us your SSN to verify." O que você faz?',
    options: [
      'Fornece o SSN porque parece legítimo',
      'Desliga e liga de volta para o número oficial do seu banco',
      'Pede para o atendente te dar o número da conta para confirmar',
      'Manda um email com as informações solicitadas',
    ],
    correct: 1,
    explanation:
      'Scam clássico de "account takeover". Bancos reais NUNCA pedem SSN, PIN ou senha completa por telefone. Desligue e ligue para o número no verso do seu cartão ou no site oficial. "I\'ll call you back on the official number" — e não atenda o retorno deles.',
  },
  {
    question: 'O que significa "Your credit score is 720"?',
    options: [
      'Você tem $720 de crédito disponível',
      'Você tem 720 pontos numa escala de solvência (300–850), considerado "Good"',
      'Você deve $720 para o banco',
      'Você pode fazer 720 transações por mês',
    ],
    correct: 1,
    explanation:
      'Credit score (FICO) vai de 300 a 850: Poor (300–579), Fair (580–669), Good (670–739), Very Good (740–799), Exceptional (800+). 720 é "Good" — você consegue a maioria dos cartões e financiamentos, mas não as melhores taxas. Meta: acima de 750.',
  },
  {
    question: 'Você quer mandar dinheiro para o Brasil com o menor custo. Qual opção é geralmente mais barata?',
    options: [
      'Wire transfer pelo banco americano ($25–$45 de taxa)',
      'Wise ou Remessa Online (taxas menores e câmbio mais justo)',
      'Western Union (conveniente mas caro)',
      'PayPal (taxa alta de conversão)',
    ],
    correct: 1,
    explanation:
      'Wise e Remessa Online usam câmbio do mercado real + taxa pequena (0.5–1.5%). Wire transfer bancário cobra $25–$45 de taxa fixa + spread de câmbio ruim. Para transferências regulares ao Brasil, Wise ou Remessa Online economizam centenas de dólares por ano.',
  },
  {
    question: 'Você recebeu um W-2 do empregador. O que isso significa na época de imposto?',
    options: [
      'É o formulário para declarar renda como freelancer (autônomo)',
      'É o comprovante de renda para empregado CLT — usado para declarar o Tax Return',
      'É uma notificação de auditoria do IRS',
      'É o formulário para abrir conta bancária',
    ],
    correct: 1,
    explanation:
      'W-2 = Wage and Tax Statement. Chega em janeiro do empregador. Mostra quanto você ganhou e quanto já foi retido de imposto no ano. Com ele você faz o Tax Return (declaração anual). Freelancers/contratados recebem 1099 (sem retenção automática — precisam pagar estimated taxes trimestralmente).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cenario-banco-financas"
      title="Cenário: Banco, Crédito e Finanças Pessoais"
      icon="🏦"
      xp={70}
      readTime={18}
      trailName="Inglês Prático"
      trailColor={ACCENT}
      nextSlug="cenario-transporte-direcoes"
      nextTitle="Cenário: Transporte, Direções e Mobilidade"
      relatedSlugs={['cenario-medico-emergencia', 'cenario-transporte-direcoes', 'ingles-1000-frases']}
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        O sistema financeiro americano tem uma lógica completamente diferente do brasileiro — e errar aqui pode
        custar muito caro. Credit score, checking vs savings, wire transfer, impostos, golpes financeiros: este
        módulo cobre o vocabulário que você precisa para não assinar nada sem entender e para construir uma
        reputação financeira sólida nos EUA.
      </p>

      <Section title="1. Abrindo conta bancária (checking vs savings)" accent={ACCENT}>
        <Callout tone="info">
          <strong>Checking vs Savings:</strong> Checking account = conta corrente (para o dia a dia — débito,
          cheques, pagamentos). Savings account = conta poupança (rende juros pequenos, não use para gasto
          diário). A maioria dos bancos permite abrir as duas juntas. Para imigrantes recentes sem SSN: alguns
          bancos aceitam ITIN ou passaporte estrangeiro.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Gostaria de abrir uma conta corrente.', 'I\'d like to open a checking account.', '"Checking" = chéh-king'],
            ['Quero também uma conta poupança.', 'I\'d like to open a savings account as well.', '"Savings" = séy-vings'],
            ['Qual o depósito mínimo inicial?', 'What\'s the minimum opening deposit?', 'Varia: $0 a $100 dependendo do banco'],
            ['Tem mensalidade?', 'Is there a monthly maintenance fee?', 'Pergunte como isentar — geralmente com depósito direto'],
            ['Aceita ITIN em vez de SSN?', 'Do you accept an ITIN instead of a Social Security Number?', 'ITIN = tax ID para não-residentes'],
            ['Como funciona o depósito direto?', 'How do I set up direct deposit?', '"Direct deposit" = salário cai direto na conta'],
            ['Posso sacar em qualquer ATM?', 'Can I use any ATM without fees?', '"ATM fee" = tarifa de caixa eletrônico'],
            ['Tem aplicativo móvel?', 'Do you have a mobile banking app?', 'Essencial — tudo é feito pelo app nos EUA'],
            ['Quanto tempo para o cartão chegar?', 'How long until my debit card arrives?', 'Geralmente 5–7 business days'],
            ['Posso fazer tudo online?', 'Can I manage everything online?', 'Sim — maioria dos bancos é 100% digital'],
          ]}
        />
      </Section>

      <Section title="2. Entendendo extrato e transações suspeitas" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Posso ver meu extrato?', 'Can I see my account statement?', '"Statement" = extrato'],
            ['Há uma cobrança que não reconheço.', '⚠️ There\'s a charge I don\'t recognize.', 'Primeiro passo para disputa'],
            ['Quando foi essa transação?', 'When did this transaction go through?', '"Go through" = ser processada'],
            ['Meu cartão foi clonado.', '⚠️ My card has been compromised / cloned.', 'Bloqueie imediatamente pelo app'],
            ['Preciso cancelar meu cartão.', 'I need to cancel and replace my card immediately.', '"Replace" = emitir novo cartão'],
            ['Qual é o saldo atual?', 'What\'s my current balance?', '"Balance" = saldo — BÆ-lens'],
            ['Essa cobrança foi debitada duas vezes.', 'This charge was processed twice — it\'s a duplicate.', '"Duplicate charge" = cobrança duplicada'],
            ['Estou disputando essa cobrança.', 'I\'d like to dispute this charge.', '"Dispute" = contestar — diss-PYOOT'],
            ['Qual é o prazo para resolução?', 'How long does the dispute process take?', 'Geralmente 7–10 business days'],
            ['Posso receber um aviso de gastos no app?', 'Can I set up spending alerts on the app?', 'Ative sempre — detecta fraude rapidamente'],
          ]}
        />
      </Section>

      <Section title="3. Cartão de débito e crédito: ativação e uso" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Como ativo meu cartão?', 'How do I activate my card?', 'Geralmente pelo app ou ligando para o número no verso'],
            ['Preciso configurar o PIN?', 'Do I need to set up a PIN?', '"PIN" = Personal Identification Number'],
            ['Posso usar como crédito ou débito?', 'Can I run it as credit or debit?', '"Run it as credit" = sem PIN, com assinatura'],
            ['Qual é o meu limite de crédito?', 'What\'s my credit limit?', '"Credit limit" = limite de crédito'],
            ['Qual é a taxa de juros (APR)?', '⚠️ What\'s the APR (Annual Percentage Rate)?', 'APR médio: 20–29% — pague sempre em dia'],
            ['Tenho cashback nesse cartão?', 'Does this card offer cashback?', 'Cashback = % que volta nas compras'],
            ['Quando vence minha fatura?', 'When is my payment due?', '"Due date" = data de vencimento'],
            ['Quero pagar o total da fatura.', 'I\'d like to pay the full statement balance.', 'SEMPRE pague o total — juros de crédito são brutais'],
            ['Meu cartão foi recusado. Por quê?', 'My card was declined. Can you tell me why?', '"Declined" = recusado — pode ser fraude ou limite'],
            ['Posso aumentar meu limite?', 'Can I request a credit limit increase?', 'Bom para o score se não usar mais de 30%'],
          ]}
        />
      </Section>

      <Section title="4. Credit score: como funciona e como construir" accent={ACCENT}>
        <Callout tone="info">
          <strong>Os 5 fatores do FICO score:</strong> (1) Histórico de pagamentos — 35% (pague em dia!); (2)
          Utilização do crédito — 30% (use menos de 30% do limite); (3) Tempo de histórico — 15% (não feche
          contas antigas); (4) Mix de crédito — 10%; (5) Novas consultas (hard inquiries) — 10%. Como imigrante
          novo, sua estratégia: Secured Credit Card + pague 100% todo mês + nunca atrase.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Qual é meu score de crédito atual?', 'What\'s my current credit score?', 'Cheque grátis em Credit Karma ou Experian'],
            ['Por que meu score caiu?', 'Why did my score drop?', '"Drop" = cair — verifique no relatório'],
            ['Posso checar meu score sem afetar?', 'Can I check my score without a hard inquiry?', '"Soft inquiry" = não afeta; "hard" = afeta'],
            ['Tenho um cartão garantido (secured).', 'I have a secured credit card.', 'Melhor primeiro cartão para imigrante'],
            ['Quando pago em dia, aumenta?', 'Will paying on time improve my score?', '"On time" = no prazo — fator mais importante'],
            ['Utilização acima de 30% é ruim?', 'Does using over 30% of my limit hurt my score?', 'Sim — mantenha utilização baixa'],
            ['Posso ter relatório de crédito grátis?', 'Can I get a free credit report?', 'AnnualCreditReport.com — 3 bureaus, 1× por ano'],
            ['Tem erro no meu relatório.', '⚠️ There\'s an error on my credit report.', 'Dispute pelo site da Experian/Equifax/TransUnion'],
            ['Dívida antiga afeta por quanto tempo?', 'How long does a negative item stay on my report?', '7 anos para a maioria; 10 para falência'],
            ['Quando terei um score bom?', 'How long will it take to build a good credit score?', 'Com boa gestão: 6–12 meses para 700+'],
          ]}
        />
      </Section>

      <Section title="5. Disputa de cobrança (disputing a charge)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Quero contestar uma cobrança.', 'I\'d like to dispute a charge on my account.', '"Dispute" = diss-PYOOT'],
            ['Não autorizei essa transação.', '⚠️ I did not authorize this transaction.', 'Linguagem precisa para chargeback'],
            ['O produto nunca chegou.', 'The item was never delivered.', 'Processo de chargeback com prova'],
            ['O serviço não foi prestado como prometido.', 'The service was not rendered as described.', 'Guarde comprovantes de tudo'],
            ['Já tentei resolver com o vendedor.', 'I already contacted the merchant and they refused to help.', 'Bancos pedem esse passo antes'],
            ['Qual o prazo para abrir disputa?', 'What\'s the time limit to file a dispute?', 'Geralmente 60 dias da transação'],
            ['Posso receber crédito provisório enquanto investigam?', 'Can I get a provisional credit while you investigate?', '"Provisional credit" = crédito temporário'],
            ['Como acompanho o status?', 'How can I track the status of my dispute?', '"Track" = acompanhar'],
            ['Preciso enviar documentação?', 'Do I need to submit any documentation?', 'Screenshots, emails, recibos — guarde tudo'],
            ['Se a disputa for negada, posso apelar?', 'If the dispute is denied, can I appeal?', '"Appeal" = recurso — prazo curto'],
          ]}
        />
      </Section>

      <Section title="6. Transferindo dinheiro para o Brasil (wire transfer, Wise, Remessa)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Quero fazer uma transferência internacional.', 'I\'d like to send an international wire transfer.', '"Wire transfer" = wayr TRANS-fer'],
            ['Qual é a taxa para enviar ao Brasil?', 'What\'s the fee to send to Brazil?', 'Banco: $25–$45. Wise: muito menor'],
            ['Qual é o câmbio de hoje?', 'What\'s today\'s exchange rate?', '"Exchange rate" = iks-CHAYNJ reyt'],
            ['Quanto tempo leva para chegar?', 'How long does it take to arrive?', 'Wire: 1–3 dias; Wise: horas'],
            ['Uso Wise — preciso do SWIFT code.', 'I use Wise — I need your bank\'s SWIFT code.', '"SWIFT code" = código internacional do banco'],
            ['O destinatário precisa de conta?', 'Does the recipient need a bank account?', 'Wire sim. Remessa/Wise sim.'],
            ['Há limite de quanto posso enviar?', 'Is there a daily transfer limit?', 'Bancos têm limites — pergunte antes'],
            ['Preciso reportar para o IRS?', '⚠️ Do I need to report this to the IRS?', 'Acima de $10k: FBAR + Form 8938 podem ser exigidos'],
            ['Posso agendar transferências automáticas?', 'Can I schedule recurring transfers?', 'Útil para pagar contas no Brasil mensalmente'],
            ['A Remessa Online tem app?', 'Does Remessa Online have an app?', 'Sim — muito usado por brasileiros'],
          ]}
        />
      </Section>

      <Section title="7. Impostos nos EUA: W-2, 1099, Tax Return" accent={ACCENT}>
        <Callout tone="warn">
          <strong>⚠️ Impostos americanos:</strong> Se você trabalha nos EUA, deve declarar — mesmo como
          imigrante. Deadline: 15 de abril (Tax Day). W-2 = empregado (imposto já retido). 1099 = freelancer
          (você recolhe o imposto — trimestralmente via Estimated Tax). Tax Return = declaração anual. Refund =
          devolução se pagou mais do que devido. Tax owed = se pagou menos. Use TurboTax, H&R Block ou um CPA
          brasileiro.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Preciso fazer minha declaração de imposto.', 'I need to file my tax return.', '"File" = enviar a declaração'],
            ['Quando é o prazo de declaração?', 'When\'s the tax filing deadline?', 'April 15 — pode pedir extensão até outubro'],
            ['Tenho direito a restituição?', 'Am I getting a tax refund?', '"Refund" = RÉ-fund (restituição)'],
            ['Quanto devo ao IRS este ano?', 'How much do I owe the IRS this year?', 'IRS = Receita Federal americana'],
            ['Posso deduzir despesas de home office?', 'Can I deduct home office expenses?', 'Para self-employed: sim. Empregado CLT: não mais'],
            ['O que é o standard deduction?', 'What\'s the standard deduction?', '2024: $14.600 (single) — reduz renda tributável'],
            ['Preciso de CPA ou faço sozinho?', 'Do I need a CPA or can I DIY with software?', 'CPA = Certified Public Accountant'],
            ['Quando posso esperar meu refund?', 'When can I expect my refund?', 'Geralmente 21 dias após e-file'],
            ['Como pago imposto estimado trimestral?', 'How do I pay quarterly estimated taxes?', 'IRS Direct Pay — para freelancers e self-employed'],
            ['Há penalidade por atraso?', '⚠️ Is there a penalty for filing late?', 'Sim: 5% ao mês sobre o valor devido'],
          ]}
        />
      </Section>

      <Section title="8. Golpes financeiros comuns (scams): como identificar e recusar" accent={ACCENT}>
        <Callout tone="warn">
          <strong>⚠️ Red flags de scam:</strong> (1) Urgência artificial — "act now or lose your account";
          (2) Pedido de gift cards como forma de pagamento; (3) Pedido de SSN, PIN ou senha por telefone;
          (4) Ameaça de prisão ou deportação pelo IRS (o IRS contata por carta, nunca por telefone);
          (5) Oferta boa demais para ser verdade.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['⚠️ Isso parece um golpe.', '⚠️ This sounds like a scam.', 'Confie no instinto — desligue'],
            ['O IRS nunca liga pedindo pagamento.', '⚠️ The IRS never calls demanding immediate payment.', 'IRS contata por carta registrada — sempre'],
            ['Não fornecerei meu SSN por telefone.', '⚠️ I won\'t give my SSN over the phone.', 'Nenhuma empresa legítima pede assim'],
            ['Vou verificar pelo site oficial.', 'I\'ll verify this through the official website.', '"Official website" = site oficial da empresa'],
            ['Por favor, não me ligue mais.', 'Please stop calling me. I\'m placing you on our do-not-call list.', 'Funciona com empresas legítimas'],
            ['Isso é phishing.', 'This is a phishing attempt — I\'m reporting it.', '"Phishing" = fí-shing'],
            ['Nunca pague com gift card.', '⚠️ No legitimate company asks for payment in gift cards.', 'Gift card como pagamento = scam 100% das vezes'],
            ['Vou reportar ao FTC.', 'I\'m reporting this to the FTC at reportfraud.ftc.gov.', 'FTC = Federal Trade Commission'],
            ['Meu banco vai me contatar como?', 'How does my bank officially contact me?', 'Verifique política do banco — geralmente app/email'],
            ['Posso verificar esse número?', 'Let me call you back on the official number.', 'Scammers ficam na linha — desligue e ligue você'],
          ]}
        />
      </Section>

      <Section title="9. Comprando carro: financiamento e negociação" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Estou procurando um carro usado confiável.', 'I\'m looking for a reliable used car.', '"Reliable" = confiável — reh-LÁY-uh-bul'],
            ['Qual é o preço de tabela?', 'What\'s the sticker price / MSRP?', '"MSRP" = Manufacturer\'s Suggested Retail Price'],
            ['Posso fazer um test drive?', 'Can I take it for a test drive?', '"Test drive" = tést drayv'],
            ['Tem histórico do veículo?', 'Can I see the vehicle history report?', 'Peça o Carfax — verifique acidentes'],
            ['Qual é a taxa de juros do financiamento?', '⚠️ What\'s the interest rate on the loan?', 'APR bom: abaixo de 7% (2024)'],
            ['Quero pre-approval do banco antes.', 'I\'d like to get pre-approved by my bank first.', 'Pré-aprovação = mais poder de negociação'],
            ['Posso negociar o preço?', 'Is the price negotiable?', 'Nos EUA é esperado — sempre negocie'],
            ['Qual é o valor do trade-in do meu carro?', 'What\'s my trade-in value?', '"Trade-in" = dar o carro velho como entrada'],
            ['Quais taxas adicionais haverá?', '⚠️ What are all the additional fees?', 'Doc fee, dealer prep, registration — some são negociáveis'],
            ['Posso levar para meu mecânico avaliar?', 'Can I have my mechanic inspect it before I decide?', 'Dealership bom vai aceitar — se recusar, desconfie'],
          ]}
        />
      </Section>

      <Section title="10. Empréstimo pessoal e HELOC: perguntas certas" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Quero solicitar um empréstimo pessoal.', 'I\'d like to apply for a personal loan.', '"Personal loan" = empréstimo não garantido'],
            ['Qual é a taxa de juros anual?', '⚠️ What\'s the APR including all fees?', 'APR inclui taxas — compare, não só juros'],
            ['Há taxa de pagamento antecipado?', 'Is there a prepayment penalty?', '"Prepayment penalty" = multa por quitar antes'],
            ['Qual é o prazo do empréstimo?', 'What\'s the loan term?', '"Loan term" = prazo — 12, 24, 36, 60 meses'],
            ['Como o empréstimo afeta meu credit score?', 'How will this loan affect my credit score?', 'Hard inquiry + aumento de dívida total'],
            ['O que é HELOC?', 'What is a HELOC exactly?', 'Home Equity Line of Credit = crédito sobre a casa'],
            ['Minha casa serve como garantia?', 'Is my home the collateral for a HELOC?', '⚠️ Sim — não pagar = perder a casa'],
            ['Qual é a diferença de home equity loan vs HELOC?', 'What\'s the difference between a home equity loan and a HELOC?', 'Loan = valor fixo; HELOC = linha rotativa'],
            ['Quando devo usar HELOC vs cartão de crédito?', 'When is a HELOC better than a credit card?', 'HELOC: taxa menor. Risco: sua casa como garantia'],
            ['Posso comparar ofertas sem afetar meu score?', 'Can I compare loan offers with a soft inquiry only?', '"Soft pull" = não afeta o score'],
          ]}
        />
      </Section>

      <Callout tone="success">
        <strong>Você domina o inglês financeiro americano.</strong> Com este vocabulário, você protege seu
        dinheiro, constrói crédito do zero e navega bancos, impostos e investimentos com confiança. Regra de
        ouro: nunca assine nada sem ler. ⚠️ Scam = desconfie sempre de urgência e gift cards. Próximo módulo:
        transporte e direções — como se virar sem internet.
      </Callout>
    </div>
  );
}
