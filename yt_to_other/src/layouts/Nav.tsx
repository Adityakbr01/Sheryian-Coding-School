import { ModeToggle } from "@/components/mode-toggle"



function Nav() {
    return (
        <nav className="top-nav fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-16 backdrop-blur-sm bg-background/75 border-b border-border">
            <div className="logo-wrap">
                <span className="logo-pill">SHERY</span>
            </div>
            <div className="right">
                <ModeToggle />
            </div>
        </nav>
    )
}

export default Nav
