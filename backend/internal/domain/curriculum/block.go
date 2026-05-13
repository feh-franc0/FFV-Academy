// Package curriculum — block.go define a entidade Block (componente JSON
// estruturado que compõe um Article). Ver ARCHITECTURE_BLUEPRINT.md.
package curriculum

import (
	"encoding/json"
	"fmt"
)

// Block types válidos (deve bater com CHECK constraint na migration 029).
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
)

// AllBlockTypes lista todos os tipos válidos. Útil para validação e admin UI.
var AllBlockTypes = []string{
	BlockTypeSection, BlockTypeParagraph, BlockTypeCallout, BlockTypeCodeBlock,
	BlockTypeComparisonTable, BlockTypeDecisionBox, BlockTypeFlowDiagram,
	BlockTypeArchFlow, BlockTypeMatrixDiagram, BlockTypeStackFlow,
	BlockTypeTimeline, BlockTypeNodeGraph, BlockTypeAnnotatedFormula,
	BlockTypeQuiz, BlockTypeImage,
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
