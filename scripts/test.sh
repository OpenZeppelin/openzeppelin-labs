#!/usr/bin/env bash

for D in `find . -maxdepth 1 -type d \( ! -name . \)`
do
  cd $D
  if [ -f package.json ]; then
    echo "Running tests from $D"
    npm test
  fi
  cd ..
done
