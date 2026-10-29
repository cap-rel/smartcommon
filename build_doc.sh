#!/bin/bash

# build static doc and upload to official website

# Refresh the "Utilisé dans" section of the component pages from the
# consumer projects next to this repository (see scripts/component-usage.mjs).
npm run usage || exit 1

npm run build-storybook || exit 1

rsync -avP storybook-static/ smartmaker.org:/srv/webs/smartmaker.org/htdocs/components/

