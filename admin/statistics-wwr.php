<?php
/**
 * Created by PhpStorm.
 * User: szczepan
 * Date: 17.09.17
 * Time: 23:07
 */
require_once('../FirePHPCore/FirePHP.class.php');
$firephp = FirePHP::getInstance(true);
require_once '../config/db-config.php';
$type = $_GET['type'];
$dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if ($type == 'specialists') {
    $childName = $_GET['childName'];
    $startPeriod = $_GET['startPeriod'];
    $endPeriod = $_GET['endPeriod'];
    $firephp->log($childName);


    $stmt = $dbh->prepare("SELECT e.event_id, e.resourceID, e.category_id, r.name, r.resourceID, r.speciality
                       , SUM(CASE WHEN e.category_id = '1' OR e.category_id = '2' OR e.category_id = '5' THEN 1 ELSE 0 END) AS processedEvents
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
        $eventArray['speciality'] = $row['speciality'];
        $eventArray['passedEvents'] = $row['processedEvents'];
        $eventArray['cancelEvents'] = $row['cancelledEvents'];
        $eventArray['totalEvents'] = $row['cancelledEvents'] + $row['processedEvents'];
        $events[] = $eventArray;
    }
    echo json_encode($events);
}
if ($type == 'eventsTypes') {

    $childName = $_GET['childName'];
    $startPeriod = $_GET['startPeriod'];
    $endPeriod = $_GET['endPeriod'];

    //$dbh2 = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    //$dbh2->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt2 = $dbh->prepare("SELECT e.event_id, e.resourceID, e.category_id
                       , SUM(CASE WHEN e.category_id = '1' OR e.category_id = '5' THEN 1 ELSE 0 END) AS normalEvents
                       , SUM(CASE WHEN e.category_id = '2' THEN 1 ELSE 0 END) AS studyEvents
                       , SUM(CASE WHEN e.category_id = '6' THEN 1 ELSE 0 END) AS cancelEvents
                       FROM events e WHERE e.title=:childName
                       AND DATE(e.start)>=:startPeriod AND DATE(e.start)<=:endPeriod");

    $stmt2->bindParam(':childName', $childName);
    $stmt2->bindParam(':startPeriod', $startPeriod);
    $stmt2->bindParam(':endPeriod', $endPeriod);
//below query required to diplay polish signs on page
    $dbh->query('SET NAMES utf8');

    $stmt2->execute();
    $events = array();

    while ($row = $stmt2->fetch(PDO::FETCH_ASSOC)) {
        $eventArray['normalEvents'] = $row['normalEvents'];
        $eventArray['studyEvents'] = $row['studyEvents'];
        $eventArray['cancelEvents'] = $row['cancelEvents'];
        $events[] = $eventArray;

    }
    echo json_encode($events);


}
/*********************
 * grouped statistics
 ********************/
if ($type == 'statisticGroupedTable'){
    $startPeriod = $_GET['startPeriod'];
    $endPeriod = $_GET['endPeriod'];

    $dbh->query('SET NAMES utf8');

    $stmt = $dbh->prepare("SELECT child_id, firstname, lastname, city, street, birthday, phone, email, teraphy_start, teraphy_end FROM child 
                                      WHERE teraphy_start>=:startPeriod AND teraphy_start<=:endPeriod OR teraphy_end>=:startPeriod AND teraphy_end<=:endPeriod");
    $stmt->bindParam(':startPeriod', $startPeriod);
    $stmt->bindParam(':endPeriod', $endPeriod);
    $stmt->execute();

    $kids = array();
    if ($stmt->rowCount() != 0) {

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $kidsArray['child_id'] = $row['child_id'];
            $kidsArray['firstname'] = $row['firstname'];
            $kidsArray['lastname'] = $row['lastname'];
            $kidsArray['city'] = $row['city'];
            $kidsArray['street'] = $row['street'];
            $kidsArray['birthday'] = $row['birthday'];
            $kidsArray['phone'] = $row['phone'];
            $kidsArray['email'] = $row['email'];
            $kidsArray['teraphy_start'] = $row['teraphy_start'];
            $kidsArray['teraphy_end'] = $row['teraphy_end'];
            $kids[] = $kidsArray;
        }
    }
    echo json_encode($kids);
}
?>