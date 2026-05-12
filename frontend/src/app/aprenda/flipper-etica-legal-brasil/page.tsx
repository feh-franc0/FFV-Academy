import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, KeyValue, Timeline, DecisionBox, FlowDiagram } from '@/components/article/primitives';

export const metadata = getModuleMetadata('flipper-etica-legal-brasil');

const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'O Art. 154-A do Código Penal (invasão de dispositivo informático) tipifica quais condutas após a Lei 14.155/2021?',
    options: [
      'Apenas invasão remota com violação de senha',
      'Invadir dispositivo alheio, conectado ou não à rede, com fim de obter, adulterar ou destruir dados, ou instalar vulnerabilidades — sem mais o requisito de "violação indevida de mecanismo de segurança", com pena de RECLUSÃO 1–4 anos + multa',
      'Apenas posse de software malicioso',
      'Apenas crimes envolvendo cartão de crédito',
    ],
    correct: 1,
    explanation: 'A redação original (Lei 12.737/2012, "Carolina Dieckmann") exigia "violação indevida de mecanismo de segurança" e previa DETENÇÃO de 3 meses a 1 ano. A Lei 14.155/2021 removeu o requisito (basta o acesso não autorizado) e endureceu para RECLUSÃO de 1 a 4 anos + multa. Reclusão é regime mais grave que detenção. §3º qualifica para 2-5 anos quando há obtenção de comunicações privadas, segredos comerciais ou conteúdo sigiloso. §§4-5 majoram em 1/3 a 2/3.',
  },
  {
    question: 'Capturar passivamente o UID de um cartão NFC alheio em transporte público com Flipper Zero — qual é a leitura jurídica MAIS DEFENSÁVEL hoje?',
    options: [
      'É plenamente legal porque o UID é público',
      'Pode configurar tratamento de dado pessoal sem base legal (LGPD Art. 7º) e, se houver intenção de fraude/clonagem, conduta preparatória de Art. 154-A — terreno cinzento, mas longe de "atípico"',
      'É contravenção penal apenas',
      'É crime hediondo',
    ],
    correct: 1,
    explanation: 'UID de cartão é dado pessoal indireto (LGPD Art. 5º, I — informação relacionada a pessoa natural identificável quando combinado com outros dados, ex: catraca registra UID + horário + localização). Tratamento sem consentimento ou outra base legal viola Art. 7º — sanção administrativa até 2% do faturamento (R$ 50M cap por infração). Penalmente, captura pura sem uso costuma ser atípica; com dolo de clonagem, vira ato preparatório/executório de 154-A ou estelionato Art. 171 §2º-A.',
  },
  {
    question: 'Por que ANATEL tem competência para apreender Flipper Zero em alfândega mesmo sem lei específica banindo o dispositivo?',
    options: [
      'Por convenção da ONU',
      'Lei 9.472/97 (LGT) Art. 162 exige homologação de qualquer transmissor radioelétrico em território nacional; sem certificação, há infração administrativa (Art. 183-184) e o produto é não-conformidade aduaneira',
      'Por liminar do STF de 2023',
      'Porque é arma de guerra',
    ],
    correct: 1,
    explanation: 'A Lei Geral das Telecomunicações 9.472/97 Art. 162 §2º obriga certificação/homologação de qualquer equipamento que emita radiofrequência. Resolução 715/2019 ANATEL detalha o processo. Sem homologação, importação fere o regime aduaneiro de produtos sujeitos a anuência (CAMEX). Apreensão é administrativa, não penal. Uso clandestino de radiofrequência (Art. 183 LGT) tem pena de detenção 2-4 anos + multa, mas exige uso TX comprovado, não posse.',
  },
  {
    question: 'Sobre as bandas ISM 433 MHz e 915 MHz no Brasil: qual afirmação é CORRETA segundo a Resolução 680/2017 ANATEL?',
    options: [
      'São totalmente livres, qualquer potência permitida',
      'São bandas de radiação restrita; 433.05–434.79 MHz tem limite de 10 mW EIRP (com restrição de duty-cycle); 902–928 MHz tem limites superiores. Transmitir acima do limite é uso não autorizado',
      '433 MHz só pode ser usado por radioamador com indicativo',
      'Só podem ser usadas por militares',
    ],
    correct: 1,
    explanation: 'Resolução 680/2017 ANATEL (revogou e atualizou a 506/2008) define limites de Radiação Restrita. Para 433.05–434.79 MHz: 10 mW EIRP é o teto típico. Para 902–907.5 / 915–928 MHz: limites maiores (até 1 W EIRP em FHSS/DSSS sob condições). Acima disso é uso não autorizado de espectro — infração da LGT. CC1101 do Flipper pode TX até +12 dBm (15.8 mW) — já passa do limite em 433 MHz se a antena tiver ganho.',
  },
  {
    question: 'Você é convocado para um pentest físico em uma empresa. Quais são os 5 itens não-negociáveis ANTES de tirar o Flipper da mochila no cliente?',
    options: [
      'Foto do Flipper para o LinkedIn, café, agenda, parking, energia',
      'Contrato escrito; escopo definido; autorização do PROPRIETÁRIO LEGAL dos sistemas; cláusula LGPD/NDA; "get out of jail letter" assinada por executivo com poder para tal',
      'Apenas WhatsApp do gerente de TI',
      'Crachá visitante e bom senso',
    ],
    correct: 1,
    explanation: 'Padrão consagrado em frameworks como PTES (Penetration Testing Execution Standard) e OSSTMM. (1) Contrato comercial assinado. (2) Escopo: ranges IP, prédios, horários, sistemas in/out. (3) Autorização do proprietário — não basta TI autorizar se o sistema é third-party. (4) Cláusula LGPD/sigilo: como você lida com dados pessoais expostos. (5) "Get out of jail letter": carta física assinada por exec, em poder do testador no campo, citando contrato + autorização — apresentável a polícia/segurança se interpelado. Sem os 5, conduta vira 154-A.',
  },
  {
    question: 'Por que é mais arriscado para o pentester brasileiro usar Flipper em telhado de carro alheio que comprar um HackRF One legalmente importado?',
    options: [
      'HackRF é mais discreto',
      'A conduta (interagir com sistema alheio sem autorização) é o que tipifica o crime — independe do device. Mas posse de Flipper sem homologação ANATEL ainda é infração administrativa. Combinação: dois problemas em vez de um',
      'HackRF não emite RF',
      'Flipper é registrado pelo IMEI',
    ],
    correct: 1,
    explanation: 'Tipo penal (CP 154-A, 155, 171) sempre depende da CONDUTA + DOLO. Device é meio. Porém, posse de equipamento RF não-homologado adiciona camada administrativa ANATEL que se acumula. No mundo real, em uma operação policial, dois fatos é pior que um: além de processado por 154-A, sofre apreensão administrativa do hardware e potencial multa. HackRF na mesma situação tem o mesmo problema de homologação, mas o caso CriptoVet mostrou que Flipper carrega estigma midiático adicional.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="flipper-etica-legal-brasil"
      title="⚠️ Ética e legalidade no Brasil: Art. 154-A, LGPD, ANATEL"
      icon="⚖️"
      xp={60}
      readTime={12}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="flipper-firmwares-comparados"
      nextTitle="Firmwares comparados"
      quiz={quiz}
    >
      <Section title="Por que esta aula é obrigatória" accent={accent}>
        <Callout tone="danger" icon="🛑">
          Este módulo é <strong>pré-requisito não negociável</strong> para todo o resto da trilha. A FFV
          Academy não publica receitas de invasão. Publica engenharia. A diferença entre um pesquisador de
          segurança e um réu por 154-A não está no hardware — está na <strong>autorização escrita</strong> e
          no escopo. Leia inteiro.
        </Callout>
        <p className="text-sm leading-6">
          O Brasil endureceu a legislação cibernética em 2021. ANATEL apreende Flippers em alfândega. LGPD
          alcança até a captura de UID. Vamos mapear cada regra com fonte primária e exemplos concretos.
        </p>
      </Section>

      <Section title="Código Penal — Art. 154-A (invasão de dispositivo informático)" accent={accent}>
        <p className="text-sm leading-6">
          Originado pela <strong>Lei 12.737/2012</strong> (apelidada Lei Carolina Dieckmann). A
          <strong> Lei 14.155/2021</strong> reformou pesado.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Lei 12.737/2012 (original)', 'Lei 14.155/2021 (vigente)']}
          rows={[
            ['Pena base', 'Detenção 3 meses a 1 ano + multa', 'RECLUSÃO 1 a 4 anos + multa'],
            ['Requisito', 'Violação indevida de mecanismo de segurança', 'Violação ou NÃO — basta acesso não autorizado'],
            ['§3º (qualificadora)', '6 meses a 2 anos', 'Reclusão 2 a 5 anos quando há obtenção de comunicações privadas, segredos comerciais, controle remoto'],
            ['§4º (aumento)', '1/6 a 1/3', 'Aumento 1/3 a 2/3 se houver divulgação/comercialização dos dados'],
            ['§5º (autoridade)', '1/3 a 1/2', 'Aumento 1/2 a 2/3 contra Pres. República, governadores, magistrados, delegados, etc.'],
            ['Regime', 'Detenção (semiaberto/aberto típico)', 'Reclusão (fechado/semiaberto/aberto — mais grave)'],
          ]}
        />
        <Callout tone="warn" icon="📜">
          A mudança de <strong>detenção para reclusão</strong> tem efeito real: reclusão admite regime inicial
          fechado, é registrada de forma diferente em folha penal, e a prescrição muda. Mais: a remoção do
          requisito de "violação de mecanismo de segurança" torna o tipo aplicável mesmo a sistemas mal
          configurados/abertos — não é mais defesa dizer "estava sem senha".
        </Callout>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Texto vigente', v: 'planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/L14155.htm' },
            { k: 'Tipo de ação penal', v: 'Pública condicionada à representação (em regra) — vide §4º-A' },
            { k: 'Concurso', v: 'Pode acumular com furto qualificado (Art. 155 §4º-B), estelionato eletrônico (Art. 171 §2º-A — também novo da 14.155), violação de sigilo (Art. 154)' },
          ]}
        />
      </Section>

      <Section title="Concursos comuns — quando 154-A não vem sozinho" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Conduta hipotética', 'Tipos penais aplicáveis', 'Pena máxima somada']}
          rows={[
            ['Replay de código fixo de garagem alheia para furtar veículo', 'Art. 155 §4º-B (furto qualificado eletrônico) + Art. 154-A', '8 anos de reclusão + multa'],
            ['Clonar UID de catraca de prédio para entrar sem autorização', 'Art. 154-A + Art. 150 (invasão de domicílio) ou Art. 233 (esbulho possessório)', '5+ anos'],
            ['Clonar HID Prox de empresa e acessar servidor', 'Art. 154-A §3º + Art. 184 (violação de direito autoral, se copia código)', '5–7 anos'],
            ['Sniff NFC + abuso de dados pessoais', 'Art. 154-A + LGPD sanção administrativa (até R$ 50M / infração)', '4 anos + R$ 50M'],
            ['BLE Spam massivo em local público', 'Pode configurar Art. 266 (interrupção de serviço telegráfico/telefônico/informático) — pena 1–3 anos', '3 anos'],
            ['Estelionato com crachá clonado', 'Art. 171 §2º-A (estelionato eletrônico — Lei 14.155/21)', '4–8 anos'],
          ]}
        />
      </Section>

      <Section title="LGPD — quando captura de RFID/NFC vira tratamento de dado pessoal" accent={accent}>
        <p className="text-sm leading-6">
          A <strong>Lei 13.709/2018 (LGPD)</strong> define dado pessoal como qualquer informação relacionada
          a pessoa natural identificada ou identificável (Art. 5º, I). UID de cartão isoladamente parece
          número aleatório, mas combinado com horário, local e câmera CFTV vira identificável — daí entra na
          LGPD.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Base legal exigida (Art. 7º)', v: 'Consentimento ou outra das 9 hipóteses (legítimo interesse, contrato, etc.)' },
            { k: 'Captura sem base', v: 'Tratamento irregular — sanção administrativa pela ANPD' },
            { k: 'Sanções (Art. 52)', v: 'Advertência → multa simples até 2% do faturamento (R$ 50M cap por infração) → diária → bloqueio dos dados → eliminação' },
            { k: 'Transferência internacional', v: 'Restrita (Art. 33). Subir captura para serviço cloud sem garantias = sanção adicional' },
          ]}
        />
        <Callout tone="info" icon="📊">
          Em pentest contratado: a LGPD é satisfeita por contrato (operador de tratamento, Art. 39) + cláusula
          de confidencialidade + DPIA quando houver risco. Sem contrato? Não há base legal — captura é
          irregular mesmo "para estudar".
        </Callout>
      </Section>

      <Section title="ANATEL — homologação, ISM, e por que apreendem Flippers" accent={accent}>
        <p className="text-sm leading-6">
          A <strong>Lei 9.472/97 (LGT)</strong> regula telecomunicações. Art. 162 exige homologação prévia
          ANATEL para qualquer equipamento radioelétrico. Resolução 715/2019 detalha o processo. Resolução
          680/2017 define limites de Radiação Restrita nas bandas ISM.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Banda (MHz)', 'Limite EIRP', 'Uso típico', 'Observação']}
          rows={[
            ['433.05 – 434.79', '10 mW (10 dBm) EIRP', 'Controles RF, sensores domésticos', 'Banda mais restrita; +12 dBm do CC1101 com antena 1 dBi já passa'],
            ['902 – 907.5 e 915 – 928', 'até 1 W EIRP (FHSS/DSSS)', 'IoT LoRa, ZigBee, telemetria industrial', 'Mais permissiva; modulação espalhada exigida em potências altas'],
            ['2400 – 2483.5', 'até 1 W EIRP (FHSS/DSSS)', 'Wi-Fi, BLE, ZigBee', 'Banda compartilhada, regras de duty-cycle'],
            ['5725 – 5850', 'até 1 W EIRP', 'Wi-Fi 5 GHz UNII-3', 'Restrições adicionais em outdoor'],
          ]}
        />
        <Timeline
          title="Eventos legais brasileiros relevantes"
          accent={accent}
          events={[
            { when: '1997', label: 'Lei Geral das Telecomunicações 9.472', detail: 'Art. 162 exige homologação; Art. 183-184 punem uso clandestino' },
            { when: '2012', label: 'Lei 12.737 — "Carolina Dieckmann"', detail: 'Cria Art. 154-A (invasão de dispositivo). Pena leve de detenção' },
            { when: '2017', label: 'Resolução 680 ANATEL', detail: 'Atualiza limites de radiação restrita em ISM' },
            { when: '2018', label: 'Lei 13.709 — LGPD', detail: 'Promulgada; vigência de sanções a partir de 2021' },
            { when: '2019', label: 'Resolução 715 ANATEL', detail: 'Procedimento de avaliação de conformidade e homologação' },
            { when: '2021', label: 'Lei 14.155 endurece cibercrime', detail: '154-A vira reclusão 1-4 anos; cria estelionato eletrônico Art. 171 §2º-A; furto eletrônico §4º-B', highlight: true },
            { when: '2023', label: 'Apreensões de Flipper se tornam rotina', detail: 'Receita Federal e Correios passam a reter remessas' },
            { when: '2024', label: 'Operação CriptoVet (ES)', detail: 'Flipper como instrumento de extorsão criptoativos — caso público' },
          ]}
        />
        <Callout tone="danger" icon="🚫">
          O Flipper Zero <strong>NÃO é homologado pela ANATEL</strong> em maio de 2026. Importações via
          Correios sofrem apreensão sistemática. Não há lei federal banindo posse, mas presumir "posso usar
          em casa, é só meu" não exime de eventual TX em frequência regulada.
        </Callout>
      </Section>

      <Section title="Pentest ético — os 5 itens não-negociáveis" accent={accent}>
        <FlowDiagram
          title="Pré-engajamento que separa pesquisa de crime"
          accent={accent}
          steps={[
            { icon: '📜', label: 'Contrato', desc: 'Comercial assinado pelas partes — instrumento formal de prestação de serviço' },
            { icon: '🎯', label: 'Escopo (SoW)', desc: 'Sistemas, prédios, horários, IPs, técnicas autorizadas. Tudo fora = proibido' },
            { icon: '🏢', label: 'Autorização do proprietário', desc: 'Quem é dono do sistema autoriza? Se for SaaS terceirizado, precisa do dono real, não só do contratante' },
            { icon: '🔐', label: 'NDA + cláusula LGPD', desc: 'Como dados pessoais são tratados, retidos, devolvidos, eliminados' },
            { icon: '📄', label: 'Get out of jail letter', desc: 'Carta física, assinada por executivo com poder, citando contrato + escopo. Levar no campo, apresentar a polícia/segurança se interpelado' },
          ]}
        />
        <DecisionBox
          scenario="Você está prestes a usar o Flipper. PARE. Faça este checklist."
          winner="Tenho os 5 itens? Posso prosseguir."
          winnerColor={accent}
          why="Sem qualquer um deles, a conduta vira potencialmente típica em CP 154-A, 155, 171, 266, ou infração LGPD/LGT. A diferença entre teste profissional e crime é documental, não técnica."
          alternatives={[
            { name: 'Lab pessoal', note: 'hardware comprado por você, sem afetar terceiros — sempre permitido' },
            { name: 'CTF / wargame', note: 'plataforma autoriza explicitamente — escopo já definido' },
            { name: 'Bug bounty', note: 'programa com regras escritas (HackerOne, Bugcrowd) — autorização pública existe' },
          ]}
        />
      </Section>

      <Section title="Caso real: Operação CriptoVet (ES, 2024)" accent={accent}>
        <p className="text-sm leading-6">
          Polícia Civil do Espírito Santo, em 2024, deflagrou operação contra esquema de extorsão envolvendo
          criptoativos. Entre os itens apreendidos havia um Flipper Zero. Foi um dos primeiros casos
          midiáticos no Brasil em que o dispositivo aparece como instrumento.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Lição 1', v: 'Posse pura não foi tipificada — uso doloso foi. CP 91, II, "a" trata o objeto como instrumento do crime' },
            { k: 'Lição 2', v: 'O dispositivo carrega estigma. Promotor pode usar como elemento narrativo: "réu portava ferramenta especializada de invasão"' },
            { k: 'Lição 3', v: 'Sem homologação ANATEL, soma-se discussão administrativa à criminal' },
            { k: 'Lição 3 prática', v: 'Pentester sério mantém: contrato + autorização + carta no bolso. Sempre' },
          ]}
        />
      </Section>

      <Section title="Mundo: como outros países lidam" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['País', 'Status', 'Detalhes']}
          rows={[
            ['Estados Unidos', 'Legal', 'Vendido livremente. Senado debateu restrições em 2024 sem aprovação'],
            ['Canadá', 'Legal (após reversão)', 'Min. Indústria anunciou banimento em fev/2024; recuou em jul/2024 após backlash da EFF e comunidade'],
            ['União Europeia', 'Legal', 'Conformidade CE/RED já obtida; venda livre'],
            ['Reino Unido', 'Legal', 'Sem restrições específicas além das gerais de RF'],
            ['Brasil', 'Não homologado', 'Apreensões de importação rotineiras; sem lei específica'],
            ['Austrália', 'Legal', 'ACMA não restringe posse'],
            ['Japão', 'Cinzento', 'Uso de RF exige conformidade Telec; posse não banida'],
          ]}
        />
        <Callout tone="info" icon="🌐">
          A EFF (Electronic Frontier Foundation) foi peça-chave no recuo canadense em 2024, argumentando que
          banir ferramentas dual-use (que servem para pesquisa legítima) prejudica defensores. Mesmo
          argumento aplicável ao Brasil — homologação seria caminho técnico, não banimento.
        </Callout>
      </Section>

      <Section title="Resumo executivo (para imprimir e colar na bancada)" accent={accent}>
        <Callout tone="success" icon="✅">
          <strong>Permitido:</strong> usar em hardware próprio (lab, equipamentos comprados por você);
          em pentest com contrato + escopo + autorização escrita; em CTFs e bug bounty com regras públicas;
          ler especificações técnicas e datasheets; estudar protocolos.
        </Callout>
        <Callout tone="danger" icon="❌">
          <strong>Proibido (sem autorização):</strong> interagir com sistemas de terceiros (catracas, garagens,
          carros, crachás corporativos) — CP 154-A; transmitir acima dos limites ISM 680/2017 — LGT 183-184;
          capturar dados pessoais sem base legal — LGPD Art. 7º. Operar sem documento se interpelado é receita
          para apreensão e processo.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
