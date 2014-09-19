#!/usr/bin/python
# -*- encoding: utf-8 -*-
from __future__ import division

"""Construct a data file whose values are a ratio of values from the two input
files; e.g. combine emissions and population to get emissions per capita.
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


parser = optparse.OptionParser(usage="%prog [options] numerator.csv denominator.csv")
parser.add_option("", "--scale", type="float", default=1.0,
                help="Constant factor to multiply result by, for unit conversion")
parser.add_option("", "--key", type="str", default="Alpha-2",
                help="Name of key column")
parser.add_option("", "--value", type="str", default="Value",
                help="Name of value column")

(options, args) = parser.parse_args()
if len(args) != 2:
  parser.error("Expected two arguments")

(numerator_filename, denominator_filename) = args

denominators = {}
for d in each_csv_row(denominator_filename):
    denominators[d[options.key]] = float(d[options.value])

with open(numerator_filename, 'r') as f:
    r = csv.reader(f)
    w = csv.writer(sys.stdout)
    
    header = r.next()
    w.writerow(header)
    for row in r:
        d = dict(zip(header, row))
        value = d[options.value]
        if value:
            if d[options.key] not in denominators:
                print >>sys.stderr, "Skipping row because '%s' not found in %s" % (d[options.key], denominator_filename)
                continue
            d[options.value] = float(value) / denominators[d[options.key]] * options.scale
        
        w.writerow([ d.get(x) for x in header ])
