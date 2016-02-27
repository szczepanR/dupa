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
    $title = $_POST['leaveTitle'];
    $start_date = $_POST['leaveDate'];
    $weekday = date('N', strtotime($start_date));
    $dayofyear = date('z', strtotime($start_date));
    $start_time = $_POST['leaveStartTime'];
    $end_time = $_POST['leaveEndTime'];
    $resourceID = $_POST['leaveResourceID'];
    $category_id = $_POST['category_id'];
    $start = $start_date . " " . $start_time;
    $end = $start_date . " " . $end_time;
    $repeat_freq = 0;
//log start
$firephp->log($title);
$firephp->log($start);
$firephp->log($start_date);
$firephp->log($end);
$firephp->log($resourceID);
$firephp->log($dayofyear);
//log end

        $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        try{
            $dbh->beginTransaction();
            $dbh->query('SET NAMES utf8');
            //first event
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
            //second in all day
            $stmt = $dbh->prepare("INSERT INTO events
                (parent_id, title, start, end, resourceID, repeat_freq, category_id)
                VALUES (:parent_id, :title, :start, :end, :resourceID, :repeat_freq, :category_id)");

            $stmt->bindParam(':title', $title );
            $stmt->bindParam(':start', $start);
            $stmt->bindParam(':end', $end);
            $stmt->bindParam(':resourceID', $resourceID);
            $stmt->bindParam(':parent_id', $last_id);
            $stmt->bindParam(':repeat_freq', $repeat_freq);
            $stmt->bindParam(':category_id', $category_id);

            $stmt->execute();

            $dbh->commit();


        }
        catch(Exception $e){
            $firephp->log($e, 'error');
            $dbh->rollback();
        }

    //header ("location: ../");