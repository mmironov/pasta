<?php 
	$link = mysql_connect('localhost','root','5C5sJBMHu5PAQqz3'); 
	if (!$link) { 
		die('Could not connect to MySQL: ' . mysql_error()); 
	} 
	
	mysql_select_db("places", $link);
	
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
 
 
$logFile = 'logFile';
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

	 mysql_close($link); 
	 
?>