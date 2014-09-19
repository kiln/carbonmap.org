# To be run as . bin/upload-to-graun.sh

s3g -v sync -M -P site/ s3://gdn-cdn/embed/kiln/carbonmap/
