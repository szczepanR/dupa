<?php
/**
 * Created by PhpStorm.
 * User: Sz
 * Date: 2015-03-30
 * Time: 21:08
 */
require_once('../FirePHPCore/FirePHP.class.php');
$firephp = FirePHP::getInstance(true);
    require_once '../config/db-config.php';

//parameter $_POST['start'] is taken from fullcalendar which provides start and stop , go to docs for fullcalendar
//we use this to filer events and cut down time refetch events

$actualDate = $_POST['start'];
$firephp->log($actualDate);
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    //$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
   //old working for 4 weeks ahead
    //$stmt = $dbh->prepare("SELECT e.event_id, e.parent_id, e.title, e.start, e.end, e.resourceID, e.repeat_freq, e.description, c.color, c.category_id FROM events e LEFT JOIN category c ON e.category_id = c.category_id WHERE e.start < (NOW()+INTERVAL 4 WEEK)");

$stmt = $dbh->prepare("SELECT e.event_id, e.parent_id, e.title, e.start, e.end, e.resourceID, e.repeat_freq, e.description, c.color, c.category_id FROM events e LEFT JOIN category c ON e.category_id = c.category_id WHERE DATE(e.start)=:actualDate");

    $stmt->bindParam(':actualDate', $actualDate);

    //below query required to diplay polish signs on page
    $dbh->query('SET NAMES utf8');

    $stmt->execute();
    $events = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
    $eventArray['id'] = $row['event_id'];
    $eventArray['parent_id'] = $row['parent_id'];
    $eventArray['title'] =$row['title'];
    $eventArray['start'] = $row['start'];
    $eventArray['end'] = $row['end'];
    $eventArray['resources'] = $row['resourceID'];
    $eventArray['repeat_freq'] = $row['repeat_freq'];
    $eventArray['color']  = $row['color'];
    $eventArray['category_id']  = $row['category_id'];
    $eventArray['description']  = $row['description'];
    $events[] = $eventArray;
}
    echo json_encode($events);
?>
