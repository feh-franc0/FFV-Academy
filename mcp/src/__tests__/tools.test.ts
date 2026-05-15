import { describe, it, expect } from "vitest";
import {
  HUBS_STATIC,
  TRAILS_STATIC,
  getTrails,
  groupByTrail,
} from "../tools/index.js";
import { buildDiff } from "../util.js";
import type { Article, ArticleListItem } from "../client.js";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: "abc123",
    slug: "artigo-teste",
    title: "Artigo Teste",
    trail_id: "trail1",
    hub_id: "hub-ia",
    content_md: "# Conteúdo atual\n\nTexto de exemplo.",
    xp: 30,
    read_time: 5,
    difficulty: "beginner",
    order: 0,
    published: false,
    ...overrides,
  };
}

function makeListItem(overrides: Partial<ArticleListItem> = {}): ArticleListItem {
  return {
    id: "1",
    slug: "artigo-ia",
    title: "Artigo IA",
    trail_id: "trail1",
    hub_id: "hub-ia",
    xp: 30,
    read_time: 5,
    difficulty: "beginner",
    order: 0,
    published: true,
    ...overrides,
  };
}

// ─── HUBS_STATIC ──────────────────────────────────────────────────────────────

describe("HUBS_STATIC", () => {
  it("contém 8 hubs", () => {
    expect(HUBS_STATIC).toHaveLength(8);
  });

  it("todos os hubs têm id, slug e name", () => {
    for (const hub of HUBS_STATIC) {
      expect(hub.id).toBeTruthy();
      expect(hub.slug).toBeTruthy();
      expect(hub.name).toBeTruthy();
    }
  });

  it("IDs de hubs são únicos", () => {
    const ids = HUBS_STATIC.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("hub-ia está presente com trail1", () => {
    const ia = HUBS_STATIC.find((h) => h.id === "hub-ia");
    expect(ia).toBeDefined();
    expect(ia!.trailIds).toContain("trail1");
  });

  it("hub-claude-anthropic contém as trilhas corretas", () => {
    const claude = HUBS_STATIC.find((h) => h.id === "hub-claude-anthropic");
    expect(claude!.trailIds).toContain("trail13");
    expect(claude!.trailIds).toContain("trail17");
    expect(claude!.trailIds).toContain("trail18");
  });
});

// ─── TRAILS_STATIC ────────────────────────────────────────────────────────────

describe("TRAILS_STATIC", () => {
  it("IDs de trilhas são únicos", () => {
    const ids = TRAILS_STATIC.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("todas as trilhas têm id, hubId e name", () => {
    for (const trail of TRAILS_STATIC) {
      expect(trail.id).toBeTruthy();
      expect(trail.hubId).toBeTruthy();
      expect(trail.name).toBeTruthy();
    }
  });

  it("hubId de todas as trilhas referencia um hub existente", () => {
    const hubIds = new Set(HUBS_STATIC.map((h) => h.id));
    for (const trail of TRAILS_STATIC) {
      expect(hubIds.has(trail.hubId), `trail ${trail.id} tem hubId inválido: ${trail.hubId}`).toBe(true);
    }
  });

  it("trail1 pertence a hub-ia", () => {
    const t = TRAILS_STATIC.find((t) => t.id === "trail1");
    expect(t!.hubId).toBe("hub-ia");
  });

  it("trail39 NÃO está presente (trilha sem hub no currículo)", () => {
    const allIds = (TRAILS_STATIC as ReadonlyArray<{ id: string }>).map((t) => t.id);
    expect(allIds).not.toContain("trail39");
  });

  it("todos os trailIds em HUBS_STATIC existem em TRAILS_STATIC", () => {
    const trailIds = new Set((TRAILS_STATIC as ReadonlyArray<{ id: string }>).map((t) => t.id));
    for (const hub of HUBS_STATIC) {
      for (const trailId of hub.trailIds) {
        expect(trailIds.has(trailId), `hub ${hub.id} lista ${trailId} mas essa trilha não existe em TRAILS_STATIC`).toBe(true);
      }
    }
  });
});

// ─── getTrails ────────────────────────────────────────────────────────────────

describe("getTrails", () => {
  it("sem filtro retorna todas as trilhas", () => {
    const result = getTrails();
    expect(result.trails).toHaveLength(TRAILS_STATIC.length);
    expect(result.total).toBe(TRAILS_STATIC.length);
  });

  it("filtra por hub_id corretamente", () => {
    const result = getTrails("hub-ia");
    expect(result.trails.every((t) => t.hubId === "hub-ia")).toBe(true);
    expect(result.total).toBe(result.trails.length);
    expect(result.total).toBeGreaterThan(0);
  });

  it("hub inexistente retorna lista vazia", () => {
    const result = getTrails("hub-inexistente");
    expect(result.trails).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("hub-fundamentos retorna exatamente 4 trilhas", () => {
    const result = getTrails("hub-fundamentos");
    expect(result.total).toBe(4);
    const ids = result.trails.map((t) => t.id);
    expect(ids).toContain("trail12");
    expect(ids).toContain("trail14");
    expect(ids).toContain("trail15");
    expect(ids).toContain("trail16");
  });
});

// ─── groupByTrail ─────────────────────────────────────────────────────────────

describe("groupByTrail", () => {
  it("lista vazia retorna zero matches e recomendação de criar", () => {
    const result = groupByTrail([], "prompt caching");
    expect(result.total_matches).toBe(0);
    expect(result.trails_touched).toBe(0);
    expect(result.groups).toHaveLength(0);
    expect(result.recommendation).toContain("espaço livre para criar");
  });

  it("agrupa artigos por trail_id", () => {
    const data = [
      makeListItem({ slug: "a1", trail_id: "trail1" }),
      makeListItem({ slug: "a2", trail_id: "trail1" }),
      makeListItem({ slug: "a3", trail_id: "trail2" }),
    ];
    const result = groupByTrail(data, "ia");

    expect(result.total_matches).toBe(3);
    expect(result.trails_touched).toBe(2);
    const trail1Group = result.groups.find((g) => g.trail_id === "trail1");
    expect(trail1Group!.count).toBe(2);
    const trail2Group = result.groups.find((g) => g.trail_id === "trail2");
    expect(trail2Group!.count).toBe(1);
  });

  it("ordena grupos por count decrescente", () => {
    const data = [
      makeListItem({ slug: "a1", trail_id: "trail2" }),
      makeListItem({ slug: "a2", trail_id: "trail1" }),
      makeListItem({ slug: "a3", trail_id: "trail1" }),
      makeListItem({ slug: "a4", trail_id: "trail1" }),
    ];
    const result = groupByTrail(data, "test");
    const [first, second] = result.groups;
    expect(first?.trail_id).toBe("trail1");
    expect(first?.count).toBe(3);
    expect(second?.trail_id).toBe("trail2");
  });

  it("recomendação varia conforme número de matches", () => {
    const poucos = [makeListItem(), makeListItem({ slug: "a2" })];
    expect(groupByTrail(poucos, "t").recommendation).toContain("seguro criar");

    const muitos = [1, 2, 3, 4].map((i) => makeListItem({ slug: `a${i}` }));
    expect(groupByTrail(muitos, "t").recommendation).toContain("revise antes");
  });

  it("inclui note sobre limitação de busca por título", () => {
    const result = groupByTrail([], "qualquer");
    expect(result.note).toContain("TÍTULO");
  });

  it("articles dentro dos grupos têm slug, title e hub_id", () => {
    const data = [makeListItem({ slug: "meu-slug", title: "Meu Título", hub_id: "hub-ia" })];
    const result = groupByTrail(data, "test");
    const article = result.groups[0]?.articles[0];
    expect(article).toEqual({
      slug: "meu-slug",
      title: "Meu Título",
      hub_id: "hub-ia",
    });
  });
});

// ─── buildDiff ────────────────────────────────────────────────────────────────

describe("buildDiff", () => {
  it("sem patches retorna no_changes=true e diff vazio", () => {
    const result = buildDiff(makeArticle(), {});
    expect(result.no_changes).toBe(true);
    expect(result.fields_inspected).toBe(0);
    expect(result.diff).toHaveLength(0);
  });

  it("detecta campo que mudou", () => {
    const result = buildDiff(makeArticle({ title: "Título Antigo" }), { title: "Título Novo" });
    expect(result.fields_changed).toBe(1);
    expect(result.no_changes).toBe(false);
    const entry = result.diff.find((d) => d.field === "title") as { field: string; changed: boolean; before: string; after: string } | undefined;
    expect(entry).toBeDefined();
    expect(entry!.changed).toBe(true);
    expect(entry!.before).toBe("Título Antigo");
    expect(entry!.after).toBe("Título Novo");
  });

  it("detecta campo que NÃO mudou", () => {
    const result = buildDiff(makeArticle({ xp: 30 }), { xp: 30 });
    expect(result.fields_changed).toBe(0);
    expect(result.no_changes).toBe(true);
    const entry = result.diff.find((d) => d.field === "xp");
    expect(entry).toBeDefined();
    expect(entry!.changed).toBe(false);
  });

  it("content_md exibe delta_chars em vez do conteúdo", () => {
    const current = makeArticle({ content_md: "abc" });
    const result = buildDiff(current, { content_md: "abcde" });
    const entry = result.diff.find((d) => d.field === "content_md") as { field: string; changed: boolean; before_length: number; after_length: number; delta_chars: number } | undefined;
    expect(entry).toBeDefined();
    expect(entry!.changed).toBe(true);
    expect(entry!.delta_chars).toBe(2);
    expect(entry!.before_length).toBe(3);
    expect(entry!.after_length).toBe(5);
    expect("before" in entry!).toBe(false);
  });

  it("content_md igual retorna changed=false com delta_chars=0", () => {
    const current = makeArticle({ content_md: "mesmo conteúdo" });
    const result = buildDiff(current, { content_md: "mesmo conteúdo" });
    const entry = result.diff.find((d) => d.field === "content_md") as { field: string; changed: boolean; delta_chars: number } | undefined;
    expect(entry).toBeDefined();
    expect(entry!.changed).toBe(false);
    expect(entry!.delta_chars).toBe(0);
  });

  it("conta corretamente múltiplos campos mistos", () => {
    const current = makeArticle({ title: "Antigo", xp: 30, published: false });
    const result = buildDiff(current, { title: "Novo", xp: 30, published: true });
    expect(result.fields_inspected).toBe(3);
    expect(result.fields_changed).toBe(2);
  });

  it("boolean false→true é detectado como mudança", () => {
    const result = buildDiff(makeArticle({ published: false }), { published: true });
    const entry = result.diff.find((d) => d.field === "published");
    expect(entry!.changed).toBe(true);
  });

  it("content_md undefined no artigo atual não vaza o conteúdo novo no preview", () => {
    const current = makeArticle({ content_md: undefined });
    const result = buildDiff(current, { content_md: "conteúdo novo secreto" });
    const entry = result.diff.find((d) => d.field === "content_md") as { field: string; changed: boolean; before_length: number; after_length: number } | undefined;
    expect(entry).toBeDefined();
    expect(entry!.changed).toBe(true);
    expect(entry!.before_length).toBe(0);
    expect(entry!.after_length).toBe("conteúdo novo secreto".length);
    expect("before" in entry!).toBe(false);
    expect("after" in entry!).toBe(false);
  });
});
