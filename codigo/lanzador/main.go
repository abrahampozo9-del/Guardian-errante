// El Guardián Errante — lanzador para Windows.
// Abre el juego en su propia ventana (Edge o Chrome en modo aplicación, sin barras de navegador).
// Siempre carga la última versión publicada en GitHub y funciona sin conexión gracias a la caché del juego.
package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"syscall"
)

const url = "https://abrahampozo9-del.github.io/Guardian-errante/?pc=1"

func main() {
	local := os.Getenv("LOCALAPPDATA")
	if local == "" {
		local = os.TempDir()
	}
	perfil := filepath.Join(local, "GuardianErrante", "perfil")
	_ = os.MkdirAll(perfil, 0o755)

	pf, pf86 := os.Getenv("ProgramFiles"), os.Getenv("ProgramFiles(x86)")
	candidatos := []string{
		filepath.Join(pf86, `Microsoft\Edge\Application\msedge.exe`),
		filepath.Join(pf, `Microsoft\Edge\Application\msedge.exe`),
		filepath.Join(pf, `Google\Chrome\Application\chrome.exe`),
		filepath.Join(pf86, `Google\Chrome\Application\chrome.exe`),
		filepath.Join(local, `Google\Chrome\Application\chrome.exe`),
		filepath.Join(pf, `BraveSoftware\Brave-Browser\Application\brave.exe`),
	}
	args := []string{
		"--app=" + url,
		"--user-data-dir=" + perfil,
		"--window-size=1280,760",
		"--no-first-run",
		"--no-default-browser-check",
		"--disable-features=Translate",
		"--autoplay-policy=no-user-gesture-required",
	}
	for _, c := range candidatos {
		if _, err := os.Stat(c); err == nil {
			cmd := exec.Command(c, args...)
			if cmd.Start() == nil {
				return
			}
		}
	}
	// sin Edge ni Chrome: se abre en el navegador por defecto
	cmd := exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	_ = cmd.Start()
}
