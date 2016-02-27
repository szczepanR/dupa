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

$childName = $_POST['param1'];
$firephp->log($childName);
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $dbh->prepare("SELECT e.event_id, e.parent_id, e.title, e.start, e.end, e.resourceID, e.repeat_freq, e.description, r.name, r.resourceID FROM events e LEFT JOIN resources r ON e.resourceID = r.resourceID WHERE e.title=:childName");

    $stmt->bindParam(':childName', $childName);

    //below query required to diplay polish signs on page
    $dbh->query('SET NAMES utf8');

    $stmt->execute();
    $events = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
    $eventArray['id'] = $row['event_id'];
    $eventArray['parent_id'] = $row['parent_id'];
    $eventArray['title'] = $row['name'];
    $eventArray['start'] = $row['start'];
    $eventArray['end'] = $row['end'];
    $eventArray['resources'] = $row['resourceID'];
    $eventArray['repeat_freq'] = $row['repeat_freq'];
    $eventArray['description']  = $row['description'];
    $events[] = $eventArray;
}
    echo json_encode($events);
?>
