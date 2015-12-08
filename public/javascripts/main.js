
// MAIN

// standard global variables
var container, scene, camera, renderer, controls;
var keyboard = new KeyboardState();

// custom global variables
var basketball, court, homeBackboard, awayBackboard, homeRim, awayRim, homeNet, awayNet, arrowHelper;
const MAX_STEP = 1 / 30;
var step = 1 / 120; // PATRAMETER (30 FPS) 0.022
var BOUNCE_THRESHOLD = METERS(0.75); // PARAMETER
var timestamp = 0;

init();
animate(timestamp);

function reset()
{
	// Get Current Camera Position
}

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
	camera.position.set(FEET(30),FEET(30),FEET(0));
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
	controls.center = new THREE.Vector3(FEET(41), FEET(10), FEET(0));
	
	// LIGHT
	var light = new THREE.DirectionalLight(0xffffff);
	light.position.set(0,FEET(50),0);
	light.castShadow = true;
	light.shadowDarkness = 0.5;
	scene.add(light);
	
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
	awayRim = new Rim("AWAY");
	scene.add(awayRim.getMesh());

	// Net
	homeNet = new Net("HOME");
	scene.add(homeNet.getMesh());
	awayNet = new Net("AWAY");
	scene.add(awayNet.getMesh());
	
	// SKYBOX
	// var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	// var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	// var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	// scene.add(skyBox);
	
	////////////
	// CUSTOM //
	////////////
	basketball = new Basketball();
	scene.add(basketball.getMesh());

	var velocity = basketball.getVelocity();
	var dir = velocity.clone().normalize();
	var length = velocity.length() / 10;
	var origin = basketball.getPosition();
	var hex = 0xff0000;
	arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
	scene.add(arrowHelper);

	$(document).on("setposition", function(event, x, y, z){
		basketball.setPosition(x, y, z);
		updateArrow(arrowHelper, basketball);
	});

	$(document).on("setvelocity", function(event, x, y, z){
		basketball.setVelocity(x, y, z);
		updateArrow(arrowHelper, basketball);
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

function animate(time) 
{
	// step = Math.min((time - timestamp || step) / 1000, MAX_STEP);
	// timestamp = time;
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
	if (window.PLAY){
		// Collision-Detection
		var courtCollision = court.hasCollision(basketball);

		// Court-Basketball Forces
		if (courtCollision){
			// Add a Normal Force
			// var courtNormal = court.getNormalForce(basketball.getMass());
			// basketball.addNormal("court", courtNormal);

			// Add a Friction Force
			// var courtFriction = court.getFrictionForce(courtNormal, basketball.getVelocity());
			// basketball.addFriction("court", courtFriction);
			
		} else {
			// basketball.removeNormal("court");
			// basketball.removeFriction("court");
		}

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

		var awayHit = {};
		var awayBackboardCollision = awayBackboard.hasCollision(basketball, awayHit);
		var homeHit = {};
		var homeBackboardCollision = homeBackboard.hasCollision(basketball, homeHit);
		courtCollision = court.hasCollision(basketball);
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

		basketball.spin(step);

		updateArrow(arrowHelper, basketball);
	}

	renderer.render(scene, camera);
}