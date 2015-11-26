function Net(side){

	const TOP_RADIUS = INCHES(9);
	const BOTTOM_RADIUS = INCHES(4.75);
	const HEIGHT = INCHES()
	const LAYER_SPACING = INCHES(0.5);

	var _mesh;

	this.getMesh = function(){
		return _mesh;
	}

	function init(side){
		// TODO
		var sideSign;
		if (side === "HOME"){
			sideSign = 1;
		} else if (side == "AWAY"){
			sideSign = -1;
		} else {
			return;
		}

		
	}

	init(side)
}