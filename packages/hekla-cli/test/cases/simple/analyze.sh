#!/bin/bash

rm -rf test/cases/simple/dist/
mkdir -p test/cases/simple/dist/
./bin/hekla analyze --config ./test/cases/simple/hekla.config.js
