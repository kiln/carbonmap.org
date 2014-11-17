#!/bin/bash

mkdir -p site/pngs
for f in site/pdfs/*.pdf
do
	dest=${f%.pdf}
	dest=site/pngs/${dest#site/pdfs/}
	echo "Converting $f to $dest.png..."
	pdftocairo -r 400 -singlefile -png "$f" "$dest"
done
