<?php
/**
 * Created by PhpStorm.
 * User: Sz
 * Date: 2015-04-09
 * Time: 20:16
 */
require_once '../config-OERW/db-config.php';
$groupName = $_POST['groupName'];
$dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

//below query required to diplay polish signs on page
$dbh->query('SET NAMES utf8');
try{
$stmt = $dbh->prepare("SELECT child_id, firstname, lastname, groupName FROM child");
    $stmt->execute();
    $resources = array();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
    $eventArray['id'] = $row['child_id'];
    $firstname = $row['firstname'];
    $lastname = $row['lastname'];
    $eventArray['name'] = $firstname . ' ' . $lastname;
    $eventArray['groupName'] = $row['groupName'];
    $resources[] = $eventArray;
}
echo json_encode($resources);
}
catch(Exception $e){
    $firephp->log($e, 'error');
    $dbh->rollback();
}