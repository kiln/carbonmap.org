#!/bin/bash

for cart in carbonmap/data/Maps/Cartogram\ data/*.cart
do
  d=${cart##*/}; d=${d%.cart}
  echo "Generating $d.svg..."
  bin/as-svg.py \
    --map=world-robinson \
    --cart="$cart" \
    --simplification=0 \
    --static \
    --output-grid=64605x32767 \
    --stroke-width=0.1 \
    --exclude-regions=AQ \
    --style=carbonmap/data/Shading/CSS/Continents.css \
    --output=carbonmap/site/svgs/$d.svg
done

echo "Generating raw.svg"
bin/as-svg.py \
  --map=world-robinson \
  --simplification=0 \
  --static \
  --output-grid=64605x32767 \
  --stroke-width=0.1 \
  --exclude-regions=AQ \
  --style=carbonmap/data/Shading/CSS/Continents.css \
  --output=carbonmap/site/svgs/raw.svg
