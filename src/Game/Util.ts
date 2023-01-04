import {
  Mesh,
  Ray,
  Vector3,
  VertexBuffer,
  Axis,
  Scalar,
} from "@babylonjs/core";

export function createInnerPoints(mesh: Mesh, pointsNb: number) {
  var boundInfo = mesh.getBoundingInfo();
  var diameter = 2 * boundInfo.boundingSphere.radius;
  mesh.updateFacetData();

  var positions = mesh.getVerticesData(VertexBuffer.PositionKind);
  var indices = mesh.getIndices();

  if (!positions || !indices) {
    return;
  }

  var point = Vector3.Zero();
  var points = [];
  var directions = [];

  var randX = 0;
  var randY = 0;
  var randZ = 0;

  var index = 0;
  var id0 = 0;
  var id1 = 0;
  var id2 = 0;
  var v0X = 0;
  var v0Y = 0;
  var v0Z = 0;
  var v1X = 0;
  var v1Y = 0;
  var v1Z = 0;
  var v2X = 0;
  var v2Y = 0;
  var v2Z = 0;
  var vertex0 = Vector3.Zero();
  var vertex1 = Vector3.Zero();
  var vertex2 = Vector3.Zero();
  var vec0 = Vector3.Zero();
  var vec1 = Vector3.Zero();

  var lamda = 0;
  var mu = 0;
  var norm = Vector3.Zero();
  var tang = Vector3.Zero();
  var biNorm = Vector3.Zero();
  var angle = 0;
  var facetPlaneVec = Vector3.Zero();

  var gap = 0;
  var distance = 0;
  var ray = new Ray(Vector3.Zero(), Axis.X);
  var pickInfo;
  var facetPoint = Vector3.Zero();
  var direction = Vector3.Zero();
  var particleDirection = Vector3.Zero();
  var particleDistance = 0;
  var testPoint = Vector3.Zero();

  for (var p = 0; p < pointsNb; p++) {
    index = Math.floor(Scalar.RandomRange(0, indices.length / 3));
    id0 = indices[3 * index];
    id1 = indices[3 * index + 1];
    id2 = indices[3 * index + 2];
    v0X = positions[3 * id0];
    v0Y = positions[3 * id0 + 1];
    v0Z = positions[3 * id0 + 2];
    v1X = positions[3 * id1];
    v1Y = positions[3 * id1 + 1];
    v1Z = positions[3 * id1 + 2];
    v2X = positions[3 * id2];
    v2Y = positions[3 * id2 + 1];
    v2Z = positions[3 * id2 + 2];
    vertex0.set(v0X, v0Y, v0Z);
    vertex1.set(v1X, v1Y, v1Z);
    vertex2.set(v2X, v2Y, v2Z);
    vertex1.subtractToRef(vertex0, vec0);
    vertex2.subtractToRef(vertex1, vec1);

    norm = mesh.getFacetNormal(index).normalize().scale(-1);
    tang = vec0.clone().normalize();
    biNorm = Vector3.Cross(norm, tang);
    angle = Scalar.RandomRange(0, 2 * Math.PI);
    facetPlaneVec = tang
      .scale(Math.cos(angle))
      .add(biNorm.scale(Math.sin(angle)));
    angle = Scalar.RandomRange(0.1, Math.PI);
    direction = facetPlaneVec
      .scale(Math.cos(angle))
      .add(norm.scale(Math.sin(angle)));

    //form a point inside the facet v0, v1, v2;
    lamda = Scalar.RandomRange(0, 1);
    mu = Scalar.RandomRange(0, 1);
    facetPoint = vertex0.add(vec0.scale(lamda)).add(vec1.scale(lamda * mu));

    gap = 0;
    distance = 0;
    ray.origin = facetPoint;
    ray.direction = direction;
    ray.length = diameter;

    const pickInfo = ray.intersectsMesh(mesh);

    if (pickInfo && pickInfo.hit && pickInfo.pickedPoint) {
      distance = pickInfo.pickedPoint.subtract(facetPoint).length();
      gap = Scalar.RandomRange(0, 1) * distance;
      point = facetPoint.add(direction.scale(gap));
    } else {
      point.set(0, 0, 0);
    }
    points.push(point);
  }

  return points;
}
