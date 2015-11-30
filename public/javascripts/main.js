
// MAIN
'use strict';

// standard global variables
var container, scene, camera, renderer, controls;
var keyboard = new KeyboardState();

// custom global variables
var basketball, court, homeBackboard, awayBackboard, homeRim, awayRim, homeNet, awayNet;
var step = 0.022; // PATRAMETER
var BOUNCE_THRESHOLD = METERS(0.75); // PARAMETER

init();
animate();

// FUNCTIONS
function init() 
{
	// SCENE
	scene = new THREE.Scene();
	
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(FEET(20),FEET(10),FEET(10));
	camera.lookAt(scene.position);	
	
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	
	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	
	// CONTROLS
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.center = new THREE.Vector3(388.62, 87.63, 27.432);
	
	// LIGHT
	var light = new THREE.DirectionalLight(0xffffff);
	light.position.set(0,0,0);
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
	var knotMeshes = homeNet.getKnots();
	for (var i in knotMeshes){
		var mesh = knotMeshes[i];
		scene.add(mesh);
	}
	var lineMeshes = homeNet.getLines();
	for (var i in lineMeshes){
		var line = lineMeshes[i];
		var mesh = lineMeshes[i];
		scene.add(mesh);
	}

	awayNet = new Net("AWAY");
	scene.add(awayNet.getMesh());
	// var knotMeshes = awayNet.getKnots();
	// for (var i in knotMeshes){
	// 	var mesh = knotMeshes[i];
	// 	scene.add(mesh);
	// }
	// var lineMeshes = awayNet.getLines();
	// for (var i in lineMeshes){
	// 	var line = lineMeshes[i];
	// 	var mesh = lineMeshes[i];
	// 	scene.add(mesh);
	// }


	
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

	// Collision-Detection
	var courtCollision = court.hasCollision(basketball);

	// Court-Basketball Forces
	if (courtCollision){
		// Add a Normal Force
		var courtNormal = court.getNormalForce(basketball.getMass());
		basketball.addNormal("court", courtNormal);

		// Add a Friction Force
		var courtFriction = court.getFrictionForce(courtNormal, basketball.getVelocity());
		basketball.addFriction("court", courtFriction);
		
	} else {
		basketball.removeNormal("court");
		basketball.removeFriction("court");
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

		// TODO: "FIX" Basketball position
		awayBackboard.fixCollisionPosition(basketball, step, awayHit);

		// Bounce off the backboard
		// TODO: Fix for edges and corners
		var initialVelocity = basketball.getVelocity();
		var finalVelocity = awayBackboard.getBounceVector(initialVelocity, awayHit.points);
		basketball.setVelocity(finalVelocity);

		// Spin off the backboard
		rotationScale = 0.25 / basketball.getRadius();
		basketball.setAngularVelocity(rotationScale * finalVelocity.x, 0, rotationScale * finalVelocity.z);
	}
	
	if (homeBackboardCollision){
		// TODO: "FIX" Basketball position
		homeBackboard.fixCollisionPosition(basketball, homeHit);

		// Bounce off the backboard
		// TODO: Fix for edges and corners
		var initialVelocity = basketball.getVelocity();
		var finalVelocity = homeBackboard.getBounceVector(initialVelocity, homeHit.points);
		basketball.setVelocity(finalVelocity);

		// Spin off the backboard
		rotationScale = 0.25 / basketball.getRadius();
		basketball.setAngularVelocity(rotationScale * finalVelocity.x, 0, rotationScale * finalVelocity.z);
	}

	var awayRimCollision = awayRim.hasCollision(basketball);
	if (awayRimCollision){
		basketball.setVelocity(0,0,0);
	}

	basketball.spin(step);

	renderer.render(scene, camera);
}