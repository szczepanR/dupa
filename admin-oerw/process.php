<?php
/**
 * Created by PhpStorm.
 * User: Sz
 * Date: 2015-04-12
 * Time: 12:50
 */
require_once('../FirePHPCore/FirePHP.class.php');
$firephp = FirePHP::getInstance(true);
require_once '../config-OERW/db-config.php';
$type = $_POST['type'];

//delete all events
if ($type == 'delete-all-events'){
    $parent_id = $_POST['parent_id'];
    $event_id = $_POST['event_id'];
    $event_date = $_POST['event_date'];

    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $dbh->prepare("DELETE FROM events WHERE parent_id='$parent_id' AND CONCAT_WS(DATE(start),' ',start)>= CONCAT_WS(DATE(start),' ','$event_date')");
    $stmt2 = $dbh->prepare("DELETE FROM events_parent WHERE parent_id='$parent_id'");


    $stmt->execute();
    $stmt2->execute();
    if($stmt && $stmt2)
        echo json_encode(array('status'=>'success'));
        else
        echo json_encode(array('status'=>'failed'));


}
if ($type == 'delete-leave'){
    try {
        $event_id = $_POST['event_id'];
        $event_date = $_POST['event_date'];
        $start_time = $_POST['starttime'];
        $end_time = $_POST['endtime'];
        $description = "NB.SPEC.";
        $resourceID = $_POST['resourceID'];
        $newDescription = "";
        $beginLeave = date($event_date);
        //
        $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $dbh->beginTransaction();
        $stmt = $dbh->prepare("DELETE FROM events WHERE event_id='$event_id'");
        $stmt->execute();
        $dbh->commit();
    }
    catch (Exception $e) {
        $firephp->log($e, 'error');
        $dbh->rollback();

    }
    $dbh->beginTransaction();
   try {

        $stmt = $dbh->prepare("UPDATE events SET description=:newDescription, category_id=1 WHERE resourceID=:resourceid AND DATE(start)='$event_date' AND
                                 ((TIME(start)>'$start_time' AND TIME(start)<'$end_time') OR
                                 (TIME(end)>'$start_time' AND TIME(end)<'$end_time') OR
                                 (TIME(start)='$start_time' AND TIME(end)='$end_time') OR
                                 (TIME(start)='$start_time' AND TIME(start)<'$end_time') OR
                                 (TIME(end)='$end_time' AND TIME(end)>'$start_time')) AND category_id=6 AND description LIKE'%$description%'");
        $stmt->bindParam(':resourceid', $resourceID);
        $stmt->bindParam(':newDescription', $newDescription);
        $stmt->execute();
        $dbh->commit();


    }
    catch (Exception $e) {
        $firephp->log($e, 'error');
        $dbh->rollback();

    }


}
if ($type == 'delete-leave-for-kid'){
    try {
        $event_id = $_POST['event_id'];
        $event_date = $_POST['event_date'];
        $start_time = $_POST['starttime'];
        $end_time = $_POST['endtime'];
        $description = $_POST['description'];;
        $resourcename = $_POST['resourcename'];
        $newDescription = "";
        $beginLeave = date($event_date);
        $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $dbh->beginTransaction();
        $stmt = $dbh->prepare("DELETE FROM events WHERE event_id='$event_id'");
        $stmt->execute();
        $dbh->commit();
    }
    catch (Exception $e) {
        $firephp->log($e, 'error');
        $dbh->rollback();

    }
    $dbh->beginTransaction();
    try {

        $stmt = $dbh->prepare("UPDATE events SET description=:newDescription, category_id=1 WHERE title=:resourcename AND DATE(start)='$event_date' AND
                                 ((TIME(start)>'$start_time' AND TIME(start)<'$end_time') OR
                                 (TIME(end)>'$start_time' AND TIME(end)<'$end_time') OR
                                 (TIME(start)='$start_time' AND TIME(end)='$end_time') OR
                                 (TIME(start)='$start_time' AND TIME(start)<'$end_time') OR
                                 (TIME(end)='$end_time' AND TIME(end)>'$start_time')) AND category_id=6 AND description LIKE'%$description%'");
        $stmt->bindParam(':resourcename', $resourcename);
        $stmt->bindParam(':newDescription', $newDescription);
        $stmt->execute();
        $dbh->commit();


    }
    catch (Exception $e) {
        $firephp->log($e, 'error');
        $dbh->rollback();

    }


}
//delete ONLY child event
if ($type == 'delete-child-event'){
   $event_id = $_POST['event_id'];

    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $dbh->prepare("DELETE FROM events WHERE event_id='$event_id'");

    $stmt->execute();
    if($stmt)
        echo json_encode(array('status'=>'success'));
    else
        echo json_encode(array('status'=>'failed'));


}

//delete all lessons for child from one day
if ($type == 'delete-events-from-day') {
    $start_date = $_POST['event_date'];
    $start_time = $_POST['start_time'];
    $title = $_POST['title'];
    $repeat_freq = $_POST['repeat_freq'];
    $start = $start_date . " " . $start_time;

    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($repeat_freq == 0) {

        //below query required to diplay polish signs on page, has to be here because names with polish signs will not delete
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("DELETE FROM events WHERE title='$title' AND start LIKE '%$start_date%'");

        $stmt->execute();

        if ($stmt)
            echo json_encode(array('status' => 'success'));
        else
            echo json_encode(array('status' => 'failed'));

        // for single event we can delete parent events as well, no reason to store in DB
        $stmt = $dbh->prepare("DELETE FROM events_parent WHERE title='$title' AND start_date='$start_date'");

        $stmt->execute();

        if ($stmt)
            echo json_encode(array('status' => 'success'));
        else
            echo json_encode(array('status' => 'failed'));


    }
    else
    {

        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("DELETE FROM events WHERE title='$title' AND start LIKE '%$start_date%'");
        //below query required to diplay polish signs on page
       
        $stmt->execute();
        if ($stmt)
            echo json_encode(array('status' => 'success'));
        else
            echo json_encode(array('status' => 'failed'));
    }

}

//get resource Name, for group plan resources are kids!!!!
if ($type == 'getResourceNameForGroup'){
    $resource_id = $_POST['resourceID'];

    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->query('SET NAMES utf8');
    $stmt = $dbh->prepare("SELECT * FROM child WHERE child_id='$resource_id'");
    //below query required to diplay polish signs on page

    $stmt->execute();
    $resources = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $resourcesArray['id'] = $row['child_id'];
        $firstname = $row['firstname'];
        $lastname = $row['lastname'];
        $resourcesArray['groupName'] = $row['groupName'];
        $resourcesArray['name'] = $firstname . ' ' . $lastname;
        $resources = $resourcesArray;
    }
    echo json_encode($resources);
}
//get resource Name
if ($type == 'getResourceName'){
    $resource_id = $_POST['resourceID'];

    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->query('SET NAMES utf8');
    $stmt = $dbh->prepare("SELECT * FROM resources WHERE resourceid='$resource_id'");
    //below query required to diplay polish signs on page

    $stmt->execute();
    $resources = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $resourcesArray['id'] = $row['resourceid'];
        $resourcesArray['name'] = $row['name'];
        $resources = $resourcesArray;
    }
    echo json_encode($resources);
}
//get teacher Id for group calendar
if ($type == 'getTeacherId'){
    $name = $_POST['name'];

    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->query('SET NAMES utf8');
    $stmt = $dbh->prepare("SELECT * FROM resources WHERE name='$name'");
    //below query required to diplay polish signs on page

    $stmt->execute();
    $resources = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $resourcesArray['id'] = $row['resourceid'];
        $resourcesArray['name'] = $row['name'];
        $resources = $resourcesArray;
    }
    echo json_encode($resources);
}
//autocomplete child name
if ($type =='nameAutocomplete'){

    $term = $_POST['query'];
    if(isset($term)) {
        $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


        $stmt = $dbh->prepare("SELECT firstname, lastname FROM child WHERE firstname LIKE '%$term%' OR lastname LIKE '%$term%' ");
//below query required to diplay polish signs on page
        $dbh->query('SET NAMES utf8');

        $stmt->execute();
    }
    $autocomplete = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $firstname = $row['firstname'];
        $lastname = $row['lastname'];
        $autocomplete[] = $firstname . ' ' . $lastname;

    }
    echo json_encode($autocomplete);


}

if ($type == 'updateDescription'){
    $event_id = $_POST['event_id'];
    $description = $_POST['description'];

    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    try{
        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("UPDATE events SET description=:description WHERE event_id=:event_id");
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':event_id', $event_id);
        $stmt->execute();

        $dbh->commit();


    }
    catch(Exception $e){
        $firephp->log($e, 'error');
        $dbh->rollback();
    }

}

//this is for get info about latest changes from database
if ($type == 'getInfoFromDb'){

    $disconnectTime = $_POST['disconnectTime'];
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    try{
        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("SELECT message FROM messages WHERE timedate >= :disconnectTime");
        $stmt->bindParam(':disconnectTime', $disconnectTime);
        $stmt->execute();
        $dbh->commit();
        $events = array();
        if ($stmt ->rowCount() != 0) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

                $eventsArray['message'] = $row['message'];
                $events[] = $eventsArray;
            }

        }
        echo json_encode($events);
    }
    catch(Exception $e){
        $firephp->log($e, 'error');
        $dbh->rollback();
    }

}


//get count of messages and this will be put to the "badge"
if ($type == 'messagesCount'){
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->beginTransaction();
    $dbh->query('SET NAMES utf8');
    $stmt = $dbh->prepare("SELECT COUNT(DISTINCT timedate) FROM events_history");
    $stmt->execute();
    $dbh->commit();
    $messagesCount = array();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $messagesCount['messagesCount'] = $row['COUNT(DISTINCT timedate)'];
    //$events['messageCount'] = $count;

    echo json_encode($messagesCount);


}

//cancel single event
if ($type == 'cancelEvent'){
    $event_id = $_POST['event_id'];
    $description = $_POST['description'];
    $category_id = $_POST['category_id'];

    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($category_id == 6){
        try {
            $dbh->beginTransaction();
            $dbh->query('SET NAMES utf8');
            $stmt = $dbh->prepare("UPDATE events SET description=CONCAT(description,:description), category_id=:category_id WHERE event_id=:event_id");
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':event_id', $event_id);
            $stmt->bindParam(':category_id', $category_id);
            $stmt->execute();

            $dbh->commit();
            $firephp->log('weszlo');

        } catch (Exception $e) {
            $firephp->log($e, 'error');
            $dbh->rollback();
        }
    }
     if ($category_id == 1){
        try {
            $dbh->beginTransaction();
            $dbh->query('SET NAMES utf8');
            //TODO poprawić funckcje!!!!!!!!!!!!!!!!!!!!!!!!!!!
            $stmt = $dbh->prepare("UPDATE events SET description=:description, category_id=:category_id WHERE event_id=:event_id");
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':event_id', $event_id);
            $stmt->bindParam(':category_id', $category_id);
            $firephp->log('weszlo');
            $stmt->execute();

            $dbh->commit();


        } catch (Exception $e) {
            $firephp->log($e, 'error');
            $dbh->rollback();
        }
    }

}

//delete all lessons for child from one day
if ($type == 'cancelEventFromDay') {
    $start_date = $_POST['event_date'];
    $start_time = $_POST['start_time'];
    $description = $_POST['description'];
    $category_id = $_POST['category_id'];
    $title = $_POST['title'];
    $start = $start_date . " " . $start_time;

    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("UPDATE events SET description=CONCAT(description,:description), category_id=:category_id WHERE title='$title' AND start LIKE '%$start_date%'");
             $stmt->bindParam(':description', $description);
             $stmt->bindParam(':category_id', $category_id);

        $stmt->execute();
        if ($stmt)
            echo json_encode(array('status' => 'success'));
        else
            echo json_encode(array('status' => 'failed'));


}
//set working days for resource
if ($type == 'setWorkingdays') {
    $resource_ID = $_POST['resourceid'];
    $workingDays = $_POST['workingDays'];

    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $dbh->query('SET NAMES utf8');
    $stmt = $dbh->prepare("UPDATE resources SET workingDays=:workingDays WHERE resourceid=:resource_ID");
    $stmt->bindParam(':workingDays', $workingDays);
    $stmt->bindParam(':resource_ID', $resource_ID);
    $stmt->execute();
    $firephp->log($stmt);
   //$result = explode(",",$row)
   }
//resource Delete and corresponding events
if ($type == 'deleteResource') {
    $resourceid = $_POST['resourceid'];
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    try {

        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("DELETE FROM resources WHERE resourceid=:resourceid");

        $stmt->bindParam(':resourceid', $resourceid);

        $stmt->execute();
        $dbh->commit();

        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("DELETE FROM events WHERE resourceid=:resourceid");

        $stmt->bindParam(':resourceid', $resourceid);

        $stmt->execute();
        $dbh->commit();

    }
    catch (Exception $e) {
        $firephp->log($e, 'error');
        $dbh->rollback();


    }


}

//insert new message to database
if ($type == 'addMessage') {
    $message = $_POST['message'];
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    try {

        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("INSERT INTO messages
                    (timedate, message)
                    VALUES (NOW(), :message)");

        $stmt->bindParam(':message', $message);

        $stmt->execute();
        $dbh->commit();

    }
    catch (Exception $e) {
        $firephp->log($e, 'error');
        $dbh->rollback();


    }
    echo json_encode($message);

}
