function Backboard(side){
	
	const WIDTH = INCHES(72);
	const HEIGHT = INCHES(42);
	const DEPTH = INCHES(4);
	const DISTANCE = FEET(42) + DEPTH;
	const GROUND_DISTANCE = FEET(10) + 0.5*HEIGHT - INCHES(5); // ATTACH_HEIGHT + INCHES(1)
	const ELASTICITY = 0.7;
	const FK_COEFFICIENT = 0.25; // TODO: Research

	// FACES
	const FRONT = 1;
	const BACK = 2;
	const BOTTOM = 3;
	const TOP = 4;
	const LEFT = 5;
	const RIGHT = 6;

	// EDGES
	const FRONTBOTTOM = 13;
	const FRONTTOP = 14;
	const FRONTLEFT = 15;
	const FRONTRIGHT = 16;
	const BACKBOTTOM = 23;
	const BACKTOP = 24;
	const BACKLEFT = 25;
	const BACKRIGHT = 26;
	const BOTTOMLEFT = 35;
	const BOTTOMRIGHT = 36;
	const TOPLEFT = 45;
	const TOPTOMRIGHT = 46;

	// CORNERS
	const FRONTBOTTOMLEFT = 135;
	const FRONTBOTTOMRIGHT = 136;
	const FRONTTOPLEFT = 135;
	const FRONTTOPRIGHT = 136;
	const BACKBOTTOMLEFT = 235;
	const BACKBOTTOMRIGHT = 236;
	const BACKTOPLEFT = 245;
	const BACKTOPRIGHT = 246;

	var _mesh, _sideSign;

	this.getMesh = function(){
		return _mesh;
	}

	this.getNormal = function(face){
		return this.getNormals()[face];
	}

	this.getNormals = function(){
		var normals = {};
		normals[FRONT] = new THREE.Vector3(_sideSign * -1.0, 0, 0);
		normals[BACK] = new THREE.Vector3(_sideSign * 1.0, 0, 0);
		normals[BOTTOM] = new THREE.Vector3(0, -1.0, 0);
		normals[TOP] = new THREE.Vector3(0, 1.0, 0);
		normals[LEFT] = new THREE.Vector3(0, 0, _sideSign * -1.0);
		normals[RIGHT] = new THREE.Vector3(0, 0, _sideSign * 1.0);
		return normals;
	}

	this.getBoundingObjects = function(){
		// var body = 
	}

	this.fixCollisionPosition = function(basketball, step, collisions){
		var bbox = this.getBoundingBox();
		var radius = basketball.getRadius();
		var position = new THREE.Vector3();
		for (var face in collisions){
			switch (face){
				case FRONT:
					position.x = bbox.min.x - radius;
					break;
				case BACK:
					position.x = bbox.max.x + radius;
					break;
				case TOP:
					position.y = bbox.max.y + radius;
					break;
				case BOTTOM:
					position.y = bbox.min.y - radius;
					break;
				case LEFT:
					var newLeft = 0;
					if (side == "HOME"){
						newLeft = bbox.max.z + radius;
					}
					else if (side == "AWAY"){
						newLeft = bbox.min.z - radius;
					}
					position.z = newLeft;
					break;
				case RIGHT:
					var newRight = 0;
					if (side == "AWAY"){
						newRight = bbox.max.z + radius;
					}
					else if (side == "HOME"){
						newRight = bbox.min.z - radius;
					}
					position.z = newRight;
					break;
				default:
					position = basketball.getPosition();
					break;
			}
		}
		basketball.setPosition(position);
	}

	this.getBounceVector = function(velocity, collisions){
		// Get R (velocity)
		var R = velocity.clone();

		// Calculate N
		// TODO: Weird for edges and corners
		var N = new THREE.Vector3();
		for (var face in collisions){
			var nComponent = this.getNormal(face);
			N.add(nComponent);
		}
		N.normalize();

		// R - 2*N*(N.R)
		var NR = N.clone().dot(R);
		var component = N.clone().multiplyScalar(2 * NR);
		var bounce = R.sub(component);

		// Loss of momentum (elasticity)
		bounce.multiplyScalar(ELASTICITY);
		return bounce;
	}

	function numValidDimensions(point, bbox){
		var p = point.clone();
		var bb = bbox.clone();
		var count = 0;
		count += (p.x >= bb.min.x && p.x <= bb.max.x) ? 1 : 0;
		count += (p.y >= bb.min.y && p.y <= bb.max.y) ? 1 : 0;
		count += (p.z >= bb.min.z && p.z <= bb.max.z) ? 1 : 0;
		return count;
	}

	this.hasCollision = function(basketball, hit){
		// Plane Information
		var position = _mesh.position.clone();
		var bbox = this.getBoundingBox();
		var normals = this.getNormals();
		var frontNormal = normals[FRONT];
		var backNormal = normals[BACK];
		var topNormal = normals[TOP];
		var bottomNormal = normals[BOTTOM];
		var leftNormal = normals[LEFT];
		var rightNormal = normals[RIGHT];

		var radius = basketball.getRadius();
		var center = basketball.getPosition();
		
		// FRONT and BACK
		var frontPoint = center.clone().sub(frontNormal.clone().multiplyScalar(radius)); // point on ball
		var backPoint = center.clone().sub(backNormal.clone().multiplyScalar(radius));

		// TOP and BOTTOM
		var topPoint = center.clone().sub(topNormal.clone().multiplyScalar(radius)); // point on ball
		var bottomPoint = center.clone().sub(bottomNormal.clone().multiplyScalar(radius));

		// SIDES
		var leftPoint = center.clone().sub(leftNormal.clone().multiplyScalar(radius)); // point on ball
		var rightPoint = center.clone().sub(rightNormal.clone().multiplyScalar(radius));


		var collision = bbox.distanceToPoint(center) <= radius;
		if (collision){
			if (hit === undefined){
				hit = {
					"type" : undefined,
					"points" : {}
				};
			}

			var countHash = {
				0 : {},
				1 : {},
				2 : {},
				3 : {}
			};

			frontCount = numValidDimensions(frontPoint, bbox);
			countHash[frontCount][FRONT] = frontPoint;

			backCount = numValidDimensions(backPoint, bbox);
			countHash[backCount][BACK] = backPoint;

			topCount = numValidDimensions(topPoint, bbox);
			countHash[topCount][TOP] = topPoint;

			bottomCount = numValidDimensions(bottomPoint, bbox);
			countHash[bottomCount][BOTTOM] = bottomPoint;

			leftCount = numValidDimensions(leftPoint, bbox);
			countHash[leftCount][LEFT] = leftPoint;

			rightCount = numValidDimensions(rightPoint, bbox);
			countHash[rightCount][RIGHT] = rightPoint;

			// Fill "hit" object
			for (var i = 3; i >= 0; i--){
				var nPoints = Object.keys(countHash[i]).length;
				if (countHash.hasOwnProperty(i) && Object.keys(countHash[i]).length > 0){
					switch (nPoints){
						case 1:
							hit["type"] = "face";
							break;
						case 2:
							hit["type"] = "edge";
							break;
						case 3:
							hit["type"] = "corner";
							break;
						default:
							break;
					}
					hit["points"] = countHash[i];
					break;
				}
			}
		}
		return collision;
	}

	this.getBoundingBox = function(){
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

	this.getFaceBox = function(face){
		var normals = this.getNormals();
		switch (face){
			case FRONT:

		}
	}

	function init(side){
		// TODO: Unique texture for each side
		var urls = [
			'images/basketball-backboard-front.png', 'images/basketball-backboard-back.png',
			'images/basketball-backboard-side.png','images/basketball-backboard-side.png',
			
			'images/basketball-backboard-top.png','images/basketball-backboard-top.png'
		];
		var texture = new THREE.ImageUtils.loadTexture('images/basketball-backboard-front.png');
		var material = new THREE.MeshBasicMaterial({
			map : texture,
			color : 0xffffff,
			side: THREE.DoubleSide
		});
		var geometry = new THREE.CubeGeometry(WIDTH, HEIGHT, DEPTH);
		if (side === "HOME"){
			_sideSign = -1;
		} else if (side == "AWAY"){
			_sideSign = 1;
		} else {
			return;
		}
		_mesh = new THREE.Mesh(geometry, material);
		_mesh.position.y = GROUND_DISTANCE; // Attachment Height - 1 inch
		_mesh.position.x = _sideSign * DISTANCE;
		_mesh.rotation.y = _sideSign * Math.PI / -2; // Depends on side
		_offset = _mesh.position.z;
	}

	init(side);

}