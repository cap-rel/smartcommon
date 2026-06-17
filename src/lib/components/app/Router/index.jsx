import { BrowserRouter, HashRouter } from "react-router-dom";

// `type`: "browser" (default) | "hash".
//  - "browser" : history API, jolies URLs. `basename` permet de servir l'app
//    sous un sous-chemin (ex "/custom/module/pwa").
//  - "hash" : routing par fragment (#/...). Nécessaire quand l'app est servie
//    sous un sous-chemin sans réécriture serveur, ou pour des deep links par
//    hash (ex handoff "#/handoff?..."). Le hash ignore le path, donc pas de
//    basename utile ici.
// Rétro-compatibilité : sans props, c'est un <BrowserRouter> nu, identique à
// l'implémentation historique.
export const Router = (props) => {
    const { children, type = "browser", basename } = props;

    if (type === "hash") {
        return (
            <HashRouter>
                {children}
            </HashRouter>
        );
    }

    return (
        <BrowserRouter basename={basename}>
            {children}
        </BrowserRouter>
    );
};
