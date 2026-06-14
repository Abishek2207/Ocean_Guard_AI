import geopandas as gpd
from shapely.geometry import Point, Polygon

def point_in_polygon(lat: float, lon: float, polygon: Polygon) -> bool:
    """
    Check if a point is within a polygon.
    """
    point = Point(lon, lat)
    return polygon.contains(point)

def distance_to_boundary(lat: float, lon: float, polygon: Polygon) -> float:
    """
    Calculate distance to nearest polygon boundary in km.
    """
    # Simplistic approximation for demo
    point = Point(lon, lat)
    # in reality we would project to an equal area CRS
    dist_degrees = polygon.distance(point)
    # Approx degrees to km 
    return dist_degrees * 111.0
