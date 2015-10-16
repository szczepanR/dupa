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

    $stmt = $dbh->prepare("SELECT resourceid, name, workingDays, sortID FROM resources");
    $stmt->execute();

    $resources = array();
    if ($stmt->rowCount() != 0) {

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $resourcesArray['resourceid'] = $row['resourceid'];
            $resourcesArray['name'] = $row['name'];
            $resourcesArray['workingDays'] = explode(",",$row['workingDays']);
            $resourcesArray['sortID'] = $row['sortID'];
            $resources[] = $resourcesArray;
        }
    }
    echo json_encode($resources);

?>