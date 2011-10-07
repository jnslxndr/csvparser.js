#!/usr/bin/env bash

NAME="csvparser.all.min.js"
FILES="CopyRight.js EventEmitter.js ncsv.js"

if [[ -d "./build" ]]; then
	rm -rdf ./build
fi

mkdir -p ./build
NAME=./../build/$NAME

# compile again:
coffee -c src/*.coffee

# Options see: https://github.com/mishoo/UglifyJS
cd src && cat $FILES | uglifyjs -mt > $NAME && cd ..

