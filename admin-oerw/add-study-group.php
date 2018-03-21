<?php
/**
 * Created by PhpStorm.
 * User: Sz
 * Date: 2015-04-05
 * Time: 02:58
 */
require_once('../FirePHPCore/FirePHP.class.php');
$firephp = FirePHP::getInstance(true);
    require_once '../config-OERW/db-config.php';
    $title = $_POST['studyTitle'];
$faketitle = "zajęcia grupowe";
    $start_date = $_POST['studyStartDate'];
    $end_date = $_POST['studyEndDate'];
    $weekday = date('N', strtotime($start_date));
    $dayofyear = date('z', strtotime($start_date));
    $start_time = $_POST['studyStartTime'];
    $end_time = $_POST['studyEndTime'];
//fake resourceId as we use kids IDs as resource ID
    $resourceID = 10000;
    $description = $_POST['studyDescription'];
    $category_id = $_POST['category_id'];
    $resourcegroup = $_POST['groupName'];
    $start = $start_date . " " . $start_time;
    $end = $start_date . " " . $end_time;
    $beginGroupEvent = date($start_date);
    $endGroupEvent = date($end_date);
    $repeat_freq = $_POST['repeat_freq'];
    $cancelRelatedEvents = $_POST['cancelRelatedEvents'];

    $firephp->log($cancelRelatedEvents,"usunac zaj indyw");


        $resources = array();
        $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

//get all kids for active group and store them in array
try {
            $dbh->beginTransaction();
            $dbh->query('SET NAMES utf8');
            $stmt = $dbh->prepare("SELECT * FROM child WHERE groupName=:groupName");
            $stmt->bindParam(':groupName', $resourcegroup);
            $stmt->execute();
            $dbh->commit();

            if ($stmt->rowCount() != 0) {
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $firstname = $row['firstname'];
                    $lastname = $row['lastname'];
                    $resourcesArray['name'] = $firstname . ' ' . $lastname;
                    $resources[] = $resourcesArray;
                    //$firephp->log($resourcesArray["name"],"dzieci z grupy")
                }
            }


            $dbh->beginTransaction();
            $dbh->query('SET NAMES utf8');
            $stmt = $dbh->prepare("INSERT INTO events_parent
                (title,start_date, start_time, end_time, resourceID, weekday, repeats, repeat_freq, category_id)
                VALUES (:title,:start_date, :start_time, :end_time, :resourceID, :weekday, :repeats, :repeat_freq, :category_id)");

            $stmt->bindParam(':title', $faketitle );
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

while($beginGroupEvent<=$endGroupEvent){
                $dbh->query('SET NAMES utf8');
                foreach ($resources as $row) {
                    $stmt = $dbh->prepare("INSERT INTO events
                                (parent_id, title, start, end, resourceID, category_id, repeat_freq, description)
                                VALUES (:parent_id, :title, :start, :end, :resourceID, :category_id, :repeat_freq, :description)");

                    $stmt->bindParam(':title', $row['name']);
                    $stmt->bindParam(':start', $start);
                    $stmt->bindParam(':end', $end);
                    $stmt->bindParam(':resourceID', $resourceID);
                    $stmt->bindParam(':parent_id', $last_id);
                    $stmt->bindParam(':repeat_freq', $repeat_freq);
                    $stmt->bindParam(':category_id', $category_id);
                    $stmt->bindParam(':description', $description);
                    $stmt->execute();


                }

        $start_date =  strtotime($start . '+' . $repeat_freq . 'DAYS');
        $end_date = strtotime($end . '+' . $repeat_freq . 'DAYS');
        $start = date("Y-m-d H:i", $start_date);
        $end = date("Y-m-d H:i", $end_date);


    $beginGroupEvent = date ("Y-m-d", strtotime($beginGroupEvent . '+' . $repeat_freq . 'DAYS'));
    if ($repeat_freq == 0){

        break;
    }
    else{

        continue;
    }
}

            $dbh->commit();



        } catch (Exception $e) {
            $firephp->log($e, 'error');
            $dbh->rollback();

        }
if ($cancelRelatedEvents == 'yes') {


//cancel events when group events added
    try {
        $title = $_POST['studyTitle'];
        $faketitle = "zajęcia grupowe";
        $start_date = $_POST['studyStartDate'];
        $end_date = $_POST['studyEndDate'];
        $weekday = date('N', strtotime($start_date));
        $dayofyear = date('z', strtotime($start_date));
        $start_time = $_POST['studyStartTime'];
        $end_time = $_POST['studyEndTime'];
//fake resourceId as we use kids IDs as resource ID
        $resourceID = 10000;
        $description = $_POST['studyDescription'];
        $description = "NB: " . $description;
        $resourcegroup = $_POST['groupName'];
        $start = $start_date . " " . $start_time;
        $end = $start_date . " " . $end_time;
        $beginGroupEvent = date($start_date);
        $endGroupEvent = date($end_date);
        $category_id = 6;
        $repeat_freq = $_POST['repeat_freq'];

        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("SELECT * FROM child WHERE groupName=:groupName");
        $stmt->bindParam(':groupName', $resourcegroup);
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
        while ($beginGroupEvent <= $endGroupEvent) {
            $firephp->log($beginGroupEvent, 'beginGroupEvent');
            $dbh->query('SET NAMES utf8');
            foreach ($resources as $row) {
                $stmt = $dbh->prepare("UPDATE events SET description=:description, category_id=:category_id WHERE title=:title AND DATE(start)='$beginGroupEvent' AND
                                 ((TIME(start)>'$start_time' AND TIME(start)<'$end_time') OR
                                 (TIME(end)>'$start_time' AND TIME(end)<'$end_time') OR
                                 (TIME(start)='$start_time' AND TIME(end)='$end_time') OR
                                 (TIME(start)='$start_time' AND TIME(start)<'$end_time') OR
                                 (TIME(end)='$end_time' AND TIME(end)>'$start_time')) AND category_id=1");
                $stmt->bindParam(':title', $row['name']);
                $stmt->bindParam(':category_id', $category_id);
                $stmt->bindParam(':description', $description);
                $stmt->execute();

            }

            $beginGroupEvent = date("Y-m-d", strtotime($beginGroupEvent . '+' . $repeat_freq . 'DAYS'));
            if ($repeat_freq == 0) {

                break;
            } else {

                continue;
            }
        }

        $dbh->commit();
    } catch (Exception $e) {
        $firephp->log($e, 'error');
        $dbh->rollback();
    }
} //header ("location: ../");