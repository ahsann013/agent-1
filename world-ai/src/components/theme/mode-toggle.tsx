import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme/theme-provider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-8 w-14 items-center rounded-full bg-primary/20 transition-colors hover:bg-primary/30"
    >
      <div
        className={`${
          theme === "light" ? "translate-x-7" : "translate-x-1"
        } inline-block h-6 w-6 transform rounded-full bg-primary transition-transform duration-200`}
      >
        {theme === "light" ? (
          <Sun className="h-4 w-4 m-1 text-background" />
        ) : (
          <Moon className="h-4 w-4 m-1 text-background" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
