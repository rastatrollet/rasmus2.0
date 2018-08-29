#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run lint && npm run build -- --modern

# navigate into the build output directory
cd dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://hontas.github.io
# git push -f git@github.com:hontas/hontas.github.io.git master

# if you are deploying to https://hontas.github.io/rasmus2.0
git push -f git@github.com:hontas/rasmus2.0.git master:gh-pages

cd -
