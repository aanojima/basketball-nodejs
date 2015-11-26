function Backboard(side){
	
	const WIDTH = INCHES(72);
	const HEIGHT = INCHES(42);
	const DEPTH = INCHES(2);
	const DISTANCE = FEET(42) + INCHES(4);
	const GROUND_DISTANCE = FEET(10) + 0.5*HEIGHT - INCHES(5);

	var _mesh, _elasticity, _fkCoefficient;

	this.getMesh = function(){
		return _mesh;
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
		var sideSign;
		if (side === "HOME"){
			sideSign = -1;
		} else if (side == "AWAY"){
			sideSign = 1;
		} else {
			return;
		}
		_mesh = new THREE.Mesh(geometry, material);
		_mesh.position.y = GROUND_DISTANCE; // Attachment Height - 1 inch
		_mesh.position.x = sideSign * DISTANCE;
		_mesh.rotation.y = sideSign * Math.PI / -2; // Depends on side
		_elasticity = 0.6; // TODO: Research
		_fkCoefficient = 0.25; // TODO: Research
	}

	init(side);

}