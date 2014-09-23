#!/bin/bash

cd site && zip downloads/carbonmap-snapshot-$(date +%Y%m%d).zip *.* font* -x *massive*

