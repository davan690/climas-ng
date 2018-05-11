import os

from pyramid.response import FileResponse
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

# -------------------------------------------------------------------

class SummariesDataView(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='summariesdata')
    def __call__(self):

        data_path = self.request.registry.settings['climas.summaries_data_path']

        return FileResponse(
            os.path.join(data_path, self.request.matchdict['data_name']),
            request=self.request
        )

# -------------------------------------------------------------------

