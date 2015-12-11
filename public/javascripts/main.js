
// MAIN

// standard global variables
var container, scene, camera, renderer, controls;
var keyboard = new KeyboardState();

// custom global variables
var basketball, court, homeBackboard, awayBackboard, homeRim, awayRim, homeNet, awayNet, arrowHelper;
var step = 1/60.0; // PATRAMETER (60 FPS) 0.022
// var step = 1/45; // PATRAMETER (45 FPS) 0.022
var BOUNCE_THRESHOLD = METERS(0.75); // PARAMETER

init();
animate();

// FUNCTIONS
function init() 
{
	// SCENE
	scene = new THREE.Scene();

	// PLAYING
	window.PLAY = false;
	
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight - 150;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(FEET(0),FEET(10),FEET(0));
	camera.lookAt(scene.position);
	
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer();
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	
	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	
	// CONTROLS
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.center = new THREE.Vector3(FEET(0), FEET(0), FEET(0));
	
	// LIGHT
	var topLight1 = new THREE.DirectionalLight(0xffffff);
	topLight1.position.set(0,FEET(50),0);
	topLight1.castShadow = true;
	topLight1.shadowDarkness = 0.5;
	topLight1.intensity = 0.0;
	scene.add(topLight1);

	var topLight2 = new THREE.DirectionalLight(0xffffff);
	topLight2.position.set(FEET(40),FEET(50),0);
	topLight2.castShadow = false;
	topLight2.shadowDarkness = 0.5;
	topLight2.intensity = 0.4;
	scene.add(topLight2);

	var topLight3 = new THREE.DirectionalLight(0xffffff);
	topLight3.position.set(FEET(-40),FEET(50),0);
	topLight3.castShadow = false;
	topLight3.shadowDarkness = 0.5;
	topLight3.intensity = 0.4;
	scene.add(topLight3);


	var light = new THREE.AmbientLight( 0x828282 ); // soft white light
	scene.add( light );
	
	// FLOOR
	court = new Court();
	scene.add(court.getMesh());

	// Backboard
	homeBackboard = new Backboard("HOME");
	scene.add(homeBackboard.getMesh());
	awayBackboard = new Backboard("AWAY");
	scene.add(awayBackboard.getMesh());

	// Rim
	homeRim = new Rim("HOME");
	scene.add(homeRim.getMesh());
	awayRim = new Rim("AWAY", scene);
	scene.add(awayRim.getMesh());

	// Net
	homeNet = new Net("HOME");
	scene.add(homeNet.getMesh());
	awayNet = new Net("AWAY");
	scene.add(awayNet.getMesh());
	
	// SKYBOX
	var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add(skyBox);
	
	////////////////
	// Basketball //
	////////////////
	basketball = new Basketball();
	scene.add(basketball.getMesh());

	// Velocity Display Arrow
	var velocity = basketball.getVelocity();
	var dir = velocity.clone().normalize();
	var length = velocity.length() / 10;
	var origin = basketball.getPosition();
	var hex = 0xff0000;
	arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
	scene.add(arrowHelper);

	// Set State Controls
	$("#x-position").val(PIXEL2FEET(origin.x));
	$("#y-position").val(PIXEL2FEET(origin.y));
	$("#z-position").val(PIXEL2FEET(origin.z));
	$("#x-velocity").val(PIXEL2FEET(velocity.x)).next().val(PIXEL2FEET(velocity.x));
	$("#y-velocity").val(PIXEL2FEET(velocity.y)).next().val(PIXEL2FEET(velocity.y));
	$("#z-velocity").val(PIXEL2FEET(velocity.z)).next().val(PIXEL2FEET(velocity.z));

	// Event Listeners
	$(document).on("setposition", function(event, x, y, z){
		basketball.setPosition(x, y, z);
		updateArrow(arrowHelper, basketball);
		controls.center = basketball.getPosition();
	});
	$(document).on("setvelocity", function(event, x, y, z){
		basketball.setVelocity(x, y, z);
		rotationScale = 0.25 / basketball.getRadius();
		var finalVelocity = basketball.getVelocity();
		basketball.setAngularVelocity(rotationScale * finalVelocity.x, 0, rotationScale * finalVelocity.z);
		updateArrow(arrowHelper, basketball);
	});
	$(document).on("reset", function(event){
		basketball.setPosition(0,0,0);
		basketball.setVelocity(0,0,0);
		$("#x-position").val(0);
		$("#y-position").val(0);
		$("#z-position").val(0);
		$("#x-velocity").val(0).next().val(0);
		$("#y-velocity").val(0).next().val(0);
		$("#z-velocity").val(0).next().val(0);
		updateArrow(arrowHelper, basketball);
	});
	$(document).on("ballfocus", function(event){
		controls.center = basketball.getPosition();
	});
}

function updateArrow(arrowHelper, basketball){
	arrowHelper.setDirection(basketball.getVelocity().normalize());
	var length = basketball.getVelocity().length() / 10;
	if (length == 0){
		length = 0.001;
	}
	arrowHelper.setLength(length);
	var bPos = basketball.getPosition();
	arrowHelper.position.set(bPos.x, bPos.y, bPos.z);
}

function animate() 
{
    requestAnimationFrame( animate );
	render();	
	update();
}

function update()
{
	if ( keyboard.pressed("z") ) 
	{	  
		// do something
		console.log("HEY");
	}
	
	controls.update();
}

function render() 
{
	if (camera.position.y < 1){
		camera.position.y = 1
	}

	if ($("#follow-ball").is(":checked")){
		controls.center = basketball.getPosition();
	}



	if (window.PLAY){
		// Evaluate Derivatives
		var F = basketball.evalF();
		var velocity = F[0];
		var acceleration = F[1];
		var dPosition = velocity.clone().multiplyScalar(step);
		var dVelocity = acceleration.clone().multiplyScalar(step);

		// Euler Step
		var position = basketball.getPosition();
		var velocity = basketball.getVelocity();
		basketball.addPosition(dPosition);
		basketball.addVelocity(dVelocity);

		var awayNetF = awayNet.evalF();
		for (var i in awayNet.getKnots()){
			var velocity = awayNetF['v'][i];
			var acceleration = awayNetF['a'][i];
			var dPosition = velocity.clone().multiplyScalar(step);
			var dVelocity = acceleration.clone().multiplyScalar(step);

			// Euler Step
			awayNet.addKnotPosition(i, dPosition);
			awayNet.addKnotVelocity(i, dVelocity);
			awayNet.updateLines();
		}

		var homeNetF = homeNet.evalF();
		for (var i in homeNet.getKnots()){
			var velocity = homeNetF['v'][i];
			var acceleration = homeNetF['a'][i];
			var dPosition = velocity.clone().multiplyScalar(step);
			var dVelocity = acceleration.clone().multiplyScalar(step);

			// Euler Step
			homeNet.addKnotPosition(i, dPosition);
			homeNet.addKnotVelocity(i, dVelocity);
			homeNet.updateLines();
		}

		var awayHit = {};
		var awayBackboardCollision = awayBackboard.hasCollision(basketball, awayHit);
		var homeHit = {};
		var homeBackboardCollision = homeBackboard.hasCollision(basketball, homeHit);
		var courtCollision = court.hasCollision(basketball);
		if (courtCollision){
			basketball.setCourtCollision(courtCollision);

			// "FIX" Basketball Position
			basketball.setY(basketball.getRadius() - 0 + court.getOffset());

			// Bounce off the court
			var initialVelocity = basketball.getVelocity();
			var finalVelocity = court.getBounceVector(initialVelocity);
			// Threshold: if less than certain velocity just set to zero
			if (finalVelocity.y <= BOUNCE_THRESHOLD){
				finalVelocity = new THREE.Vector3();
			}

			
			basketball.setVelocity(finalVelocity);
			
			// Spin off the court
			// TODO: Static Friction
			var rotationScale = 0.25 / basketball.getRadius();
			basketball.setAngularVelocity(rotationScale * finalVelocity.x, 0, rotationScale * finalVelocity.z);
			
			basketball.addFriction()
		}
		
		if (awayBackboardCollision){

			// "FIX" Basketball position
			awayBackboard.fixCollisionPosition(basketball, step, awayHit);

			// Bounce off the backboard
			var initialVelocity = basketball.getVelocity();
			var finalVelocity = awayBackboard.getBounceVector(initialVelocity, awayHit.points);
			basketball.setVelocity(finalVelocity);

			// Spin off the backboard
			rotationScale = 0.25 / basketball.getRadius();
			basketball.setAngularVelocity(rotationScale * finalVelocity.x, 0, rotationScale * finalVelocity.z);
		}
		
		if (homeBackboardCollision){
			// "FIX" Basketball position
			homeBackboard.fixCollisionPosition(basketball, homeHit);

			// Bounce off the backboard
			var initialVelocity = basketball.getVelocity();
			var finalVelocity = homeBackboard.getBounceVector(initialVelocity, homeHit.points);
			basketball.setVelocity(finalVelocity);

			// Spin off the backboard
			rotationScale = 0.25 / basketball.getRadius();
			basketball.setAngularVelocity(rotationScale * finalVelocity.x, 0, rotationScale * finalVelocity.z);
		}

		var awayRimCollision = awayRim.handleCollision(basketball);
		if (awayRimCollision){
			// // Spin off the rim
			// basketball.setVelocity(0,0,0);
			var finalVelocity = basketball.getVelocity();
			rotationScale = 0.25 / basketball.getRadius();
			basketball.setAngularVelocity(rotationScale * finalVelocity.x, 0, rotationScale * finalVelocity.z);
		}

		var homeRimCollision = homeRim.handleCollision(basketball);
		if (homeRimCollision){
			// // Spin off the rim
			// basketball.setVelocity(0,0,0);
			var finalVelocity = basketball.getVelocity();
			rotationScale = 0.25 / basketball.getRadius();
			basketball.setAngularVelocity(rotationScale * finalVelocity.x, 0, rotationScale * finalVelocity.z);
		}

		var bRevVel = new THREE.Vector3(0,0,0);
		for (var i in awayNet.getKnots()){
			var knot = awayNet.getKnots()[i];
			var result = knot.handleCollision(basketball, step);
			if (result.intersection){
				bRevVel.add(result["reverse-velocity"]);
			}
		}
		awayNet.updateLines();
		bRevVel.normalize().multiplyScalar(basketball.getVelocity().length() * 0.25);
		basketball.addVelocity(bRevVel);

		basketball.spin(step);
		updateArrow(arrowHelper, basketball);
	}

	renderer.render(scene, camera);
}