function Rim(side){
	
	// Dimensional Constants
	const RING_RADIUS = INCHES(9);
	const RING_THICKNESS = INCHES(0.3125);

	const ATTACH_WIDTH = INCHES(4);
	const ATTACH_DEPTH = INCHES(6);
	const ATTACH_HEIGHT = INCHES(4);

	const ATTACH_BOTTOM_THICKNESS = INCHES(2);
	const ATTACH_FRONT_THICKNESS = INCHES(1);

	const SHADOW_HEIGHT = INCHES(1);

	const DISTANCE = FEET(42) - INCHES(4) - RING_RADIUS; // Backboard Depth

	const R_SEGMENTS = 32;
	const T_SEGMENTS = 64;

	// Private Member Fields
	var _mesh;

	this.getMesh = function(){
		return _mesh;
	}

	function vector(x,y,z){
		return new THREE.Vector3(INCHES(x), INCHES(y), INCHES(z));
	}

	function faceOffset(end,a,b,c){
		return new THREE.Face3(end + a, end + b, end + c);
	}

	this.hasCollision = function(basketball, hit){
		var bbox = this.getBoundingBox();
		var radius = basketball.getRadius();
		var center = basketball.getPosition();
		var initialCollisionTest = bbox.distanceToPoint(center) <= radius;
		if (!initialCollisionTest){
			// STOP here, reduce time spent on operation
			return false;
		}

		// TODO
		// TODO: reduce going through ALL FACES
		for (var i in _mesh.geometry.faces){
			var face = _mesh.geometry.faces[i];
			var normal = face.normal
		}
		// Get closest point
		// var closestPoint =

		return false;
	}

	this.getBoundingBox = function(){
		// TODO: Apply Rotation
		_mesh.geometry.computeBoundingBox();
		var bb = _mesh.geometry.boundingBox.clone();
		var xMin = bb.min.x;
		var zMin = bb.min.z;
		var xMax = bb.max.x;
		var zMax = bb.max.z;
		bb.min.x = zMin;
		bb.min.z = xMin;
		bb.max.x = zMax;
		bb.max.z = xMax;
		bb.min.add(_mesh.position.clone());
		bb.max.add(_mesh.position.clone());
		return bb;	
	}

	function init(side){
		var sideSign;
		if (side === "HOME"){
			sideSign = -1;
		} else if (side == "AWAY"){
			sideSign = 1;
		} else {
			return;
		}

		// Ring
		var geometry = new THREE.TorusGeometry(RING_RADIUS, RING_THICKNESS, R_SEGMENTS, T_SEGMENTS);
		
		// Backboard Attachment
		var end = geometry.vertices.length;
		geometry.vertices.push(
			new THREE.Vector3(ATTACH_WIDTH / -2, RING_RADIUS, 0),
			new THREE.Vector3(ATTACH_WIDTH /  2, RING_RADIUS, 0),
			new THREE.Vector3(ATTACH_WIDTH / -2, RING_RADIUS + ATTACH_DEPTH, 0),
			new THREE.Vector3(ATTACH_WIDTH /  2, RING_RADIUS + ATTACH_DEPTH, 0),
			new THREE.Vector3(ATTACH_WIDTH / -2, RING_RADIUS + ATTACH_DEPTH, -1 * ATTACH_HEIGHT),
			new THREE.Vector3(ATTACH_WIDTH /  2, RING_RADIUS + ATTACH_DEPTH, -1 * ATTACH_HEIGHT),
			new THREE.Vector3(ATTACH_WIDTH / -2, RING_RADIUS + ATTACH_DEPTH - ATTACH_BOTTOM_THICKNESS, -1 * ATTACH_HEIGHT),
			new THREE.Vector3(ATTACH_WIDTH /  2, RING_RADIUS + ATTACH_DEPTH - ATTACH_BOTTOM_THICKNESS, -1 * ATTACH_HEIGHT),
			new THREE.Vector3(ATTACH_WIDTH / -2, RING_RADIUS, -1 * ATTACH_FRONT_THICKNESS),
			new THREE.Vector3(ATTACH_WIDTH /  2, RING_RADIUS, -1 * ATTACH_FRONT_THICKNESS)
		);
		geometry.faces.push(
			faceOffset(end, 0, 1, 2),
			faceOffset(end, 1, 2, 3),
			faceOffset(end, 2, 3, 4),
			faceOffset(end, 3, 4, 5),
			faceOffset(end, 4, 5, 6),
			faceOffset(end, 5, 6, 7),
			faceOffset(end, 6, 7, 8),
			faceOffset(end, 7, 8, 9),
			faceOffset(end, 8, 9, 0),
			faceOffset(end, 9, 1, 0),
			faceOffset(end, 0, 2, 4),
			faceOffset(end, 4, 6, 8),
			faceOffset(end, 0, 4, 8),
			faceOffset(end, 1, 3, 5),
			faceOffset(end, 5, 7, 9),
			faceOffset(end, 1, 5, 9)
		);

		// Ring Shadow
		var newEnd = geometry.vertices.length;
		for (var i = 0; i < (T_SEGMENTS / 2) + 1; i++){
			// Clone
			var zOffset = SHADOW_HEIGHT + RING_THICKNESS;
			if (i == 0 || i == (T_SEGMENTS / 2)){
				// Special (Don't set Z that far back)
				zOffset /= 2;
			}
			var currentVertex = geometry.vertices[i];
			var x = currentVertex.x;
			var y = currentVertex.y;
			var z = currentVertex.z;
			var shadowVertex = new THREE.Vector3(x,y,z - zOffset);
			geometry.vertices.push(shadowVertex);
		}
		for (var i = 0; i < (T_SEGMENTS / 2); i++){
			var face1 = new THREE.Face3(i, (i+1), newEnd + i );
			var face2 = new THREE.Face3( (i+1), newEnd + i, newEnd + ((i+1)) );
			geometry.faces.push(face1,face2);
		}

		// geometry = new THREE.CylinderGeometry(INCHES(9), INCHES(9), INCHES(1), 32, 1, true, Math.PI / -3, Math.PI / 3)

		var material = new THREE.MeshBasicMaterial({
			color : 0xcf5300,
			side: THREE.DoubleSide
		});

		_mesh = new THREE.Mesh(geometry, material);

		_mesh.position.y = FEET(10);
		_mesh.position.x = sideSign * DISTANCE; // DEPENDS ON SIDE
		_mesh.rotation.z = sideSign * Math.PI / -2; // Depends on side
		_mesh.rotation.x = Math.PI / -2;
	}

	init(side);
}