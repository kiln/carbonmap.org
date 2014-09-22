#!/usr/bin/python
# -*- encoding: utf-8 -*-
from __future__ import division

"""Extract annual data from a spreadsheet in the format
used by the BP Statistical Review of World Energy.
"""

import csv
import math
import optparse
import sys

parser = optparse.OptionParser(usage="%prog [options] filename.csv")
parser.add_option("", "--conversion-factor", type="float", default=1.0,
                help="numerical factor to multiply values by")
parser.add_option("", "--year", type="int",
                help="year to extract (default is last in file)")

(options, args) = parser.parse_args()
if len(args) != 1:
	parser.error("Expected one argument")

year = options.year

w = csv.writer(sys.stdout)
w.writerow(["Country Name", "Year", "Value"])

with open(args[0], 'r') as f:
	r = csv.reader(f)
	
	# Skip first two rows
	r.next() ; r.next()
	
	header = r.next()
	years = map(int, map(float, header[1 : -3]))
	if not year:
		year = years[-1]
	year_index = years.index(year)
	
	for row in r:
		if row[0] == "Total World":
			break
		elif row[0]:
			w.writerow([row[0], year, float(row[year_index]) * options.conversion_factor])

