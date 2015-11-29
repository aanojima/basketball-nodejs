function Net(side){

	const TOP_RADIUS = INCHES(9);
	const BOTTOM_RADIUS = INCHES(5.75);
	const HEIGHT = INCHES();
	const TOP_LAYER_SPACING = INCHES(4);
	const LAYER_SPACING = INCHES(1.5);
	const KNOT_LAYERS = 8; // plus ones on top and ones on bottom
	const KNOTS_PER_LAYER = 12;
	const ANGLE_STEP = (2.0 * Math.PI / KNOTS_PER_LAYER);
	const DISTANCE = FEET(42) - INCHES(4) - TOP_RADIUS; // Backboard Depth

	// TODO: See Object3D Group (group.add)
	var _knotMeshes, _lineMeshes, _group;

	this.getMesh = function(){
		return _group;
	}

	this.getKnots = function(){
		return _knotMeshes;
	}

	this.getLines = function(){
		return _lineMeshes;
	}

	function getKnot(layer,index){
		// I is the Layer
		// J is the Knot
		return _knotMeshes[layer*KNOTS_PER_LAYER + index];
	}

	function getLine(layer,index){
		// I is the layer
		// J is the knot
		return _lineMeshes[layer*KNOTS_PER_LAYER + index];
	}

	function changePosition(dx,dy,dz){
		for (var i in _knotMeshes){
			var knot = _knotMeshes[i];
			knot.position.x += dx;
			knot.position.y += dy;
			knot.position.z += dz;
		}
	}
	this.changePosition = changePosition;

	function init(side){
		_knotMeshes = [];
		_lineMeshes = [];
		_group = new THREE.Object3D();

		// TOP FIXED LAYER
		for (var i = 0; i < KNOTS_PER_LAYER; i++){
			var angle = i * ANGLE_STEP;
			var x = TOP_RADIUS * Math.cos(angle);
			var z = TOP_RADIUS * Math.sin(angle);
			var knot = new Knot(x,0,z);
			_knotMeshes.push(knot.getMesh());
			_group.add(knot.getMesh());
		}

		// OTHER LAYERS
		for (var j = 0; j < KNOT_LAYERS + 1; j++){
			var y = -1*TOP_LAYER_SPACING - j * LAYER_SPACING;
			var startAngle = ((j + 1)  % 2) * 0.5 * ANGLE_STEP;
			var radius = Math.exp(j / (-4 * KNOTS_PER_LAYER)) * BOTTOM_RADIUS; // TODO: Depends on some function
			for (var i = 0; i < KNOTS_PER_LAYER; i++){
				var angle = startAngle + i * ANGLE_STEP;
				var x = radius * Math.cos(angle);
				var z = radius * Math.sin(angle);
				var knot = new Knot(x,y,z);
				_knotMeshes.push(knot.getMesh());
				_group.add(knot.getMesh());
				
				// First Diagonal
				var previousKnotA = getKnot(j,i);
				var lineA = new Line(previousKnotA, knot.getMesh());
				_lineMeshes.push(lineA.getMesh());
				_group.add(lineA.getMesh());

				// Second Diagonal
				var indexOffset = (j % 2 == 0) ? 1 : KNOTS_PER_LAYER - 1;
				var previousKnotB = getKnot(j,(i+indexOffset) % KNOTS_PER_LAYER);
				var lineB = new Line(previousKnotB, knot.getMesh());
				_lineMeshes.push(lineB.getMesh());
				_group.add(lineB.getMesh());
			}
		}

		var sideSign;
		if (side === "HOME"){
			sideSign = -1;
		} else if (side == "AWAY"){
			sideSign = 1;
		} else {
			return;
		}
		changePosition(sideSign * DISTANCE,FEET(10),0);

	}

	init(side);
}

function Knot(x,y,z){

	// TODO: Make knot another line with top and bottom
	// see https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTgLCQJeOoxHAPyAAEoFc12kLYaLipYL2tq0lVJR9LvDQD8kWMe8A
	const KNOT_RADIUS = INCHES(0.01);

	var _mesh;

	this.getMesh = function(){
		return _mesh;
	}

	function init(x,y,z){
		var geometry = new THREE.SphereGeometry(KNOT_RADIUS, 32, 32);
		var material = new THREE.MeshBasicMaterial({
			color: 0xffffff
		});
		_mesh = new THREE.Mesh(geometry, material);
		_mesh.position.set(x,y,z);
	}

	init(x,y,z);
}

function Line(meshA,meshB){
	const SPRING_CONSTANT = 0.25; // TODO

	var _mesh;

	this.getMesh = function(){
		return _mesh;
	}

	function init(meshA,meshB){
		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			meshA.position,
			meshB.position
		);

		var material = new THREE.LineBasicMaterial({
			color : 0xffffff,
			linewidth : INCHES(1)
		});

		_mesh = new THREE.Line(geometry, material);
	}

	init(meshA, meshB);
}