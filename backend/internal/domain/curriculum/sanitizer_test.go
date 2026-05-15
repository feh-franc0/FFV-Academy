package curriculum

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestSanitizeString_StripsScript(t *testing.T) {
	cases := []string{
		`<script>alert(1)</script>`,
		`</script><script>alert(1)</script>`,
		`<img src=x onerror=alert(1)>`,
		`<iframe src="javascript:alert(1)"></iframe>`,
		`<a href="javascript:alert(1)">click</a>`,
	}
	for _, in := range cases {
		out := SanitizeString(in)
		low := strings.ToLower(out)
		if strings.Contains(low, "<script") || strings.Contains(low, "</script") {
			t.Errorf("script não removido em %q → %q", in, out)
		}
		if strings.Contains(low, "onerror=") {
			t.Errorf("onerror não removido em %q → %q", in, out)
		}
		if strings.Contains(low, "javascript:") {
			t.Errorf("javascript: não removido em %q → %q", in, out)
		}
	}
}

func TestValidateBlockURLs_AcceptsSafeProtocols(t *testing.T) {
	for _, url := range []string{
		"https://example.com",
		"http://example.com",
		"mailto:a@b.com",
		"/internal/path",
		"#anchor",
	} {
		data, _ := json.Marshal(map[string]any{
			"content": []any{map[string]any{"text": "x", "link": url}},
		})
		b := &Block{ID: "id1", Type: BlockTypeParagraph, Data: data}
		if err := ValidateBlockURLs(b); err != nil {
			t.Errorf("URL segura rejeitada: %s → %v", url, err)
		}
	}
}

func TestValidateBlockURLs_RejectsDangerousProtocols(t *testing.T) {
	dangerous := []string{
		"javascript:alert(1)",
		"JaVaScRiPt:alert(1)",
		"data:text/html,<script>alert(1)</script>",
		"vbscript:msgbox(1)",
		"file:///etc/passwd",
	}
	for _, url := range dangerous {
		data, _ := json.Marshal(map[string]any{
			"content": []any{map[string]any{"text": "x", "link": url}},
		})
		b := &Block{ID: "id1", Type: BlockTypeParagraph, Data: data}
		if err := ValidateBlockURLs(b); err == nil {
			t.Errorf("URL perigosa aceita: %s", url)
		}
	}
}

func TestValidateBlockURLs_RejectsInImageSrc(t *testing.T) {
	data, _ := json.Marshal(map[string]any{"src": "javascript:alert(1)", "alt": "x"})
	b := &Block{ID: "img1", Type: BlockTypeImage, Data: data}
	if err := ValidateBlockURLs(b); err == nil {
		t.Error("javascript: em image.src deveria ser rejeitado")
	}
}

func TestValidateBlockURLs_Recursive_ChildBlocks(t *testing.T) {
	parentData, _ := json.Marshal(map[string]any{"title": "ok"})
	childData, _ := json.Marshal(map[string]any{
		"content": []any{map[string]any{"text": "x", "link": "data:text/html,<script>"}},
	})
	parent := &Block{ID: "p", Type: BlockTypeSection, Data: parentData,
		Children: []*Block{{ID: "c", Type: BlockTypeParagraph, Data: childData}},
	}
	if err := ValidateBlockURLs(parent); err == nil {
		t.Error("URL perigosa em child block deveria ser rejeitada")
	}
}

func TestSanitizeBlock_RemovesScriptFromText(t *testing.T) {
	data, _ := json.Marshal(map[string]any{
		"variant": "info",
		"title":   "Atenção <script>alert(1)</script>",
		"content": "texto </script><script>alert(1)</script>",
	})
	b := &Block{ID: "cb", Type: BlockTypeCallout, Data: data}
	out, err := SanitizeBlock(b)
	if err != nil {
		t.Fatalf("SanitizeBlock falhou: %v", err)
	}
	var decoded map[string]any
	if err := json.Unmarshal(out.Data, &decoded); err != nil {
		t.Fatalf("re-decode: %v", err)
	}
	title, _ := decoded["title"].(string)
	content, _ := decoded["content"].(string)
	if strings.Contains(strings.ToLower(title), "<script") {
		t.Errorf("script em title não removido: %q", title)
	}
	if strings.Contains(strings.ToLower(content), "<script") {
		t.Errorf("script em content não removido: %q", content)
	}
}

func TestSanitizeBlock_PreservesCodeBlockContent(t *testing.T) {
	// Code block deve preservar literalmente — é render em <pre><code> e escapado por JSX.
	data, _ := json.Marshal(map[string]any{
		"language": "html",
		"code":     "<script>alert(1)</script>", // literal didático
	})
	b := &Block{ID: "code1", Type: BlockTypeCodeBlock, Data: data}
	out, err := SanitizeBlock(b)
	if err != nil {
		t.Fatalf("SanitizeBlock falhou: %v", err)
	}
	var decoded map[string]any
	_ = json.Unmarshal(out.Data, &decoded)
	if decoded["code"] != "<script>alert(1)</script>" {
		t.Errorf("code_block deveria preservar literal, got %v", decoded["code"])
	}
}

func TestSanitizeArticleContent_RemovesScript(t *testing.T) {
	in := `# Título

<script>alert(1)</script>

Texto normal <img src=x onerror=alert(1)> mais texto.`
	out := SanitizeArticleContent(in)
	if strings.Contains(strings.ToLower(out), "<script") {
		t.Errorf("script não removido: %q", out)
	}
	if strings.Contains(strings.ToLower(out), "onerror") {
		t.Errorf("onerror não removido: %q", out)
	}
}

func TestIsAllowedURL(t *testing.T) {
	allowed := []string{"https://x", "HTTP://x", "mailto:a@b", "/p", "#a"}
	for _, u := range allowed {
		if !isAllowedURL(u) {
			t.Errorf("deveria aceitar %q", u)
		}
	}
	denied := []string{"javascript:1", "data:x", "vbscript:1", "file:///x", "ftp://x"}
	for _, u := range denied {
		if isAllowedURL(u) {
			t.Errorf("deveria rejeitar %q", u)
		}
	}
}
