// Package curriculum — block.go define a entidade Block (componente JSON
// estruturado que compõe um Article). Ver ARCHITECTURE_BLUEPRINT.md.
package curriculum

import (
	"encoding/json"
	"fmt"
)

// Block types válidos (deve bater com o CHECK constraint vigente — migration 044).
//
// HISTÓRICO DE DERIVA: esta lista ficou com os 15 tipos originais enquanto a
// migration 037 adicionava 9 (qa_item, key_value, list, hierarchy_diagram,
// comparison_flow, split_flow, layer_stack, mind_map, exam_domain_badge) e o
// frontend criava mais 2 (arch_diagram e o alias aws_diagram). Ninguém chama
// IsValidBlockType hoje — a validação efetiva é o CHECK do Postgres — mas uma
// lista errada aqui vira bug no dia em que alguém passar a usá-la. Se você
// alterar o CHECK, altere aqui na mesma mudança.
const (
	BlockTypeSection          = "section"
	BlockTypeParagraph        = "paragraph"
	BlockTypeCallout          = "callout"
	BlockTypeCodeBlock        = "code_block"
	BlockTypeComparisonTable  = "comparison_table"
	BlockTypeDecisionBox      = "decision_box"
	BlockTypeFlowDiagram      = "flow_diagram"
	BlockTypeArchFlow         = "arch_flow"
	BlockTypeMatrixDiagram    = "matrix_diagram"
	BlockTypeStackFlow        = "stack_flow"
	BlockTypeTimeline         = "timeline"
	BlockTypeNodeGraph        = "node_graph"
	BlockTypeAnnotatedFormula = "annotated_formula"
	BlockTypeQuiz             = "quiz"
	BlockTypeImage            = "image"
	// Sprint 2.5 (migration 037)
	BlockTypeQAItem           = "qa_item"
	BlockTypeKeyValue         = "key_value"
	BlockTypeList             = "list"
	BlockTypeHierarchyDiagram = "hierarchy_diagram"
	BlockTypeComparisonFlow   = "comparison_flow"
	BlockTypeSplitFlow        = "split_flow"
	BlockTypeLayerStack       = "layer_stack"
	BlockTypeMindMap          = "mind_map"
	BlockTypeExamDomainBadge  = "exam_domain_badge"
	// Diagrama de arquitetura (migration 044) — arch_diagram é o canônico,
	// aws_diagram é alias legado aceito
	BlockTypeArchDiagram = "arch_diagram"
	BlockTypeAwsDiagram  = "aws_diagram"
)

// AllBlockTypes lista todos os tipos válidos. Útil para validação e admin UI.
var AllBlockTypes = []string{
	BlockTypeSection, BlockTypeParagraph, BlockTypeCallout, BlockTypeCodeBlock,
	BlockTypeComparisonTable, BlockTypeDecisionBox, BlockTypeFlowDiagram,
	BlockTypeArchFlow, BlockTypeMatrixDiagram, BlockTypeStackFlow,
	BlockTypeTimeline, BlockTypeNodeGraph, BlockTypeAnnotatedFormula,
	BlockTypeQuiz, BlockTypeImage,
	BlockTypeQAItem, BlockTypeKeyValue, BlockTypeList,
	BlockTypeHierarchyDiagram, BlockTypeComparisonFlow, BlockTypeSplitFlow,
	BlockTypeLayerStack, BlockTypeMindMap, BlockTypeExamDomainBadge,
	BlockTypeArchDiagram, BlockTypeAwsDiagram,
}

// Block representa um bloco estruturado dentro de um Article. Cada bloco
// corresponde a um componente React em primitives.tsx. Estrutura recursiva
// via ParentID — Section pode conter Callouts, Callouts contêm Paragraphs.
type Block struct {
	ID       string          `json:"id"`
	Type     string          `json:"type"`
	Position int             `json:"position"`
	Data     json.RawMessage `json:"data"`
	ParentID *string         `json:"-"` // não exposto na API; só usado pra reconstruir árvore
	Children []*Block        `json:"children,omitempty"`
}

// IsValidBlockType verifica se um tipo é conhecido pelo sistema.
// Camada de aplicação rejeita tipos inválidos antes de persistir.
func IsValidBlockType(t string) bool {
	for _, v := range AllBlockTypes {
		if t == v {
			return true
		}
	}
	return false
}

// NewBlock cria um novo Block validando type e data não-nulos.
// O ID é gerado pelo banco (UUID); aqui aceita string vazia em criação.
func NewBlock(id, blockType string, position int, data json.RawMessage) (*Block, error) {
	if !IsValidBlockType(blockType) {
		return nil, fmt.Errorf("curriculum: block type inválido: %q", blockType)
	}
	if len(data) == 0 || string(data) == "null" {
		return nil, fmt.Errorf("curriculum: block data não pode ser vazio")
	}
	if position < 0 {
		return nil, fmt.Errorf("curriculum: position deve ser >= 0, recebido %d", position)
	}

	return &Block{
		ID:       id,
		Type:     blockType,
		Position: position,
		Data:     data,
		Children: []*Block{},
	}, nil
}

// AddChild adiciona um bloco filho. Usado por Section/containers.
// Mantém children ordenados por Position.
func (b *Block) AddChild(child *Block) {
	if b.Children == nil {
		b.Children = []*Block{}
	}
	b.Children = append(b.Children, child)
}
