<?php
/**
 * Created by PhpStorm.
 * User: Sz
 * Date: 2015-07-23
 * Time: 20:16
 */
require_once('../FirePHPCore/FirePHP.class.php');
$firephp = FirePHP::getInstance(true);
require_once '../config/db-config.php';
$type = $_POST['type'];

if ($type=='checkIfExist') {
    $name = $_POST['name'];


    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    //below query required to diplay polish signs on page
    $dbh->query('SET NAMES utf8');

    $stmt = $dbh->prepare("SELECT name FROM resources WHERE name='$name'");
    $stmt->execute();

    $kids = "exists";
    if ($stmt->rowCount() != 0) {
        echo json_encode($kids);
    }
    else
        echo json_encode('ok');
}

if ($type == 'addResource') {
    $name = $_POST['name'];
    $resourceSort = $_POST['resourceSort'];
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    try {
        $last_id = $dbh->lastInsertId();
        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("INSERT INTO resources (resourceid,name,workingDays,sortID) VALUES (:lastID,:name,'0,1,2,3,4,5,6',:sortID)");

        $stmt->bindParam(':lastID', $last_id);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':sortID', $resourceSort);


        $stmt->execute();
        $dbh->commit();
    }
    catch (Exception $e) {
        $firephp->log($e, 'error');
        $dbh->rollback();


    }


}

//edit existing resource
if ($type == 'editResource') {
    $resourceid = $_POST['resourceid'];
    $name = $_POST['name'];
    $sortID = $_POST['sortID'];
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    try {

        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("UPDATE resources SET name=:name, sortID=:sortID  WHERE resourceid=:resourceid");

        $stmt->bindParam(':resourceid', $resourceid);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':sortID', $sortID);


        $stmt->execute();
        $dbh->commit();
    }
    catch (Exception $e) {
        $firephp->log($e, 'error');
        $dbh->rollback();


    }


}
//get events for resources
if ($type == 'checkResourceEvents') {
    $resourceid = $_POST['resourceid'];
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    try {

        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("SELECT event_id, COUNT(*) FROM events WHERE resourceid=:resourceid");

        $stmt->bindParam(':resourceid', $resourceid);



        $stmt->execute();
        $dbh->commit();
        $ar = $stmt->fetch(PDO::FETCH_ASSOC);
        $events = $ar['COUNT(*)'];
        $firephp->log($events);
           echo json_encode($events);
    }
    catch (Exception $e) {
        $firephp->log($e, 'error');
        $dbh->rollback();


    }


}
?>