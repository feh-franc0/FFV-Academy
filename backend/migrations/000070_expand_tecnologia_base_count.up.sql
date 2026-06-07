-- Expande contagem da base tecnologia após +6 trilhas preenchendo buracos
-- identificados na auditoria jun/2026: compiladores (10), OS deep (10),
-- hardware moderno (8), paradigmas de programação além OOP (10), end-to-end
-- full-stack (10) e mercado tech 2026 (10). Total +58 módulos.
--
-- Trilhas distribuídas:
--   hub-fundamentos:  +3 (compiladores, sistemas-operacionais, hardware-moderno)
--   hub-programacao:  +1 (paradigmas-programacao)
--   hub-construcao:   +1 (end-to-end-web)
--   hub-engenharia:   +1 (mercado-tech-2026)
--
-- Idempotente.

UPDATE bases SET
    modules = 215,
    trails = 22,
    area_label = 'IA · AWS · Engenharia · Programação · Hardware · OS · Compiladores · Mercado Tech',
    description = 'Sistemas distribuídos, IA aplicada, AWS, backend, frontend, dados, paradigmas além de OOP (funcional/Lispian/Elixir/Prolog), compiladores deep (Lexer/Parser/AST/JIT/LLVM/GC), OS por dentro (schedulers EEVDF/syscalls/containers internals/eBPF), hardware moderno (CPU superscalar/cache coherency/GPU CUDA/ARM vs x86 vs RISC-V), end-to-end full-stack 2026 (ideia ao no ar) e mercado tech (FAANG levels.fyi/comp packages/H1B vs O-1).'
WHERE slug = 'tecnologia';
