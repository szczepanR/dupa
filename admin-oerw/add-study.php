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
    $start_date = $_POST['studyDate'];
    $weekday = date('N', strtotime($start_date));
    $dayofyear = date('z', strtotime($start_date));
    $start_time = $_POST['studyStartTime'];
    $end_time = $_POST['studyEndTime'];
    $resourceID = $_POST['studyResourceID'];
    $description = $_POST['studyDescription'];
    $category_id = $_POST['category_id'];
    $start = $start_date . " " . $start_time;
    $end = $start_date . " " . $end_time;
//log start
$firephp->log($title);
$firephp->log($start);
$firephp->log($start_date);
$firephp->log($end);
$firephp->log($resourceID);
$firephp->log($dayofyear);
//log end
      $repeats = 0;
       if (!isset($_POST['repeats'])) {
           $repeat_freq = 0;
        $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

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
    else {
        $repeats = $_POST['repeats'];
        $repeat_freq = $_POST['repeat-freq'];
        $until = (365/$repeat_freq);
        if ($repeat_freq == 1){
            $weekday = 0;
        }
        $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);  // set the error mode to excptions
        $dbh->beginTransaction();
        try{
            $dbh->query('SET NAMES utf8');
            $stmt = $dbh->prepare("INSERT INTO events_parent
                (title,start_date, start_time, end_time, resourceID, weekday, repeats, repeat_freq, category_id)
                VALUES (:title, :start_date, :start_time, :end_time, :resourceID, :weekday, :repeats, :repeat_freq, :category_id)");

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

            for($x = 0; $x <$until; $x++){
                $dbh->query('SET NAMES utf8');
                $stmt = $dbh->prepare("INSERT INTO events
                    (title, start, end, resourceID, parent_id, repeat_freq, category_id)
                    VALUES (:title, :start, :end, :resourceID, :parent_id, :repeat_freq, :category_id)");
                $stmt->bindParam(':title', $title );
                $stmt->bindParam(':start', $start);
                $stmt->bindParam(':end', $end);
                $stmt->bindParam(':resourceID', $resourceID);
                $stmt->bindParam(':parent_id', $last_id);
                $stmt->bindParam(':repeat_freq', $repeat_freq);
                $stmt->bindParam(':category_id', $category_id);
                $stmt->execute();
                $start_date = strtotime($start . '+' . $repeat_freq . 'DAYS');
                $end_date = strtotime($end . '+' . $repeat_freq . 'DAYS');
                $start = date("Y-m-d H:i", $start_date);
                $end = date("Y-m-d H:i", $end_date);
            }
            $dbh->commit();
        }

        catch(Exception $e){
            $dbh->rollback();
        }
    }
    //header ("location: ../");