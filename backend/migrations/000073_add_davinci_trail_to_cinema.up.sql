-- Adiciona trilha prática DaVinci Resolve 20 (12 mód) ao hub-cinematografia
-- na base cinema. Complementa a trilha teórica de edição (Walter Murch) com
-- hands-on da ferramenta de NLE/grading dominante em Hollywood + indie +
-- YouTube. DaVinci Resolve 20 lançado 28/mai/2025 com 100+ features novas
-- (AI IntelliScript, IntelliCut, Voice Convert, layered PSD/EXR no Fusion).
--
-- Idempotente.

UPDATE bases SET
    modules = 112,
    trails = 11,
    area_label = 'Linguagem · Roteiro · DP · Direção · Edição · Som · Produção · VLOG · DaVinci Resolve 20',
    description = 'Cinema com profundidade de conservatório, em PT-BR: linguagem (Kuleshov/Eisenstein/Bazin), roteiro (Save the Cat/McKee), storytelling visual (Storaro/Damasio), câmera ARRI Alexa 35 / Sony Venice 2 / RED V-Raptor, direção de fotografia (Deakins/Lubezki/Khondji), mise-en-scène (Villeneuve/Fincher), edição (Walter Murch — Regra dos Seis), som & trilha (Williams/Zimmer/Greenwood), produção (ANCINE/Cannes/agente/reel), VLOG cinemático + construção de comunidade (Casey Neistat/Peter McKinnon/Mr Beast/David Spinks) e DaVinci Resolve 20 prático (7 Pages, color grading nodes, Fusion VFX, Fairlight Atmos, AI IntelliScript/IntelliCut/Voice Convert, workflows reais vlog/curta/série).'
WHERE slug = 'cinema';
