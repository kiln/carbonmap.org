#!/bin/bash

mkdir -p site/jpgs
for f in site/pngs/*.png
do
	dest=${f%.png}
	dest=site/jpgs/${dest#site/pngs/}.jpg
	echo "Converting $f to $dest..."
	convert "$f" -geometry 1124x563 -crop 1024x512+100+0 raw/kiln-logo.png -geometry 116x64+30+420 -composite "$dest"
done
