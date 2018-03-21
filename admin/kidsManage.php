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


//list all childdern in database and populate to table
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

//below query required to diplay polish signs on page
    $dbh->query('SET NAMES utf8');

    $stmt = $dbh->prepare("SELECT child_id, firstname, lastname, city, street, birthday, phone, email, teraphy_start, teraphy_end, opinion_number FROM child");
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
            $kidsArray['opinion_number'] = $row['opinion_number'];
            $kids[] = $kidsArray;
        }
    }
    echo json_encode($kids);

?>