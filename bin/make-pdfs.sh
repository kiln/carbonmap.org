#!/bin/bash

mkdir -p site/pdfs
for f in site/svgs/*.svg
do
	dest=${f%.svg}
	dest=site/pdfs/${dest#site/svgs/}.pdf
	echo "Converting $f to $dest..."
	/Applications/Inkscape.app/Contents/Resources/bin/inkscape -f "$f" --export-pdf="$dest" 2>/dev/null
done
