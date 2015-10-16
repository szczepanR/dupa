<?php
/**
 * Created by PhpStorm.
 * User: Sz
 * Date: 2015-07-23
 * Time: 20:16
 */
require_once '../config/db-config.php';

$dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

//below query required to diplay polish signs on page
$dbh->query('SET NAMES utf8');

$stmt = $dbh->prepare("SELECT firstname, lastname FROM child");
$stmt->execute();

$kids = array();
if ($stmt ->rowCount() != 0) {

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $firstname = $row['firstname'];
        $lastname = $row['lastname'];
        $resultsArray['name'] = $firstname . ' ' . $lastname;
        $kids[] = $resultsArray;
    }
}
echo json_encode($kids);
?>