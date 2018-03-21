<?php
/**
 * Created by PhpStorm.
 * User: Sz
 * Date: 2015-03-30
 * Time: 21:08
 */
require_once('../FirePHPCore/FirePHP.class.php');
$firephp = FirePHP::getInstance(true);
    require_once '../config-OERW/db-config.php';

$childName = $_GET['childName'];
$startPeriod = $_GET['startPeriod'];
$endPeriod = $_GET['endPeriod'];
$firephp->log($childName);
$dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $dbh->prepare("SELECT e.event_id, e.resourceID, e.category_id, r.name, r.resourceID
                       , SUM(CASE WHEN e.category_id = '1' OR e.category_id = '2' THEN 1 ELSE 0 END) AS processedEvents
                       , SUM(CASE WHEN e.category_id = '6' THEN 1 ELSE 0 END) AS cancelledEvents
                       FROM events e LEFT JOIN resources r ON e.resourceID = r.resourceID WHERE e.title=:childName  
                       AND DATE(e.start)>=:startPeriod AND DATE(e.start)<=:endPeriod AND r.name<> 'null' GROUP BY r.name");


$stmt->bindParam(':childName', $childName);
$stmt->bindParam(':startPeriod', $startPeriod);
$stmt->bindParam(':endPeriod', $endPeriod);
//below query required to diplay polish signs on page
$dbh->query('SET NAMES utf8');

$stmt->execute();
$events = array();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $eventArray['resourceName'] = $row['name'];
    $eventArray['passedEvents'] = $row['processedEvents'];
    $eventArray['cancelEvents'] = $row['cancelledEvents'];
    $eventArray['totalEvents'] = $row['cancelledEvents'] + $row['processedEvents'];
    $events[] = $eventArray;
}
echo json_encode($events);
?>
