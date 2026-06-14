import geopandas as gpd
from shapely.geometry import Point, Polygon

import pyproj
from shapely.ops import transform

def point_in_polygon(lat: float, lon: float, polygon: Polygon) -> bool:
    """
    Check if a point is within a polygon.
    """
    point = Point(lon, lat)
    return polygon.contains(point)

def distance_to_boundary(lat: float, lon: float, polygon: Polygon) -> float:
    """
    Calculate distance to nearest polygon boundary in km using accurate projection.
    """
    point = Point(lon, lat)
    
    # Define projections: WGS84 (lon/lat) and an equal-area/azimuthal equidistant projection centered on the point
    project = pyproj.Transformer.from_proj(
        pyproj.Proj(proj='latlong', datum='WGS84'),
        pyproj.Proj(proj='aeqd', lat_0=lat, lon_0=lon, datum='WGS84'),
        always_xy=True
    ).transform
    
    # Project both the point and the polygon to calculate metric distance
    point_proj = transform(project, point)
    poly_proj = transform(project, polygon)
    
    dist_meters = poly_proj.distance(point_proj)
    return dist_meters / 1000.0
