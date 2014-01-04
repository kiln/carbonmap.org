#!/bin/bash

perl -ne 'print "$1 $2\n" if m{^\s*file '\''4k-output/([^.]+)\.freeze-([\d.]+)\.mov'\''}' 4k-composite.txt \
| while read line
do
    echo $line
done
