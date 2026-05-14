#!/usr/bin/env python3
"""Importer one-shot: lê news.json + playlists.ts e popula news_articles + playlists.

Idempotente — UPSERT por slug.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FRONTEND = ROOT / 'frontend'

def psql(sql: str) -> None:
    """Executa SQL via docker exec no postgres dev."""
    result = subprocess.run(
        ['docker', 'exec', '-i', 'deployments-postgres-1', 'psql', '-U', 'ffv', '-d', 'ffv_dev', '-c', sql],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        print(f'SQL ERROR: {result.stderr}', file=sys.stderr)
        print(f'SQL: {sql[:200]}', file=sys.stderr)
        sys.exit(1)


def esc(s: str) -> str:
    return s.replace("'", "''")


def import_news() -> int:
    data = json.loads((FRONTEND / 'src/data/news.json').read_text())
    items = data.get('items', [])
    count = 0
    for n in items:
        slug = n['id']  # frontend chamava de id; backend chama slug
        tags_json = json.dumps(n.get('tags', []))
        image_url = n.get('imageUrl')
        hot = n.get('hot', False)
        # UPSERT
        sql = f"""
INSERT INTO news_articles (slug, title, summary, source, source_url, image_url, category, hot, tags, published_at, status)
VALUES (
  '{esc(slug)}',
  '{esc(n['title'])}',
  '{esc(n['summary'])}',
  '{esc(n['source'])}',
  '{esc(n['sourceUrl'])}',
  {f"'{esc(image_url)}'" if image_url else 'NULL'},
  '{esc(n['category'])}',
  {'true' if hot else 'false'},
  '{esc(tags_json)}'::jsonb,
  '{esc(n['publishedAt'])}'::date,
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, summary = EXCLUDED.summary, source = EXCLUDED.source,
  source_url = EXCLUDED.source_url, image_url = EXCLUDED.image_url,
  category = EXCLUDED.category, hot = EXCLUDED.hot, tags = EXCLUDED.tags,
  published_at = EXCLUDED.published_at, updated_at = now();
"""
        psql(sql)
        count += 1
    return count


def parse_playlists_ts() -> list:
    """Parse playlists.ts AST simplificado — extrai o array PLAYLISTS."""
    text = (FRONTEND / 'src/lib/playlists.ts').read_text()
    # Acha o bloco PLAYLISTS = [ ... ];
    m = re.search(r'export const PLAYLISTS:[^=]*=\s*(\[[\s\S]*?\n\];)', text)
    if not m:
        print('PLAYLISTS array não encontrado', file=sys.stderr)
        return []
    block = m.group(1)
    # Extrai cada objeto via regex grosseiro mas funcional
    objs = re.findall(r'\{([\s\S]*?)\},', block)
    out = []
    for ob in objs:
        d = {}
        for field in ['id', 'title', 'subtitle', 'audience', 'color', 'emoji']:
            mm = re.search(rf'{field}:\s*[\'"]([^\'"]+)[\'"]', ob)
            if mm:
                d[field] = mm.group(1)
        # moduleSlugs: array de strings
        slugs_match = re.search(r'moduleSlugs:\s*\[([\s\S]*?)\]', ob)
        if slugs_match:
            slugs_block = slugs_match.group(1)
            slugs = re.findall(r"'([^']+)'", slugs_block)
            d['moduleSlugs'] = slugs
        else:
            d['moduleSlugs'] = []
        if 'id' in d:
            out.append(d)
    return out


def import_playlists() -> int:
    items = parse_playlists_ts()
    count = 0
    for i, p in enumerate(items):
        slugs_json = json.dumps(p.get('moduleSlugs', []))
        sql = f"""
INSERT INTO playlists (slug, title, subtitle, audience, color, emoji, module_slugs, "order", status)
VALUES (
  '{esc(p['id'])}',
  '{esc(p.get('title', ''))}',
  '{esc(p.get('subtitle', ''))}',
  '{esc(p.get('audience', ''))}',
  '{esc(p.get('color', '#58a6ff'))}',
  '{esc(p.get('emoji', ''))}',
  '{esc(slugs_json)}'::jsonb,
  {i},
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, audience = EXCLUDED.audience,
  color = EXCLUDED.color, emoji = EXCLUDED.emoji, module_slugs = EXCLUDED.module_slugs,
  "order" = EXCLUDED."order", updated_at = now();
"""
        psql(sql)
        count += 1
    return count


def import_cheatsheets() -> int:
    """Seed mínimo de cheatsheets — placeholders pros 5 existentes."""
    items = [
        ('postgres', '🐘', 'Postgres essencial', 'Índices, EXPLAIN ANALYZE, MVCC, VACUUM, transações, backup/restore.', '#336791', 0),
        ('git', '🌿', 'Git avançado', 'Rebase, reflog, bisect, worktree, cherry-pick, submodules, hooks.', '#f05032', 1),
        ('kubernetes', '☸️', 'Kubernetes diário', 'kubectl, YAML por resource, troubleshooting, RBAC, NetworkPolicy.', '#326ce5', 2),
        ('rust', '🦀', 'Rust essencial', 'Ownership, borrow rules, lifetimes, traits canônicos, cargo.', '#b7410e', 3),
        ('system-design', '🧩', 'System Design prep', 'Framework de interview, back-of-envelope, padrões canônicos.', '#ea580c', 4),
    ]
    body_placeholder = '''# Cheatsheet

Este cheatsheet ainda não foi migrado para o CMS — a versão estática continua disponível em `/cheatsheets/{slug}` enquanto o time editorial converte para markdown.

## Como contribuir

1. Edite via `/admin/cheatsheets/edit?slug={slug}`
2. Conteúdo em markdown puro
3. Code blocks via triple backticks com linguagem

## Status

Migrado: estrutura ok. Conteúdo: pendente conversão.
'''
    count = 0
    for slug, emoji, title, subtitle, accent, order in items:
        body = body_placeholder.format(slug=slug)
        sql = f"""
INSERT INTO cheatsheets (slug, title, subtitle, accent, emoji, body_md, "order", status)
VALUES (
  '{esc(slug)}', '{esc(title)}', '{esc(subtitle)}',
  '{esc(accent)}', '{esc(emoji)}',
  '{esc(body)}', {order}, 'published'
)
ON CONFLICT (slug) DO NOTHING;
"""
        psql(sql)
        count += 1
    return count


if __name__ == '__main__':
    print('Importando news...')
    n_news = import_news()
    print(f'  → {n_news} news_articles')

    print('Importando playlists...')
    n_play = import_playlists()
    print(f'  → {n_play} playlists')

    print('Seed cheatsheets (placeholders)...')
    n_cheat = import_cheatsheets()
    print(f'  → {n_cheat} cheatsheets')

    print(f'\nTotal: {n_news + n_play + n_cheat} registros.')
