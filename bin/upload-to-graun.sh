# To be run as . bin/upload-to-graun.sh

s3g -v sync -M -P --add-header=Cache-Control:max-age=300 site/ s3://gdn-cdn/embed/kiln/carbonmap/
