function Court(){
	
	var _offset, _mesh, _elasticity;
	var BOUNCE_THRESHOLD = METERS(0.5); // TODO

	this.getOffset = function(){
		return _offset;
	}

	this.getMesh = function(){
		return _mesh;
	}

	this.getNormal = function(){
		return new THREE.Vector3(0, 1.0, 0);
	}

	this.getBounceVector = function(velocity){
		// R_i - 2*N*(N.R)
		if (velocity.y == 0){
			return velocity.clone();
		}
		var R = velocity.clone()
		var N = this.getNormal();
		var NR = this.getNormal().dot(R);
		var component = N.multiplyScalar(2 * NR);
		var bounce = R.sub(component);

		// Loss of momentum (elasticity)
		// bounce.multiplyScalar(_elasticity);
		bounce.y = bounce.y * _elasticity;

		// TODO (some kind of threshold: if less than certain velocity just set to zero)
		if (Math.abs(bounce.y) < BOUNCE_THRESHOLD){
			bounce.y = 0;
		}
		return bounce;
	}

	this.hasCollision = function(basketball){
		var radius = basketball.getRadius();
		var top = basketball.getPosition();

		// Point is C - N
		var point = top.sub(this.getNormal().multiplyScalar(radius));

		// P.N + D = 0
		var temp = point.dot(this.getNormal()) - _offset;

		return temp < radius;
	}

	function init(){
		var texture = new THREE.ImageUtils.loadTexture('images/basketball-court.png');
		var material = new THREE.MeshBasicMaterial({
			map : texture,
			color : 0xffffff,
			side: THREE.DoubleSide
		});
		var geometry = new THREE.PlaneGeometry(FEET(94), FEET(50), 10, 10);
		_mesh = new THREE.Mesh(geometry, material);
		_mesh.rotation.x = Math.PI / 2;
		_offset = _mesh.position.y;
		_elasticity = 0.69; // TODO: Research
	}

	init();
}