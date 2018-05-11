import os
import json

from pyramid.response import Response
from pyramid.response import FileResponse
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

# database stuff
from sqlalchemy.exc import DBAPIError
from sqlalchemy import or_
from climasng.models import *

# json data stuff
from climasng.docassembly.sectiondata import SectionData
from climasng.data import datafinder

# -------------------------------------------------------------------

class DataView(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='data')
    def __call__(self):

        data_name = self.request.matchdict['data_name']

        data_path = os.path.join(os.path.dirname(__file__), '..', 'data')

        # they wanted the report regions list
        if data_name == 'reportregions':

            region_types = []
            try:
                types = DBSession.query(RegionType).order_by(RegionType.regiontype)
                for type in types:
                    region_list = []
                    regions = DBSession.query(Region)
                    regions = regions.filter(Region.region_type_regiontype == type.regiontype)
                    regions = regions.order_by(Region.name)

                    for region in regions:
                        string_id = region.region_type_regiontype
                        string_id += '_' + region.name.replace(' ', '_')
                        region_list.append({
                            'id': string_id,
                            'name': region.name
                        })
                    type_data = {
                        "id": type.regiontype,
                        "name": type.regiontypename_singular,
                        "regions": region_list
                    }
                    region_types.append(type_data)

            except DBAPIError:
                return Response(conn_err_msg, content_type='text/plain', status_int=500)

            json_content = json.dumps({ 'regiontypes': region_types })
            return Response(body=json_content, content_type='application/json')

        # they wanted the report sections list
        if data_name == 'reportsections':
            root_section = SectionData(self.request.registry.settings['climas.report_section_path'])
            return Response(body=root_section.toJson(), content_type='application/json')


        # do we need to get the species json ready?
        elif data_name == 'species':
            species_file = os.path.join(data_path, data_name + '.json')
            if not os.path.isfile(species_file):
                # species.json doesn't exist, create it
                datafinder.createSpeciesJson(self.request.registry.settings['climas.species_data_path'])

        # do we need to get the biodiversity json ready?
        elif data_name == 'biodiversity':
            biodiversity_file = os.path.join(data_path, data_name + '.json')
            if not os.path.isfile(biodiversity_file):
                # biodiversity.json doesn't exist, create it
                datafinder.createBiodiversityJson(self.request.registry.settings['climas.species_data_path'])

        # if we haven't returned already, serve a json file
        return FileResponse(
            os.path.join(data_path, data_name + '.json'),
            request=self.request,
            content_type='application/json'
        )

# -------------------------------------------------------------------

