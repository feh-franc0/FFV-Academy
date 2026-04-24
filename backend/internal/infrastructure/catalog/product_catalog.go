package catalog

import (
	"fmt"

	"github.com/fernandofv/api/internal/domain/shared"
)

// StaticProductCatalog mapeia productID → Stripe price ID e valor em centavos.
//
// PADRÃO: mapeamento estático embebido no servidor. O frontend usa os mesmos IDs.
// Se o catálogo crescer, migrar para DB ou env var.
type StaticProductCatalog struct {
	prices map[shared.ProductID]string
	amounts map[shared.ProductID]int64
}

// NewStaticProductCatalog cria o catálogo com os produtos configurados via env.
func NewStaticProductCatalog(prices map[shared.ProductID]string, amounts map[shared.ProductID]int64) *StaticProductCatalog {
	return &StaticProductCatalog{prices: prices, amounts: amounts}
}

// NewDefaultProductCatalog cria o catálogo com defaults hard-coded.
// Em produção, os price IDs do Stripe vêm de env vars.
func NewDefaultProductCatalog(simuladoPriceID string) *StaticProductCatalog {
	return &StaticProductCatalog{
		prices: map[shared.ProductID]string{
			"aws-clf": simuladoPriceID,
		},
		amounts: map[shared.ProductID]int64{
			"aws-clf": 4700,
		},
	}
}

func (c *StaticProductCatalog) GetStripePriceID(productID shared.ProductID) (string, error) {
	priceID, ok := c.prices[productID]
	if !ok {
		return "", fmt.Errorf("product catalog: price not found for %q", productID)
	}
	return priceID, nil
}

func (c *StaticProductCatalog) GetAmountCents(productID shared.ProductID) (int64, error) {
	amount, ok := c.amounts[productID]
	if !ok {
		return 0, fmt.Errorf("product catalog: amount not found for %q", productID)
	}
	return amount, nil
}
