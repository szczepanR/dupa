<?php
/**
 * Created by PhpStorm.
 * User: Sz
 * Date: 2015-04-19
 * Time: 16:52
 */
require_once('../FirePHPCore/FirePHP.class.php');
$firephp = FirePHP::getInstance(true);
require_once '../config-OERW/db-config.php';
$type = $_POST['type'];

$event_id = $_POST['event_id'];
$title = $_POST['edit-title'];
$start_date = $_POST['edit-start-date'];
$weekday = date('N', strtotime($start_date));
$start_time = $_POST['edit-start-time'];
$end_time = $_POST['edit-end-time'];
$resourceID = $_POST['edit-resourceID'];
$category_id = $_POST['category_id'];
$group_name = $_POST['group_name'];
$description = $_POST['description'];
$start = $start_date . " " . $start_time;
$end = $start_date . " " . $end_time;

//update all events
$firephp->log($start_time);
$firephp->log($category_id);

//update events no repeate
if ($type == 'update-all-events'){
    //$repeat_freq = $_POST['repeat_freq'];
    //$repeats = $_POST['repeats'];
    $parent_id = $_POST['parent_id'];

    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    try{
        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("UPDATE events_parent SET
          start_date=:start_date, start_time=:start_time, end_time=:end_time,category_id=:category_id, weekday=:weekday WHERE parent_id=:parent_id");


        $stmt->bindParam(':start_date', $start_date);
        $stmt->bindParam(':start_time', $start_time);
        $stmt->bindParam(':end_time', $end_time);

        $stmt->bindParam(':weekday', $weekday);
        $stmt->bindParam(':parent_id', $parent_id);
        $stmt->bindParam(':category_id', $category_id);

        $stmt->execute();
        $firephp->log($title, 'title');

        $dbh->query('SET NAMES utf8');

        //changes only time  start=CONCAT_WS(' ',DATE(start),:start_time), end=CONCAT_WS(' ',DATE(end),:end_time)
        $stmt = $dbh->prepare("UPDATE events SET start=CONCAT_WS(' ',DATE(start),:start_time), end=CONCAT_WS(' ',DATE(end),:end_time), category_id=:category_id WHERE parent_id=:parent_id");

        $stmt->bindParam(':start_time', $start_time);
        $stmt->bindParam(':end_time', $end_time);
        $stmt->bindParam(':parent_id', $parent_id);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->execute();
        $dbh->commit();

        //we need to update previously cancelled events
        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("SELECT * FROM child WHERE groupName=:groupName");
        $stmt->bindParam(':groupName', $group_name);
        $stmt->execute();
        $dbh->commit();

        if ($stmt->rowCount() != 0) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $firstname = $row['firstname'];
                $lastname = $row['lastname'];
                $resourcesArray['name'] = $firstname . ' ' . $lastname;
                $resources[] = $resourcesArray;
                //$firephp->log($resourcesArray["name"],"dzieci z grupy");
            }
        }
        $dbh->beginTransaction();

        $dbh->query('SET NAMES utf8');
        foreach ($resources as $row) {
            $stmt = $dbh->prepare("UPDATE events SET description=:description, category_id=6 WHERE DATE(start)='$start_date' AND
                                 ((TIME(start)>'$start_time' AND TIME(start)<'$end_time') OR
                                 (TIME(end)>'$start_time' AND TIME(end)<'$end_time') OR
                                 (TIME(start)='$start_time' AND TIME(end)='$end_time') OR
                                 (TIME(start)='$start_time' AND TIME(start)<'$end_time') OR
                                 (TIME(end)='$end_time' AND TIME(end)>'$start_time')) AND category_id=1");
            $firephp->log("petla");
            $stmt->bindParam(':description', $description);
            $stmt->execute();

        }
        $dbh->commit();


    }
    catch(Exception $e){
        $firephp->log($e, 'error');
        $dbh->rollback();
    }
}

//update events with repeate
if ($type == 'update-all-events-repeate'){
    //$repeat_freq = $_POST['repeat_freq'];
    //$repeats = $_POST['repeats'];
    $parent_id = $_POST['parent_id'];

    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    try{
        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("UPDATE events_parent SET
          start_date=:start_date, start_time=:start_time, end_time=:end_time,category_id=:category_id, weekday=:weekday WHERE parent_id=:parent_id");


        $stmt->bindParam(':start_date', $start_date);
        $stmt->bindParam(':start_time', $start_time);
        $stmt->bindParam(':end_time', $end_time);

        $stmt->bindParam(':weekday', $weekday);
        $stmt->bindParam(':parent_id', $parent_id);
        $stmt->bindParam(':category_id', $category_id);

        $stmt->execute();
        $firephp->log($title, 'title');

        $dbh->query('SET NAMES utf8');

        //changes only time  start=CONCAT_WS(' ',DATE(start),:start_time), end=CONCAT_WS(' ',DATE(end),:end_time)
        $stmt = $dbh->prepare("UPDATE events SET start=CONCAT_WS(' ',DATE(start),:start_time), end=CONCAT_WS(' ',DATE(end),:end_time), category_id=:category_id WHERE parent_id=:parent_id");

        $stmt->bindParam(':start_time', $start_time);
        $stmt->bindParam(':end_time', $end_time);
        $stmt->bindParam(':parent_id', $parent_id);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->execute();
        $dbh->commit();

        //we need to update previously cancelled events
        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("SELECT * FROM child WHERE groupName=:groupName");
        $stmt->bindParam(':groupName', $group_name);
        $stmt->execute();
        $dbh->commit();

        if ($stmt->rowCount() != 0) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $firstname = $row['firstname'];
                $lastname = $row['lastname'];
                $resourcesArray['name'] = $firstname . ' ' . $lastname;
                $resources[] = $resourcesArray;
                //$firephp->log($resourcesArray["name"],"dzieci z grupy");
            }
        }
        $dbh->beginTransaction();

        $dbh->query('SET NAMES utf8');
        foreach ($resources as $row) {
            $stmt = $dbh->prepare("UPDATE events SET description=:description, category_id=6 WHERE DATE(start)>='$start_date' AND
                                 ((TIME(start)>'$start_time' AND TIME(start)<'$end_time') OR
                                 (TIME(end)>'$start_time' AND TIME(end)<'$end_time') OR
                                 (TIME(start)='$start_time' AND TIME(end)='$end_time') OR
                                 (TIME(start)='$start_time' AND TIME(start)<'$end_time') OR
                                 (TIME(end)='$end_time' AND TIME(end)>'$start_time')) AND category_id=1");
            //$firephp->log("petla");
            $stmt->bindParam(':description', $description);
            $stmt->execute();

        }
        $dbh->commit();


    }
    catch(Exception $e){
        $firephp->log($e, 'error');
        $dbh->rollback();
    }
}
//update child event
if ($type == 'update-child-event'){
    $parent_id = $_POST['parent_id'];

    $repeat_freq = $_POST['repeat_freq'];
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

////    may be need for get last id for parnet_id
////    $stmt = $dbh->prepare("SELECT MAX(parent_id) FROM events_parent");
////    $stmt->execute();
////    $last_id=$stmt->fetch(PDO::FETCH_NUM)[0];
////    $firephp->log($last_id, 'parent_id_last');
//
//
    try{
        $dbh->beginTransaction();

        $stmt = $dbh->prepare("UPDATE events SET start=CONCAT_WS(' ',DATE(start),:start_time), end=CONCAT_WS(' ',DATE(end),:end_time) WHERE parent_id=:parent_id AND DATE(start)='$start_date'");

        $stmt->bindParam(':start_time', $start_time);
        $stmt->bindParam(':end_time', $end_time);
        $stmt->bindParam(':parent_id', $parent_id);
          $stmt->execute();
        $dbh->commit();

        //we need to update previously cancelled events
        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("SELECT * FROM child WHERE groupName=:groupName");
        $stmt->bindParam(':groupName', $group_name);
        $stmt->execute();
        $dbh->commit();

        if ($stmt->rowCount() != 0) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $firstname = $row['firstname'];
                $lastname = $row['lastname'];
                $resourcesArray['name'] = $firstname . ' ' . $lastname;
                $resources[] = $resourcesArray;
                //$firephp->log($resourcesArray["name"],"dzieci z grupy");
            }
        }
        $dbh->beginTransaction();

        $dbh->query('SET NAMES utf8');
        foreach ($resources as $row) {
            $stmt = $dbh->prepare("UPDATE events SET description=:description, category_id=6 WHERE DATE(start)='$start_date' AND
                                 ((TIME(start)>'$start_time' AND TIME(start)<'$end_time') OR
                                 (TIME(end)>'$start_time' AND TIME(end)<'$end_time') OR
                                 (TIME(start)='$start_time' AND TIME(end)='$end_time') OR
                                 (TIME(start)='$start_time' AND TIME(start)<'$end_time') OR
                                 (TIME(end)='$end_time' AND TIME(end)>'$start_time')) AND category_id=1");
            $firephp->log("petla");
            $stmt->bindParam(':description', $description);
            $stmt->execute();

        }
        $dbh->commit();


    }
    catch(Exception $e){
        $firephp->log($e, 'error');
        $dbh->rollback();
    }
//    $category_id = $_POST['category_id'];
//    $event_id = $_POST['event_id'];
//    $repeat_freq = 0;
//    $repeats = 0;
//    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
//    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
//    $stmt = $dbh->prepare("DELETE FROM events WHERE event_id='$event_id'");
//    //below query required to diplay polish signs on page
//    //$dbh->query('SET NAMES utf8');
//
//    $stmt->execute();
//    try{
//        $dbh->beginTransaction();
//        $dbh->query('SET NAMES utf8');
//        $stmt = $dbh->prepare("INSERT INTO events_parent
//                (title,start_date, start_time, end_time, resourceID, weekday, repeats, repeat_freq, category_id)
//                VALUES (:title,:start_date, :start_time, :end_time, :resourceID, :weekday, :repeats, :repeat_freq, :category_id)");
//
//        $stmt->bindParam(':title', $title );
//        $stmt->bindParam(':start_date', $start_date);
//        $stmt->bindParam(':start_time', $start_time);
//        $stmt->bindParam(':end_time', $end_time);
//        $stmt->bindParam(':resourceID', $resourceID);
//        $stmt->bindParam(':weekday', $weekday);
//        $stmt->bindParam(':repeats', $repeats);
//        $stmt->bindParam(':repeat_freq', $repeat_freq);
//        $stmt->bindParam(':category_id', $category_id);
//
//        $stmt->execute();
//
//        $last_id = $dbh->lastInsertId();
//        $dbh->query('SET NAMES utf8');
//        $stmt = $dbh->prepare("INSERT INTO events
//                (parent_id, title, start, end, resourceID, repeat_freq, category_id)
//                VALUES (:parent_id, :title, :start, :end, :resourceID, :repeat_freq, :category_id)");
//
//        $stmt->bindParam(':title', $title );
//        $stmt->bindParam(':start', $start);
//        $stmt->bindParam(':end', $end);
//        $stmt->bindParam(':resourceID', $resourceID);
//        $stmt->bindParam(':parent_id', $last_id);
//        $stmt->bindParam(':repeat_freq', $repeat_freq);
//        $stmt->bindParam(':category_id', $category_id);
//        $stmt->execute();
//
//        $dbh->commit();
//
//
//    }
//    catch(Exception $e){
//        $firephp->log($e, 'error');
//        $dbh->rollback();
//    }

}


//transform event to cancelled
if ($type == 'cancel-event'){

    $category_id = $_POST['category_id'];
    $event_id = $_POST['event_id'];
    $description = $_POST['description'];
    $repeat_freq = 0;
    $repeats = 0;
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $dbh->prepare("DELETE FROM events WHERE event_id='$event_id'");
    //below query required to diplay polish signs on page
    //$dbh->query('SET NAMES utf8');

    $stmt->execute();
    try{
        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("INSERT INTO events_parent
                (title,start_date, start_time, end_time, resourceID, weekday, repeats, repeat_freq, category_id)
                VALUES (:title,:start_date, :start_time, :end_time, :resourceID, :weekday, :repeats, :repeat_freq, :category_id)");

        $stmt->bindParam(':title', $title );
        $stmt->bindParam(':start_date', $start_date);
        $stmt->bindParam(':start_time', $start_time);
        $stmt->bindParam(':end_time', $end_time);
        $stmt->bindParam(':resourceID', $resourceID);
        $stmt->bindParam(':weekday', $weekday);
        $stmt->bindParam(':repeats', $repeats);
        $stmt->bindParam(':repeat_freq', $repeat_freq);
        $stmt->bindParam(':category_id', $category_id);

        $stmt->execute();

        $last_id = $dbh->lastInsertId();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("INSERT INTO events
                (parent_id, title, start, end, resourceID, repeat_freq, category_id, description)
                VALUES (:parent_id, :title, :start, :end, :resourceID, :repeat_freq, :category_id, :description)");

        $stmt->bindParam(':title', $title );
        $stmt->bindParam(':start', $start);
        $stmt->bindParam(':end', $end);
        $stmt->bindParam(':resourceID', $resourceID);
        $stmt->bindParam(':parent_id', $last_id);
        $stmt->bindParam(':repeat_freq', $repeat_freq);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->bindParam(':description', $description);
        $stmt->execute();

        $dbh->commit();


    }
    catch(Exception $e){
        $firephp->log($e, 'error');
        $dbh->rollback();
    }

}

