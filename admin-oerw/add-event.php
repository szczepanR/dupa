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
    $title = $_POST['title'];
    $start_date = $_POST['event-date'];
    $weekday = date('N', strtotime($start_date));
    //test value for endOfYear
    $endOfyear = date('2018-08-30');
    $startOfevent = date($start_date);
    $start_time = $_POST['start-time'];
    $end_time = $_POST['end-time'];
    $resourceID = $_POST['resourceID'];
    $description = $_POST['eventDescription'];
    $descriptionStart = $start_date . " " . $start_time;
    $category_id = $_POST['category_id'];
    $start = $start_date . " " . $start_time;

    $end = $start_date . " " . $end_time;

//actual time
$timedate = getdate();


//log start
$firephp->log($title);
$firephp->log($start_time);
$firephp->log($end_time);
//$firephp->log($end);
//$firephp->log($resourceID);
//$firephp->log($description);
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

        //$until = ($endOfyear/$repeat_freq);
        $until = $endOfyear;
        if ($repeat_freq == 1){
            $weekday = 0;
        }
        $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);  // set the error mode to excptions
        $dbh->beginTransaction();
        try{
            $dbh->query('SET NAMES utf8');
            $stmt = $dbh->prepare("INSERT INTO events_parent
                (title, start_date, start_time, end_time, resourceID, weekday, repeats, repeat_freq, category_id)
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

//old code start
//            for($x = $startOfevent; $x < $until; $x++){
//                $dbh->query('SET NAMES utf8');
//                $stmt = $dbh->prepare("INSERT INTO events
//                    (title, start, end, resourceID, parent_id, repeat_freq, category_id)
//                    VALUES (:title, :start, :end, :resourceID, :parent_id, :repeat_freq, :category_id)");
//                $stmt->bindParam(':title', $title );
//                $stmt->bindParam(':start', $start);
//                $stmt->bindParam(':end', $end);
//                $stmt->bindParam(':resourceID', $resourceID);
//                $stmt->bindParam(':parent_id', $last_id);
//                $stmt->bindParam(':repeat_freq', $repeat_freq);
//                $stmt->bindParam(':category_id', $category_id);
//                $stmt->execute();
//                $start_date = strtotime($start . '+' . $repeat_freq . 'DAYS');
//                $end_date = strtotime($end . '+' . $repeat_freq . 'DAYS');
//                $start = date("Y-m-d H:i", $start_date);
//                $end = date("Y-m-d H:i", $end_date);
//            }
//old code end



            while ($startOfevent <= $endOfyear)
            {
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
                $start_date =  strtotime($start . '+' . $repeat_freq . 'DAYS');
                $end_date = strtotime($end . '+' . $repeat_freq . 'DAYS');
                $start = date("Y-m-d H:i", $start_date);
                $end = date("Y-m-d H:i", $end_date);


                $startOfevent = date ("Y-m-d", strtotime($startOfevent . '+' . $repeat_freq . 'DAYS'));

                //$firephp->log("weszło do pętli");
            }




            $dbh->commit();


        }

        catch(Exception $e){
            $firephp->log($e, 'error');
            $dbh->rollback();
        }

        try{
            $dbh->beginTransaction();
            $dbh->query('SET NAMES utf8');
            $stmt = $dbh->prepare("UPDATE events SET description=:description WHERE start=:start AND parent_id=:parent_id");
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':start', $descriptionStart);
            $stmt->bindParam(':parent_id', $last_id);
            $stmt->execute();

            $dbh->commit();
//log start
            $firephp->log($descriptionStart);
            $firephp->log($last_id);

//log end

        }
        catch(Exception $e){
            $firephp->log($e, 'error');
            $dbh->rollback();
        }
    }
    //header ("location: ../");
