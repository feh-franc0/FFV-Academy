//go:build !devbypass

package identity

// isDevBypassRequest indica se o magic-link request é o "código de bypass" usado em
// desenvolvimento local. Em builds SEM a tag `devbypass` (default — incluindo CI,
// Docker de produção e qualquer compilação padrão), a função SEMPRE retorna false.
// O código do bypass nem existe no binário deployado.
//
// Para habilitar o bypass em dev local, compile com:
//
//	go run -tags devbypass ./cmd/api    (ou `make run-dev`)
//
// Isso garante defesa em profundidade: mesmo que APP_ENV vaze como "development"
// em produção (regressão de config), o bypass não pode ser ativado.
func isDevBypassRequest(_ string, _ bool) bool {
	return false
}
