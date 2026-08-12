package main

import (
	"encoding/json"
	"testing"
)

// blocosDeJSON monta blocos a partir de um JSON escrito à mão, para os testes
// exercitarem o mesmo caminho que a importação real percorre — inclusive a
// desserialização, que é onde a ordem das chaves do mapa se perde.
func blocosDeJSON(t *testing.T, bruto string) (string, []Block) {
	t.Helper()
	var seed SeedFile
	if err := json.Unmarshal([]byte(bruto), &seed); err != nil {
		t.Fatalf("json inválido no teste: %v", err)
	}
	titulo := ""
	if seed.Title != nil {
		titulo = *seed.Title
	}
	return titulo, seed.Blocks
}

const artigoBase = `{
  "slug": "x",
  "title": "Como o pool de conexão esgota",
  "blocks": [
    {"id": "b1", "type": "paragraph", "position": 0,
     "data": {"content": "O pool tem 20 conexões e a fila cresce sem erro."}},
    {"id": "b2", "type": "section", "position": 1,
     "data": {"title": "Fixando"},
     "children": [
       {"id": "b3", "type": "quiz", "position": 0,
        "data": {"question": "Qual métrica revela a fila?",
                 "options": ["CPU", "dbPoolWaitMs", "Memória"],
                 "correctIndex": 1}}
     ]}
  ]
}`

func Test_contentHash_MesmoConteudo_MesmoHash(t *testing.T) {
	titulo, blocos := blocosDeJSON(t, artigoBase)
	if a, b := contentHash(titulo, blocos), contentHash(titulo, blocos); a != b {
		t.Fatalf("hash não é estável: %s != %s", a, b)
	}
}

// O modo de falha que arruinaria o sinal de uma vez: se reformatar o JSON mudasse
// o hash, o primeiro `prettier` sobre os seeds bumparia a data dos 427 artigos —
// e não haveria como distinguir depois qual foi editado de verdade.
func Test_contentHash_ReformatarJSON_NaoMudaHash(t *testing.T) {
	titulo, blocos := blocosDeJSON(t, artigoBase)
	esperado := contentHash(titulo, blocos)

	// Mesmo conteúdo: indentação diferente, ordem de chave diferente dentro de
	// `data`, CRLF no lugar de LF e espaço à direita nas linhas.
	reformatado := `{"slug":"x","title":"Como o pool de conexão esgota","blocks":[
		{"position":0,"id":"b1","type":"paragraph","data":{"content":"O pool tem 20 conexões e a fila cresce sem erro.   "}},
		{"type":"section","id":"b2","position":1,"data":{"title":"Fixando"},"children":[
			{"data":{"correctIndex":1,"options":["CPU","dbPoolWaitMs","Memória"],"question":"Qual métrica revela a fila?"},"id":"b3","type":"quiz","position":0}
		]}
	]}`
	t2, b2 := blocosDeJSON(t, reformatado)
	if got := contentHash(t2, b2); got != esperado {
		t.Fatalf("reformatar o JSON mudou o hash — o sinal de lastmod ficaria inútil\n  antes: %s\n  depois: %s", esperado, got)
	}
}

// `id` é gerado pelo parser e pode mudar sem o texto mudar. Se entrasse no hash,
// refatorar o parser bumparia a data de todos os artigos de uma vez.
func Test_contentHash_IdDeBloco_NaoEntraNoCalculo(t *testing.T) {
	titulo, blocos := blocosDeJSON(t, artigoBase)
	esperado := contentHash(titulo, blocos)

	for i := range blocos {
		blocos[i].ID = "outro-id-" + blocos[i].ID
		for j := range blocos[i].Children {
			blocos[i].Children[j].ID = "tambem-outro"
		}
	}
	if got := contentHash(titulo, blocos); got != esperado {
		t.Fatal("trocar o id dos blocos mudou o hash — o id não deve entrar no cálculo")
	}
}

func Test_contentHash_TextoEditado_MudaHash(t *testing.T) {
	titulo, blocos := blocosDeJSON(t, artigoBase)
	antes := contentHash(titulo, blocos)

	blocos[0].Data["content"] = "O pool tem 40 conexões e a fila cresce sem erro."
	if depois := contentHash(titulo, blocos); depois == antes {
		t.Fatal("editar o texto de um parágrafo NÃO mudou o hash — a edição passaria invisível")
	}
}

func Test_contentHash_TituloEditado_MudaHash(t *testing.T) {
	titulo, blocos := blocosDeJSON(t, artigoBase)
	antes := contentHash(titulo, blocos)
	if depois := contentHash("Outro título", blocos); depois == antes {
		t.Fatal("trocar o título é editar o artigo, e tem de mudar o hash")
	}
}

// Bloco aninhado é onde vive a maior parte do conteúdo (3.535 `section` com
// filhos na base). Edição em filho que não mudasse o hash seria pior que não ter
// hash: a data ficaria travada no passado justamente para o conteúdo que mais muda.
func Test_contentHash_EdicaoEmBlocoFilho_MudaHash(t *testing.T) {
	titulo, blocos := blocosDeJSON(t, artigoBase)
	antes := contentHash(titulo, blocos)

	blocos[1].Children[0].Data["correctIndex"] = 2
	if depois := contentHash(titulo, blocos); depois == antes {
		t.Fatal("editar bloco filho não mudou o hash")
	}
}

// Indentação dentro de bloco de código É conteúdo: ela aparece na tela. Só espaço
// à DIREITA se descarta.
func Test_normalizarTexto_PreservaIndentacaoDeCodigo(t *testing.T) {
	codigo := "func main() {\n    fmt.Println(\"x\")   \n}"
	got := normalizarTexto(codigo)
	esperado := "func main() {\n    fmt.Println(\"x\")\n}"
	if got != esperado {
		t.Fatalf("normalização mexeu na indentação\n  esperado: %q\n  obtido:   %q", esperado, got)
	}
}

func Test_normalizarTexto_CRLFViraLF(t *testing.T) {
	if got := normalizarTexto("a\r\nb"); got != "a\nb" {
		t.Fatalf("CRLF não normalizado: %q", got)
	}
}

// Reordenar blocos é reordenar o artigo — o leitor lê em ordem diferente.
func Test_contentHash_ReordenarBlocos_MudaHash(t *testing.T) {
	titulo, blocos := blocosDeJSON(t, artigoBase)
	antes := contentHash(titulo, blocos)

	blocos[0].Position, blocos[1].Position = blocos[1].Position, blocos[0].Position
	if depois := contentHash(titulo, blocos); depois == antes {
		t.Fatal("trocar a posição dos blocos não mudou o hash")
	}
}
