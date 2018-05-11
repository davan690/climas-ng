#!/usr/bin/env python

# run this to create species.json and biodiversity.json in the
# webapp's static/data directory.


import os


## HPC / prod paths
appdir = '/srv/wallacewebapp'
jsondir = appdir + '/climasng/data'
datadir = '/rdsi/wallace2/W2_website'

if os.path.isdir('/Users/pvrdwb'):

	# ..overwrite with local dev paths
	jsondir = '/Users/pvrdwb/projects/climas-global/webapp/climasng/data'
	datadir = '/Users/pvrdwb/projects/climas-global/testdata'



#################################################

import sys
sys.path.append(appdir + '/climasng/data')
import datafinder

datafinder.createSpeciesJson(datadir, os.path.join(jsondir, 'species.json'))
datafinder.createSummaryJson(datadir, os.path.join(jsondir, 'summaries.json'))