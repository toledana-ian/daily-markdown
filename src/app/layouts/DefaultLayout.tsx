import { Outlet } from '@tanstack/react-router'

export const DefaultLayout = () => {
    return <>
        <header>
            <h1>My App</h1>
        </header>
        <main>
            <Outlet />
        </main>
    </>
}
