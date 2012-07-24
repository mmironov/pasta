<?php 
	/*$link = mysql_connect('localhost','root','5C5sJBMHu5PAQqz3'); 
	if (!$link) { 
		die('Could not connect to MySQL: ' . mysql_error()); 
	} 
	
	mysql_select_db("places", $link);*/
	
	/*$return_value = array();
	$return_value['value1'] = 'data 1';
	$return_value['value2'] = 'data 2';
	echo json_encode($return_value);*/
	

/*if (isset($_POST['sendValue'])){
    $value = $_POST['sendValue'];   
}else{
    $value = "s";
}

echo json_encode(array("returnValue"=>"This is returned from PHP : ".$value));  */
 
 
/*$logFile = 'logFile';
$res = json_decode(stripslashes($_POST['data']), true);


$lat = $res['points'][0]['latitude'];
$lng = $res['points'][0]['longitude'];
 
header("Content-type: text/plain");
echo $res['points'][0]['latitude'];
echo " ";
echo $res['points'][0]['longitude'];
echo " ";
	
	
$query = "select count(*) from cities where (power((latitude -".$lat."),2)".
			" + power((longitude - ".$lng."),2) - 1) < 0;";
			
		$queryOutput = mysql_query($query) or die("MySql Query error");
		$row = mysql_fetch_array($queryOutput);
		//echo "aa";
		echo $row['count(*)'];
	
error_log("result: ".$_POST['data'].", res=".json_encode($res), 3, $logFile);
error_log(", points: ".$res['points'][0]['longitude'], 3, $logFile);
error_log("\n", 3, $logFile);	 
mysql_close($link); */

require 'Slim/Slim.php';

$app = new Slim();

$app->get('/hello', 'hello');
$app->get('/coordinates/:lat,:lng', 'getCoords');
$app->post('/coordinates', 'postCoords');
$app->put('/coordinates/:id', 'updateCoords');
$app->delete('/person/:id', function ($id) {});

function getConnection() {
	$dbhost="localhost";
	$dbuser="root";
	$dbpass="5C5sJBMHu5PAQqz3";
	$dbname="places";
	$dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);	
	$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	return $dbh;
}

function hello()
{
	$sql = "select * from cities where name like 'k%'";
	try {
		$db = getConnection();
		$stmt = $db->query($sql);  
		$places = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"places": ' . json_encode($places) . '}';
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function getCoords($lat,$lng)
{
	$sql = "select * from cities where (power((latitude -".$lat."),2)".
			" + power((longitude - ".$lng."),2) - 1) < 0;";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);
		$stmt->bindParam("lat", $lat);
		$stmt->bindParam("lng", $lng);
		$stmt->execute();
		$coords = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"coords": ' . json_encode($coords) . '}';
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function postCoords(){
	error_log('addCoords\n', 3, '/var/tmp/php.log');
	$request = Slim::getInstance()->request();
	$body = $request->getBody();
	$coords = json_decode($body);
	$sql = "INSERT INTO cities VALUES (null, 'Dobrich', 'Dobrich', 50000, null, null, null, null, :lat, 100);";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->bindParam("lat", $coords->lat);
		//$stmt->bindParam("lng", $coords->lng);
		$stmt->execute();
//		$coords->id = $db->lastInsertId();
		$db = null;
		echo json_encode($coords); 
	} catch(PDOException $e) {
		error_log($e->getMessage(), 3, '/var/tmp/php.log');
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}


function updateCoords($id){
	$request = Slim::getInstance()->request();
	$body = $request->getBody();
	$coords = json_decode($body);
	$sql = "INSERT cities set name = 'Tolbuhin' and longitude = :lng where swCityID=:id;";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->bindParam("lng", $coords->lng);
		$stmt->bindParam("id", $id);
		$stmt->execute();
//		$coords->id = $db->lastInsertId();
		$db = null;
		echo json_encode($coords); 
	} catch(PDOException $e) {;
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

$app->run();

	 
?>