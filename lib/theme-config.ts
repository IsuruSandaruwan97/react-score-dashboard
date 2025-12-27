export type ThemeMode = "default" | "xmas"

export function getTheme(): ThemeMode {
  const theme = process.env.NEXT_PUBLIC_THEME
  return theme === "xmas" ? "xmas" : "default"
}

export function isChristmasTheme(): boolean {
  return getTheme() === "xmas"
}
