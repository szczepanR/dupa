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
$child_id = $_GET['child_id'];
//below query required to diplay polish signs on page
    $dbh->query('SET NAMES utf8');

    $stmt = $dbh->prepare("SELECT document_id, child_id, file_name, uploaded_by, uploaded FROM documents WHERE child_id = :child_id");
$stmt->bindParam(':child_id', $child_id);
    $stmt->execute();

    $kids = array();
    if ($stmt->rowCount() != 0) {

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $kidsArray['document_id'] = $row['document_id'];
            $kidsArray['child_id'] = $row['child_id'];
            $kidsArray['file_name'] = $row['file_name'];
            $kidsArray['uploaded_by'] = $row['uploaded_by'];
            $kidsArray['uploaded'] = $row['uploaded'];
            $kids[] = $kidsArray;
        }
    }
    echo json_encode($kids);

?>