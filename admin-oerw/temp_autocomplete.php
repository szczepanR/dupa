<?php
/**
 * Created by PhpStorm.
 * User: Sz
 * Date: 2015-05-11
 * Time: 19:06
 */

require_once('../FirePHPCore/FirePHP.class.php');
$firephp = FirePHP::getInstance(true);
require_once '../config-OERW/db-config.php';
$term = $_POST['query'];
if(isset($term)) {
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


    $stmt = $dbh->prepare("SELECT firstname, lastname FROM child WHERE firstname LIKE '%$term%' OR lastname LIKE '%$term%' ");
//below query required to diplay polish signs on page
    $dbh->query('SET NAMES utf8');

    $stmt->execute();
}
    $autocomplete = array();
if ($stmt -> rowCount()!= 0) {
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $firstname = $row['firstname'];
        $lastname = $row['lastname'];
        $autocomplete[] = $firstname . ' ' . $lastname;
        //$autocomplete[] = $row['firstname'];
    }
}
    echo json_encode($autocomplete);

?>