"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "../theme/theme-provider"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const isDark = theme === "dark"

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="mode-toggle-btn"
        >
            {/* Track */}
            <span className="toggle-track">
                {/* Sliding thumb */}
                <span className={`toggle-thumb ${isDark ? "thumb-dark" : "thumb-light"}`} />

                {/* Icons always visible inside track */}
                <span className="toggle-icon toggle-icon-sun">
                    <Sun size={11} strokeWidth={2.5} />
                </span>
                <span className="toggle-icon toggle-icon-moon">
                    <Moon size={11} strokeWidth={2.5} />
                </span>
            </span>
        </button>
    )
}