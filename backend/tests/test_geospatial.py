from app.services.geospatial import point_in_polygon, distance_to_boundary
from shapely.geometry import Polygon

def test_point_in_polygon():
    poly = Polygon([[-10, -10], [10, -10], [10, 10], [-10, 10]])
    assert point_in_polygon(0, 0, poly) == True
    assert point_in_polygon(20, 20, poly) == False

def test_distance_to_boundary():
    poly = Polygon([[-10, -10], [10, -10], [10, 10], [-10, 10]])
    # At (15, 0), distance to boundary (10, 0) is 5 degrees. Approx 5 * 111 = 555km.
    dist = distance_to_boundary(0, 15, poly)
    assert dist > 500
