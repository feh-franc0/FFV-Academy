export interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  xpBonus: number;
}

export const BADGES_DEF: BadgeDef[] = [
  { id: 'first_step',     name: 'Primeiro Passo',      icon: '👣', desc: 'Completou seu primeiro módulo',         xpBonus: 10  },
  { id: 'quiz_perfect',   name: 'Gabarito',             icon: '🎯', desc: 'Acertou todas as questões de um quiz', xpBonus: 20  },
  { id: 'streak_3',       name: '3 Dias Seguidos',      icon: '🔥', desc: '3 dias de estudo consecutivos',        xpBonus: 30  },
  { id: 'streak_7',       name: 'Semana Perfeita',      icon: '💪', desc: '7 dias de estudo consecutivos',        xpBonus: 75  },
  { id: 'streak_30',      name: 'Mês Dedicado',         icon: '🏆', desc: '30 dias de estudo consecutivos',       xpBonus: 200 },
  { id: 'trail1_done',    name: 'Fundamentos Sólidos',  icon: '🏅', desc: 'Completou a Trilha 1 completa',        xpBonus: 100 },
  { id: 'trail2_done',    name: 'Arquitetura Profunda', icon: '🥇', desc: 'Completou a Trilha 2 completa',        xpBonus: 150 },
  { id: 'trail3_done',    name: 'Engenheiro de Agentes',icon: '💻', desc: 'Completou a Trilha 3 completa',        xpBonus: 175 },
  { id: 'trail4_done',    name: 'Cloud Practitioner',   icon: '☁️', desc: 'Completou a trilha AWS Cloud Practitioner (CLF-C02)', xpBonus: 200 },
  { id: 'trail5_done',    name: 'Solutions Architect',  icon: '🏛️', desc: 'Completou a trilha AWS Solutions Architect Associate (SAA-C03)', xpBonus: 300 },
  // trail6_done deprecated — kept for backward compat with existing localStorage
  { id: 'trail9_done',    name: 'AI-Native Engineer',    icon: '🧬', desc: 'Completou a trilha de Engenharia AI-Native',           xpBonus: 350 },
  { id: 'trail10_done',   name: 'Distributed Systems',   icon: '🧭', desc: 'Completou a trilha de Sistemas Distribuídos',          xpBonus: 300 },
  { id: 'trail11_done',   name: 'SRE Completo',          icon: '🔭', desc: 'Completou a trilha de Observabilidade & SRE',          xpBonus: 275 },
  { id: 'trail12_done',  name: 'Base Sólida',           icon: '🧱', desc: 'Completou a trilha de Fundamentos Técnicos',             xpBonus: 150 },
  { id: 'trail13_done',  name: 'Claude Code Master',    icon: '⊕', desc: 'Dominou o Claude Code do zero ao poder total',          xpBonus: 250 },
  { id: 'trail18_done',  name: 'Harness Engineer',       icon: '⚙️', desc: 'Dominou harness engineering: system prompt, plugins, hooks, SDK', xpBonus: 350 },
  { id: 'trail17_done',  name: 'API Engineer',          icon: '🔗', desc: 'Dominou a API Claude, MCP, RAG e arquitetura de agents', xpBonus: 300 },
  { id: 'claude_master', name: 'Claude Master',          icon: '🏆', desc: 'Completou Claude Code E API & Agents — domínio total da Anthropic', xpBonus: 200 },
  { id: 'trail14_done',  name: 'Database Engineer',    icon: '🗃️', desc: 'Completou a trilha de SQL & Databases',                  xpBonus: 225 },
  { id: 'trail16_done',  name: 'Network Engineer',     icon: '🌐', desc: 'Completou a trilha de Redes & Web',                      xpBonus: 225 },
  { id: 'all_done',            name: 'Mestre Completo',        icon: '👑', desc: 'Completou TODAS as trilhas',                        xpBonus: 500 },
  // Badges de maestria de trilha (≥80% média de quiz)
  { id: 'trail1_mastery',  name: 'Fundamentos com Honra',  icon: '🏆', desc: 'Completou Fundamentos da IA com ≥80% nos quizzes',    xpBonus: 150 },
  { id: 'trail4_mastery',  name: 'Cloud Expert',           icon: '☁️', desc: 'Completou AWS Practitioner com ≥80% nos quizzes',    xpBonus: 200 },
  { id: 'trail5_mastery',  name: 'Architect Elite',        icon: '🏛️', desc: 'Completou AWS SAA-C03 com ≥80% nos quizzes',         xpBonus: 300 },
  { id: 'trail9_mastery',  name: 'AI-Native Elite',        icon: '🧬', desc: 'Completou Engenharia AI-Native com ≥80% nos quizzes', xpBonus: 350 },
  { id: 'trail13_mastery', name: 'Claude Code Elite',      icon: '⭐', desc: 'Completou Claude Code Master com ≥80% nos quizzes',   xpBonus: 300 },
  { id: 'trail17_mastery', name: 'API Elite',              icon: '🔮', desc: 'Completou API & Agents com ≥80% nos quizzes',        xpBonus: 350 },
  { id: 'speed_run',           name: 'Speed Run',              icon: '⚡', desc: 'Completou 3 módulos no mesmo dia',                  xpBonus: 50  },
  { id: 'curious',             name: 'Muito Curioso',          icon: '🔍', desc: 'Revisitou um módulo já concluído',                  xpBonus: 5   },
  // Badges de maestria progressiva
  { id: 'perfect_5',          name: 'Precisão Cirúrgica',     icon: '🎯', desc: '5 quizzes perfeitos acumulados',                    xpBonus: 50  },
  { id: 'perfect_20',         name: 'Sniper do Conhecimento', icon: '🏹', desc: '20 quizzes perfeitos acumulados',                   xpBonus: 150 },
  { id: 'cards_50',           name: 'Revisor Dedicado',       icon: '📋', desc: 'Revisou 50 cards no SRS',                           xpBonus: 75  },
  { id: 'cards_200',          name: 'Mestre da Revisão',      icon: '🔁', desc: 'Revisou 200 cards no SRS',                          xpBonus: 200 },
  { id: 'modules_25',         name: 'Disciplinado',           icon: '📖', desc: 'Completou 25 módulos',                               xpBonus: 100 },
  { id: 'modules_75',         name: 'Estudioso',              icon: '📚', desc: 'Completou 75 módulos',                               xpBonus: 250 },
  { id: 'two_trails_done',    name: 'Multidisciplinar',       icon: '🎓', desc: 'Completou 2 trilhas completas',                     xpBonus: 150 },
  { id: 'five_trails_done',   name: 'Polímata Tech',          icon: '🌐', desc: 'Completou 5 trilhas completas',                     xpBonus: 400 },
  { id: 'streak_60',          name: '2 Meses Imparável',      icon: '🔥', desc: '60 dias de estudo consecutivos',                    xpBonus: 500 },
  { id: 'marathon',           name: 'Maratonista',            icon: '🏃', desc: '5 módulos em um único dia',                         xpBonus: 100 },
  // Badges de comportamento
  { id: 'weekend_warrior',    name: 'Weekend Warrior',        icon: '🛡️', desc: 'Estudou no sábado E no domingo da mesma semana',    xpBonus: 40  },
  { id: 'early_bird',         name: 'Early Bird',             icon: '🌅', desc: 'Estudou antes das 8h da manhã',                     xpBonus: 25  },
  { id: 'night_owl',          name: 'Coruja Noturna',         icon: '🦉', desc: 'Estudou depois das 22h',                            xpBonus: 25  },
  { id: 'perfect_review',     name: 'Revisão Perfeita',       icon: '💎', desc: '10 cards seguidos sem errar',                       xpBonus: 60  },
  { id: 'streak_14',          name: '2 Semanas Firmes',       icon: '📅', desc: '14 dias de estudo consecutivos',                    xpBonus: 120 },
  { id: 'daily_goal_7',       name: 'Meta Semanal',           icon: '🎯', desc: 'Bateu a meta diária 7 dias seguidos',               xpBonus: 80  },
  { id: 'explorer',           name: 'Explorador',             icon: '🗺️', desc: 'Estudou módulos de 3 hubs diferentes',              xpBonus: 50  },
  { id: 'comeback',           name: 'Volta por Cima',         icon: '🔄', desc: 'Retomou o estudo depois de 7+ dias parado',         xpBonus: 30  },
  // ─── Easter eggs / achievements raros (2026) ────────────────────────────
  { id: 'aurora',             name: 'Aurora',                 icon: '🌅', desc: 'Estudou antes das 6h da manhã (3+ dias)',          xpBonus: 75  },
  { id: 'midnight_oil',       name: 'Óleo da Meia-Noite',     icon: '🕯️', desc: 'Completou um módulo entre 2h e 5h da madrugada',   xpBonus: 60  },
  { id: 'sniper',             name: 'Sniper',                 icon: '🎯', desc: '10 quizzes perfeitos seguidos sem errar',          xpBonus: 200 },
  { id: 'speedrun_trail',     name: 'Speedrun de Trilha',     icon: '⚡', desc: 'Completou uma trilha inteira em menos de 24h',     xpBonus: 250 },
  { id: 'completionist',      name: 'Completionista',         icon: '💯', desc: 'Acertou todos os quizzes de uma trilha (perfect)', xpBonus: 200 },
  { id: 'polyglot',           name: 'Poliglota Tech',         icon: '🌍', desc: 'Estudou módulos de TODOS os 4 hubs',                xpBonus: 100 },
  { id: 'referrer',           name: 'Embaixador',             icon: '🎁', desc: 'Compartilhou um link de convite (?ref=)',          xpBonus: 50  },
  { id: 'invited',            name: 'Convidado',              icon: '🤝', desc: 'Chegou via link de convite de um amigo',           xpBonus: 50  },
  { id: 'cert_first',         name: 'Diploma Estreante',      icon: '🎓', desc: 'Gerou seu primeiro certificado de conclusão',       xpBonus: 75  },
  { id: 'cert_three',         name: 'Triplo Diplomado',       icon: '🏅', desc: 'Concluiu 3 trilhas (3 certificados)',              xpBonus: 250 },
  { id: 'pwa_installed',      name: 'App Instalado',          icon: '📱', desc: 'Instalou a FFV Academy como aplicativo (PWA)',     xpBonus: 40  },
  { id: 'social_butterfly',   name: 'Social',                 icon: '🦋', desc: 'Compartilhou resultado de quiz nas redes',         xpBonus: 30  },
  // ─── Simulados pagos (2026) ─────────────────────────────────────────
  { id: 'simulado_first',             name: 'Primeiro Simulado',    icon: '🎯', desc: 'Completou seu primeiro simulado de certificação',     xpBonus: 100 },
  { id: 'simulado_aws_practitioner',  name: 'AWS Practitioner',     icon: '☁️', desc: 'Passou no simulado AWS Cloud Practitioner',          xpBonus: 200 },
  { id: 'simulado_aws_saa',           name: 'AWS Solutions Architect', icon: '🏛️', desc: 'Passou no simulado AWS SAA-C03',                 xpBonus: 300 },
  // ─── Curriculum v2 (2026-04) — Sprint 1 ────────────────────────────
  { id: 'trail19_done',               name: 'TypeScript Pro',        icon: '🔷', desc: 'Completou a trilha TypeScript Profissional',       xpBonus: 250 },
  // ─── Curriculum v2 (2026-04) — Sprint 2 ────────────────────────────
  { id: 'trail22_done',               name: 'Security Engineer',     icon: '🛡️', desc: 'Completou a trilha Security Engineering',          xpBonus: 300 },
  { id: 'trail23_done',               name: 'AWS Developer',         icon: '🏗️', desc: 'Completou a trilha AWS Developer Associate (DVA-C02)', xpBonus: 275 },
  { id: 'trail36_done',               name: 'Pythonista',            icon: '🐍', desc: 'Completou a trilha Python para Engenheiros',       xpBonus: 250 },
  { id: 'simulado_aws_developer',     name: 'AWS Developer Certified', icon: '🏅', desc: 'Passou no simulado AWS DVA-C02',                xpBonus: 250 },
  // ─── Curriculum v2 (2026-04) — Sprint 3A ───────────────────────────
  { id: 'trail38_done',               name: 'Postgres Deep',         icon: '🐘', desc: 'Completou a trilha Database Deep — Postgres Internals', xpBonus: 300 },
  // ─── Curriculum v2 (2026-04) — Sprint 3B ───────────────────────────
  { id: 'trail24_done',               name: 'Data Engineer',         icon: '🏭', desc: 'Completou a trilha Data Engineering Moderna',     xpBonus: 300 },
  { id: 'trail25_done',               name: 'FT Specialist',         icon: '🎛️', desc: 'Completou a trilha Fine-tuning & Customização de LLMs', xpBonus: 300 },
  { id: 'trail26_done',               name: 'LLM Eval Pro',          icon: '📏', desc: 'Completou a trilha LLM Evals Profissional',        xpBonus: 275 },
  // ─── Curriculum v2 (2026-04) — Sprint 4-5-L ─────────────────────────
  { id: 'trail27_done', name: 'AWS SAP',              icon: '🏛️', desc: 'Completou a trilha AWS Solutions Architect Professional', xpBonus: 400 },
  { id: 'trail28_done', name: 'FinOps',               icon: '💰', desc: 'Completou a trilha FinOps & Cost Engineering',            xpBonus: 275 },
  { id: 'trail29_done', name: 'Multimodal',           icon: '🎙️', desc: 'Completou a trilha Voice, Vision & Multimodal',           xpBonus: 275 },
  { id: 'trail30_done', name: 'Safety Researcher',    icon: '🛡️', desc: 'Completou a trilha AI Safety, Red Teaming & Alinhamento', xpBonus: 300 },
  { id: 'trail47_done', name: 'Gopher',               icon: '🐹', desc: 'Completou a trilha Go Profissional',                      xpBonus: 275 },
  // ─── Curriculum v2 (2026-04) — Sprint 7-8 (Tier 1 + Tier 2) ─────────
  { id: 'trail50_done', name: 'ML Engineer',          icon: '📊', desc: 'Completou a trilha Machine Learning Clássico',            xpBonus: 300 },
  { id: 'trail51_done', name: 'MLOps Engineer',       icon: '🔁', desc: 'Completou a trilha MLOps — ML em produção',               xpBonus: 325 },
  { id: 'trail52_done', name: 'System Designer',      icon: '🧩', desc: 'Completou a trilha System Design Interview Prep',        xpBonus: 325 },
  { id: 'trail54_done', name: 'Polyglot DB',          icon: '🗄️', desc: 'Completou a trilha NoSQL + Vector Databases',            xpBonus: 300 },
  { id: 'trail55_done', name: 'CV Engineer',          icon: '👁️', desc: 'Completou a trilha Computer Vision Clássico',            xpBonus: 300 },
  { id: 'simulado_aws_sap',           name: 'AWS SAP Certified',     icon: '🏅', desc: 'Passou no simulado AWS SAP-C03',                  xpBonus: 400 },
  // ─── Curriculum v3 (2026-05) — Trilha Flipper Zero / Hardware Hacking ────
  { id: 'flipper_first_step',  name: 'Conheceu o Flipper',     icon: '🐬', desc: 'Completou o módulo introdutório de Flipper Zero',                xpBonus: 25  },
  { id: 'sub_ghz_specialist',  name: 'Especialista em Sub-GHz', icon: '📡', desc: 'Completou os 3 módulos de Sub-GHz (modulação, fixos, rolling)',  xpBonus: 100 },
  { id: 'rfid_nfc_master',     name: 'Mestre em RFID/NFC',     icon: '💳', desc: 'Completou os 4 módulos de RFID/NFC (LF, HF, Crypto1, EMV)',      xpBonus: 150 },
  { id: 'dolphin_max',         name: 'Dolphin Maxado',         icon: '🏆', desc: 'Aprendeu a zerar o Dolphin (icounter, butthurt, daily caps)',    xpBonus: 75  },
  { id: 'pentester_etico',     name: 'Pentester Ético',         icon: '⚖️', desc: 'Completou os módulos de ética/legal + frameworks + lab pessoal', xpBonus: 100 },
  // ─── Curriculum v3 (2026-05) — Tier 1+2 expansão ─────────────────────
  { id: 'trail-ai-rlhf-agents_done',     name: 'Agent Engineer',    icon: '🧬', desc: 'Completou AI Engineering Avançado: RLHF & Agents',                 xpBonus: 400 },
  { id: 'trail-diffusion-multimodal_done', name: 'Diffusion Master', icon: '🎨', desc: 'Completou Diffusion & Geração Multimodal',                          xpBonus: 350 },
  { id: 'trail-local-llms-edge_done',    name: 'Edge AI Engineer',  icon: '💻', desc: 'Completou Local LLMs & Edge AI',                                   xpBonus: 350 },
  { id: 'trail-search-ir-deep_done',     name: 'Search Master',     icon: '🔎', desc: 'Completou Search & Information Retrieval Profundo',                xpBonus: 275 },
];
