<?php
/**
 * Created by PhpStorm.
 * User: Sz
 * Date: 2015-04-09
 * Time: 20:16
 */
require_once '../config-OERW/db-config.php';

$dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

//below query required to diplay polish signs on page
$dbh->query('SET NAMES utf8');

$stmt = $dbh->prepare("SELECT resourceid, name, workingDays, sortID FROM resources");
$stmt->execute();
$resources = array();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
    $eventArray['id'] = $row['resourceid'];
    $eventArray['name'] = $row['name'];
    $eventArray['workingDays'] = $row['workingDays'];
    $eventArray['sortID'] = $row['sortID'];
    $resources[] = $eventArray;
}
echo json_encode($resources);
?>