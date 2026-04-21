/**
 * Respostas mockadas do tutor IA, indexadas por questionId.
 *
 * MVP: respostas escritas à mão pra uma amostra representativa de questões.
 * Quando chegar backend, substituir por chamada à API Claude com prompt
 * caching (contexto da certificação + enunciado da questão).
 *
 * TODO(backend): trocar este map por cliente Anthropic SDK com prompt
 * caching. O system prompt carrega ementa da certificação; user message
 * traz enunciado + escolha do usuário + tipo de pergunta (por que? analogia?
 * exemplo?). Stream a resposta token-by-token.
 */

export interface TutorResponse {
  defaultResponse: string;
  analogyResponse: string;
  exampleResponse: string;
}

export const TUTOR_RESPONSES: Record<string, TutorResponse> = {
  'clf-q1': {
    defaultResponse:
      'O modelo de responsabilidade compartilhada divide segurança em duas categorias: "segurança DA nuvem" (AWS) e "segurança NA nuvem" (você). EC2 é IaaS — AWS entrega o hypervisor, hardware, rede física; você entrega o resto. Isso inclui: escolher AMI, atualizar kernel, configurar firewall do SO, gerenciar usuários Linux/Windows, aplicar patches de segurança regularmente. Se você não aplica patch, é sua responsabilidade.',
    analogyResponse:
      'Pense num aluguel de casa. O proprietário cuida da estrutura (paredes, telhado, encanamento principal) — isso é AWS cuidando do datacenter e do hypervisor. Mas trocar as lâmpadas, pintar as paredes, manter as janelas fechadas quando chover? É você. Patch de SO é como manter as janelas fechadas — se você esquece, água entra, e o problema é seu.',
    exampleResponse:
      'Exemplo real: em 2021 a falha Log4Shell (CVE-2021-44228) atingiu milhões de servidores. Se você rodava Log4j em uma EC2 sem aplicar o patch da AWS Inspector, a responsabilidade era 100% sua — a AWS não pode entrar na sua instância e atualizar libs. Com Fargate ou Lambda, o runtime é gerenciado, então a AWS corrige; com EC2, você.',
  },
  'clf-q2': {
    defaultResponse:
      'S3 garante 99,999999999% (11 noves) de durabilidade e até 99,99% de disponibilidade na classe Standard. Os 11 noves vêm da replicação automática entre no mínimo 3 AZs de uma Region. EBS é block storage preso a 1 AZ (precisa snapshot pra cross-AZ), EFS é NFS multi-AZ (também 11 noves), FSx é pra casos específicos (Windows FS, Lustre).',
    analogyResponse:
      'Durabilidade é "não perder" os dados; disponibilidade é "conseguir acessar". 11 noves significa que, se você guardar 10 milhões de objetos, pode esperar perder 1 em 10.000 anos. É praticamente impossível perder. Compare com um HD caseiro: 1 em 10 anos você perde um. AWS virou o default das fintechs por isso.',
    exampleResponse:
      'Exemplo: quando a Netflix armazena vídeo master, usa S3 Standard. Quando processa, move pra EFS (compartilhado entre instâncias de processamento). Quando distribui pro usuário, CloudFront (cache). Nenhum desses usa EBS porque precisaria replicar manualmente. S3 é a base — os outros constroem em cima.',
  },
  'clf-q6': {
    defaultResponse:
      'Princípio de menor privilégio (least privilege) é a base de IAM: dê só as permissões estritamente necessárias, por função específica. Se um dev precisa criar EC2 de dev, dê permissão de criar EC2 com tag Dev=true, não AdministratorAccess. Isso limita blast radius quando credenciais vazam. AdministratorAccess deve ser exceção, usada apenas em emergência ou com MFA + aprovação.',
    analogyResponse:
      'É como dar a chave do apartamento. Você dá cópia pra faxineira ou pro porteiro? Depende do que cada um precisa. Faxineira entra no apartamento 1x por semana — dê só a chave da porta. Porteiro precisa acessar o salão de festas — chave separada. Dar a chave mestra do prédio pra todo mundo é receita pra roubo.',
    exampleResponse:
      'Exemplo: em 2019 um ex-funcionário do Capital One usou credenciais AWS mal configuradas (role do WAF tinha permissão excessiva em S3) pra acessar 100M de dados de clientes. Se o role seguisse least privilege (só as actions que o WAF precisava), o ataque seria impossível. Hoje AWS tem IAM Access Analyzer que detecta permissões não usadas.',
  },
  'clf-q10': {
    defaultResponse:
      'DynamoDB é o NoSQL key-value/document managed da AWS. Single-digit millisecond latência em qualquer escala. Serverless (on-demand mode) ou provisionado. Ideal pra: sessions, carrinho de compras, leaderboards, real-time bidding. RDS e Aurora são SQL relacionais (diferente modelo de dados — joins, foreign keys, ACID tradicional). Redshift é data warehouse colunar, feito pra analytics de PB de dados.',
    analogyResponse:
      'Bancos NoSQL como DynamoDB são mesa de restaurante — você pede um prato específico (chave), sai rápido. Bancos SQL como RDS são buffet com fileiras organizadas (tabelas) — você escolhe de várias, mas tem que percorrer. Para consultas simples e escala massiva, mesa vence. Para joins complexos e transações, fileira vence.',
    exampleResponse:
      'Exemplo: a Amazon.com original rodava em Oracle. Escalar a consulta "qual a wishlist do user 123" em Oracle ficava caro demais. Rearquitetaram pra Dynamo (precursor do DynamoDB): cada item é um registro independente, consulta por PK retorna em <10ms. Hoje serve 10 trilhões de requests/ano. Um SQL tradicional colapsaria.',
  },
  'clf-q13': {
    defaultResponse:
      'IAM Role em EC2 é o caminho seguro porque: (1) credenciais temporárias — renovadas automaticamente a cada hora, nunca hardcoded; (2) nunca tocam seu código — ficam no Instance Metadata Service (169.254.169.254), acessado transparentemente pelos SDKs AWS; (3) rotação é invisível — você define a role uma vez, AWS cuida do resto. Nunca use access key/secret hardcoded ou em env vars — elas não rotacionam, e se vazam ficam boas eternamente.',
    analogyResponse:
      'Role em EC2 é como crachá de funcionário num prédio corporativo — entrega em frente da catraca, não você que colocou manualmente. Já access key hardcoded é como escrever a senha do wifi num post-it colado no monitor. Adivinha qual aparece em GitHub público toda semana?',
    exampleResponse:
      'Exemplo: a GitHub Secret Scanning detectou em 2022 mais de 10 milhões de AWS access keys vazadas em repos públicos — um dev comitou por acidente, bot escaneou, minerou cripto no dia seguinte. Com IAM Role, o secret nunca existe fora da AWS. É impossível vazar porque não tem o que vazar.',
  },
};

export function getTutorResponse(questionId: string): TutorResponse | null {
  return TUTOR_RESPONSES[questionId] ?? null;
}

/** Fallback genérico quando não há resposta escrita à mão. */
export function getFallbackResponse(defaultExplanation: string): TutorResponse {
  return {
    defaultResponse: defaultExplanation,
    analogyResponse:
      'Ainda estou construindo analogias específicas para esta questão no MVP. Por enquanto, veja a explicação padrão acima — ela já traz o raciocínio completo.',
    exampleResponse:
      'Exemplos práticos específicos desta questão chegam em breve. A explicação padrão cobre o principal, e você pode complementar com os artigos relacionados da FFV Academy nas trilhas de AWS.',
  };
}
