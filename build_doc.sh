#!/bin/bash

# build static doc and upload to official website

npm run build-storybook

rsync -avP storybook-static/ smartmaker.org:/srv/webs/smartmaker.org/htdocs/components/

