function Basketball(){

	var _mass, _radius, _state, _mesh, _angularVelocity;

	this.getMass = function(){
		return _mass;
	}

	this.getRadius = function(){
		return _radius;
	}

	this.getState = function(){
		var result = [_state[0].clone(), _state[1].clone()];
		return result;
	}

	this.getPosition = function(){
		return _state[0].clone();
	}

	this.setPosition = function(newPosition){
		_state[0] = newPosition.clone();
	}

	this.setY = function(Y){
		_state[0].y = Y;
	}

	this.addPosition = function(vec){
		_state[0].add(vec);
	}

	this.getVelocity = function(){
		return _state[1].clone();
	}

	this.setVelocity = function(newVelocity){
		_state[1] = newVelocity.clone();
	}

	this.addVelocity = function(vec){
		_state[1].add(vec);
	}

	this.setState = function(newState, test){
		if (newState && newState.length === 2){
			// Valid State
			_state[0] = newState[0].clone();
			_state[1] = newState[1].clone();
		}
	}

	this.setAngularVelocity = function(x, y, z){
		_angularVelocity = new THREE.Vector3(x, y, z);
	}

	this.spin = function(step){
		// _mesh.rotation.z -= _angularVelocity.z * step;
		// _mesh.rotation.x += _angularVelocity.x * step;

		var axis = new THREE.Vector3(_angularVelocity.x, 0, _angularVelocity.z);
		var angle = Math.PI / 2;

		var quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle( new THREE.Vector3( 1/Math.sqrt(2), 0, -1/Math.sqrt(2) ), Math.PI / 2 );

		var vector = new THREE.Vector3( 1, 0, 0 );
		vector.applyQuaternion( quaternion );

		// _mesh.rotation = _mesh.rotateOnAxis(axis, angle);
	}

	this.getMesh = function(){
		return _mesh;
	}

	this.evalF = function(){
		// Gravity
		var gravityDirection = new THREE.Vector3(0, -1.0, 0);
		var gravity = gravityDirection.multiplyScalar(METERS(9.8) * _mass);

		// Drag

		// External Forces
		// If 

		// Net Force
		var netForce = gravity;
		var v = _state[1].clone();
		var a = netForce.divideScalar(_mass);

		var F = [v, a];
		return F;
	}

	function init(){
		_mass = 0.625;
		_radius = INCHES(4.775);
		_state = [new THREE.Vector3(FEET(0), FEET(10), 0), new THREE.Vector3(FEET(2), FEET(0), FEET(0))];

		var geometry = new THREE.SphereGeometry(INCHES(9.55), 32, 32);
		var material = new THREE.MeshBasicMaterial({ 
			map: new THREE.ImageUtils.loadTexture('images/basketball.jpg')
		});
		_mesh = new THREE.Mesh(geometry, material);
		_mesh.rotation.y = Math.PI / 4;
		// _mesh.rotation.x = Math.PI / 2;
		// _mesh.rotation.z = Math.PI / -2;
		_mesh.position = _state[0];
		_angularVelocity = new THREE.Vector3();
	}

	init();
}