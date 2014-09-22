#!/usr/bin/python
# -*- encoding: utf-8 -*-
from __future__ import division

"""Extract the latest annual data from a spreadsheet in the year-per-row format
used by Glen Peters.
"""

import csv
import math
import optparse
import sys

parser = optparse.OptionParser(usage="%prog [options] filename.csv")
parser.add_option("", "--conversion-factor", type="float", default=1.0,
                help="numerical factor to multiply values by")
parser.add_option("", "--year", type="int", default=None,
                help="year to extract (default is last in file)")

(options, args) = parser.parse_args()
if len(args) != 1:
  parser.error("Expected one argument")

header = None
data = None
with open(args[0], 'r') as f:
	r = csv.reader(f)
	for row in r:
		if header is None and row[1] == "Afghanistan":
			header = row
			header[0] = "Year"
		elif header is not None:
			data = dict(zip(header, row))
			if options.year and int(float(data["Year"])) == options.year:
				break

if data is None:
	raise Exception(u"Didn’t find any data")

w = csv.writer(sys.stdout)
w.writerow(["Country Name", "Year", "Value"])
year = data["Year"]
for country_name in header[1:]:
	value = float(data[country_name]) * options.conversion_factor
	if math.isnan(value): value = ""
	w.writerow([country_name, year, value])
