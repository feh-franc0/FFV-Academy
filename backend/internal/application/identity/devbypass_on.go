//go:build devbypass

package identity

import "strings"

// devBypassToken é o código fixo aceito como atalho em dev local quando o build
// inclui a tag `devbypass` E o use case está em devMode. Não é configurável de
// propósito — qualquer override aumentaria a chance de regressão de segurança.
const devBypassToken = "000000"

// isDevBypassRequest retorna true se este request casa com o bypass de
// desenvolvimento — ou seja: o binário foi compilado com `-tags devbypass`,
// o use case foi instanciado com devMode=true (APP_ENV=development) e o token
// recebido é exatamente devBypassToken (após trim).
//
// O par {build tag, runtime devMode} é AND, não OR: precisa dos dois.
func isDevBypassRequest(token string, devMode bool) bool {
	return devMode && strings.TrimSpace(token) == devBypassToken
}
