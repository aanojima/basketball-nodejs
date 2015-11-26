function Backboard(side){
	
	var _mesh, _elasticity, _fkCoefficient;

	this.getMesh = function(){
		return _mesh;
	}

	function init(side){
		var texture = new THREE.ImageUtils.loadTexture('images/basketball-backboard.png');
		var material = new THREE.MeshBasicMaterial({
			map : texture,
			color : 0xffffff,
			side: THREE.DoubleSide
		});
		var geometry = new THREE.PlaneGeometry(INCHES(72), INCHES(42), 10, 10);
		var sideSign;
		if (side === "HOME"){
			sideSign = 1;
		} else if (side == "AWAY"){
			sideSign = -1;
		} else {
			return;
		}
		_mesh = new THREE.Mesh(geometry, material);
		_mesh.position.y = FEET(10) + INCHES(21) - INCHES(5);
		_mesh.position.x = sideSign * -1 * (FEET(42) + INCHES(2) );
		_mesh.rotation.y = sideSign * Math.PI / 2; // Depends on side
		_elasticity = 0.6; // TODO: Research
		_fkCoefficient = 0.25; // TODO: Research
	}

	init(side);

}