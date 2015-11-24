
// MAIN

// standard global variables
var container, scene, camera, renderer, controls;
var keyboard = new KeyboardState();

// custom global variables
var basketball, court;
var step = 0.02;

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
	camera.position.set(0,150,400);
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
	
	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(100,250,100);
	scene.add(light);
	
	// FLOOR
	court = new Court();
	scene.add(court.getMesh());
	
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
	// basketball.rotation.x += 0.01;
	// basketball.rotation.z += 0.05;
	// basketball.position.y -= 1;
	var F = basketball.evalF();
	dPosition = F[0];
	dVelocity = F[1];
	dPosition.multiplyScalar(step);
	dVelocity.multiplyScalar(step);

	// Euler Step)
	basketball.addPosition(dPosition);
	basketball.addVelocity(dVelocity);
	basketball.spin(step);

	// Check for Collision
	var courtCollision = court.hasCollision(basketball);

	if (courtCollision){
		// "FIX" Basketball Position
		basketball.setY(2 * basketball.getRadius() - 0.15 + court.getOffset());

		var initialVelocity = basketball.getVelocity();
		var bounceVelocity = court.getBounceVector(initialVelocity);

		var rotationScale = 0.25 / basketball.getRadius();
		basketball.setAngularVelocity(rotationScale * bounceVelocity.z, 0, -1 * rotationScale * bounceVelocity.x);
		basketball.setVelocity(bounceVelocity);
	}

	renderer.render(scene, camera);
}

function hasCollision(court, basketball){

}