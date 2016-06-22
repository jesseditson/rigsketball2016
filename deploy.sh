#!/bin/bash

set -e

ember build --environment=production

node -e "var p = require('./package.json'); delete p.devDependencies; require('fs').writeFileSync('package.prod.json', JSON.stringify(p, null, 2), 'utf-8');";

mv package.json _package.json
mv package.prod.json package.json

rm -rf tmp
now
now alias $(pbpaste) rigsketball.com

mv _package.json package.json
