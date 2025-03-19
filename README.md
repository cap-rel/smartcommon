# SmartBoot

mobile
    public
        images
        .htaccess
    src
        assets
            styles (juste un index.css, voir si on peut importer les classes)
        components
            index.jsx
            app
                ... tous composants app
            pages
                LoginPage.comp
                HomePage.comp
        globals
            functions
                index.js
            constants
                vite.js
                index.js
        hooks
            index.jsx
        i18n
            languages
                en.json
                fr.json
            index.js
        reduxStore
            reducers
                authSlice.js
            index.js
        App.comp (peut-être avec un SmartProvider)
        main.jsx
    tailwind-extend
        index.js
    .env.example
    .eslintrc.cjs
    index.html
    postcss.config.js
    tailwind.config.js
    vite.config.js
    package-lock.json
    package.json
    .gitignore
    README.md

# SmartCommon

    public
        images
        .htaccess
    src
        assets
            styles
        components
        globals
        hooks
        index.js
    tailwind-extend
    test-interface (à développer)
    .eslintrc.cjs
    postcss.config.js
    tailwind.config.js
    vite.config.js
    package-lock.json
    package.json
    .gitignore
    README.md