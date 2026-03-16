import { Link, Outlet } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export const PublicLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 border-b border-border bg-background">
                <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Link to="/" className="font-mono text-primary font-semibold text-sm">
                        daily.md
                    </Link>
                    <Link
                        to="/login"
                        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                    >
                        Sign in
                    </Link>
                </div>
            </header>
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="border-t border-border">
                <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">© 2026 daily.md</span>
                </div>
            </footer>
        </div>
    )
}
