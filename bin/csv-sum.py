#!/usr/bin/python
# -*- encoding: utf-8 -*-
from __future__ import division

"""Construct a data file whose values are a sum of values from the input
files; e.g. combine carbon in oil reserves, gas reserves and coal reserves
to get carbon in fossil fuel reserves.
"""

import csv
import optparse
import sys

def each_csv_row(filename, ignore_rows=0):
    with open(filename, 'r') as f:
        r = csv.reader(f)
        for i in range(ignore_rows):
            r.next()
        header = r.next()
        header = [ s.strip() for s in header ]
        
        for row in r:
            row = [ s.strip() for s in row ]
            yield dict(zip(header, row))


parser = optparse.OptionParser(usage="%prog [options] file.csv file.csv ...")
parser.add_option("", "--multipliers", type="str", default=None,
                help="Constant factors to multiply inputs by, for unit conversion, comma-separated")
parser.add_option("", "--scale", type="float", default=1.0,
                help="Constant factor to multiply result by, for unit conversion")
parser.add_option("", "--key", type="str", default="Alpha-2",
                help="Name of key column")
parser.add_option("", "--value", type="str", default="Value",
                help="Name of value column")

(options, args) = parser.parse_args()

if options.multipliers:
	multipliers = map(float, options.multipliers.split(","))
	if len(multipliers) != len(args):
		parser.error("The number of multipliers should match the number of input files")
else:
	multipliers = [1.0] * len(args)

sums = {}
keys = set()
for multiplier, filename in zip(multipliers, args[:-1]):
	for d in each_csv_row(filename):
		key = d[options.key]
		value = d[options.value]
		if value:
			sums[key] = sums.get(key, 0.0) + float(value) * multiplier
			keys.add(key)

with open(args[-1], 'r') as f:
	r = csv.reader(f)
	w = csv.writer(sys.stdout)

	header = r.next()
	w.writerow([options.key, options.value])
	for row in r:
		d = dict(zip(header, row))
		key = d[options.key]
		value = d[options.value]
		if value:
			value = (float(value) + sums.get(key, 0.0) * multipliers[-1]) * options.scale
		keys.discard(key)

		w.writerow([ key, value ])

	for key in keys:
		w.writerow([key, sums[key]])
