# Spec — Ecossistema AWS para IA

> **Este arquivo é só um ponteiro.** O plano completo de execução — estrutura dos
> 6 módulos, entradas prontas do `curriculum.ts`, tabela de migração dos módulos
> absorvidos, specs de diagrama, tópicos de quiz, armadilhas conhecidas e
> definição de pronto — vive em:
>
> ### 📄 [`PLANO_ECOSSISTEMA_AWS_IA.md`](../../../PLANO_ECOSSISTEMA_AWS_IA.md) (raiz do repo)
>
> Mantido em um arquivo só de propósito: dois documentos divergem.

**Antes de escrever qualquer módulo, leia também:**

- [`_BEDROCK_AUTHORING_SPEC.md`](./_BEDROCK_AUTHORING_SPEC.md) — shape exato de
  cada tipo de bloco, incluindo `aws_diagram`.
- [`../_catalogo-servicos-aws.json`](../_catalogo-servicos-aws.json) — os 106
  serviços com módulo, prioridade e papel. Fonte da verdade.

**Pauta de autoria e verificação de cobertura:**

```bash
python3 scripts/validate_cobertura_servicos.py --pendente   # o que falta escrever
python3 scripts/validate_cobertura_servicos.py              # 0 erros = série pronta
```
