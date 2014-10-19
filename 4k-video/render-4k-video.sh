#!/bin/bash

set -e -x

FPS=30

MAPS=(_raw Area Population GDP Extraction Emissions Consumption Historical Reserves PeopleAtRisk _raw _raw-PopulationGrowth Emissions-PopulationGrowth PeopleAtRisk-PopulationGrowth _raw)

i=0
n=${#MAPS[@]}
while [ $i -lt $[$n-1] ]
do
    from=${MAPS[$i]%-*}
    to=${MAPS[$i+1]%-*}
    from_shading=${MAPS[$i]#*-}
    to_shading=${MAPS[$i+1]#*-}
    
    if [ "$from_shading" = "$from" ]
    then
        from_shading=Continents
    fi
    if [ "$to_shading" = "$to" ]
    then
        to_shading=Continents
    fi
    
    j=0
    while [ $j -lt $FPS ]
    do
        filename="4k-output/$i-$(printf %02d $j)"
        if [ ! -e "$filename-full.png" ]
        then
            echo >&2 "Rendering $filename..."
            t=$(bc <<< "scale=4; $j/($FPS-1)")
            # The "-z 0.5" is needed when run on a Mac with retina display, to compensate for the
            # pixel-doubling.
            webkit2png -z 0.5 -F "http://carbonmap.local/massive.xhtml?easing=sin&shading=$to_shading/$from_shading/$t#$to/$from/$t" -o "$filename"
        fi
        j=$[$j+1]
    done
    
    ft=$from
    if [ "$from_shading" != Continents ]
    then
        ft=$ft-$from_shading
    fi
    ft=$ft-$to
    if [ "$to_shading" != Continents ]
    then
        ft=$ft-$to_shading
    fi
    
    ffmpeg -y -i 4k-output/"$i"-%02d-full.png -r $FPS -vcodec prores -vf "pad=3840:2160:0:0:white" -bufsize 4000k 4k-output/"$ft".mov
    rm 4k-output/"$i"-*-full.png
    
    i=$[$i+1]
done
