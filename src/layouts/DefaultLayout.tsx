import type {FunctionComponent, ReactNode} from "react";

export const DefaultLayout: FunctionComponent<{ children: ReactNode }> = ({children}) => {
    return <>
        <header>
            <h1>My App</h1>
        </header>
        <main>
            {children}
        </main>
    </>
}