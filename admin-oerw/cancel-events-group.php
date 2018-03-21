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
    $start_date = $_POST['leaveStartDate'];
    $end_date = $_POST['leaveEndDate'];
    $weekday = date('N', strtotime($start_date));
    $dayofyear = date('z', strtotime($start_date));
    $start_time = $_POST['leaveStartTime'];
    $end_time = $_POST['leaveEndTime'];
    $resourceID = $_POST['leaveResourceID'];
    $category_id = $_POST['category_id'];
    $description = $_POST['description'];
    $start = $start_date . " " . $start_time;
    $end = $start_date . " " . $end_time;
    $beginLeave = date($start_date);
    $endLeave = date($end_date);

    $repeat_freq = 0;

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
            //TODO: skip weekends
            while($beginLeave<=$endLeave){


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
                    $start_date =  strtotime($start . '+' . 1 . 'DAYS');
                    $end_date = strtotime($end . '+' . 1 . 'DAYS');
                    $start = date("Y-m-d H:i", $start_date);
                    $end = date("Y-m-d H:i", $end_date);


                $beginLeave = date ("Y-m-d", strtotime($beginLeave . '+' . 1 . 'DAYS'));

                }
            $dbh->commit();


        }
        catch(Exception $e){
            $firephp->log($e, 'error');
            $dbh->rollback();
        }

    //header ("location: ../");