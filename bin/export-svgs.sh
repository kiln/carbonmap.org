#!/bin/bash

set -e

for cart in carbonmap/data/Maps/Cartogram\ data/*.cart _raw
do
  if [ "$cart" = _raw ]
  then
    d=Raw
    cart_option=()
  else
    d=${cart##*/}; d=${d%.cart}
    cart_option=("--cart=$cart")
  fi
  
  #ruby -e 'puts ARGV.inspect' -- "${cart_option[@]}"
  for shading_css in carbonmap/data/Shading/CSS/*.css
  do
      shading=${shading_css##*/}; shading=${shading%.css}
      echo "Generating $d-$shading.svg..."
      bin/as-svg.py \
        --map=world-robinson \
        "${cart_option[@]}" \
        --simplification=0 \
        --static \
        --output-grid=64605x32767 \
        --stroke-width=0.1 \
        --exclude-regions=AQ \
        --style="$shading_css" \
        --output="carbonmap/site/svgs/$d-$shading.svg"
    done
done