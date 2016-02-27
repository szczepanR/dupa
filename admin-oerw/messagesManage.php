<?php
/**
 * Created by PhpStorm.
 * User: szczepan
 * Date: 15.11.15
 * Time: 21:20
 */

require_once('../FirePHPCore/FirePHP.class.php');
$firephp = FirePHP::getInstance(true);
require_once '../config-OERW/db-config.php';


//list all messages
$dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

//below query required to diplay polish signs on page
$dbh->query('SET NAMES utf8');

$stmt = $dbh->prepare("SELECT * FROM messages");
$stmt->execute();

$resources = array();
if ($stmt->rowCount() != 0) {

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $messagesArray['messageid'] = $row['messageid'];
        $messagesArray['timedate'] = $row['timedate'];
        $messagesArray['message'] = $row['message'];
        $messages[] = $messagesArray;
    }
}
echo json_encode($messages);

?>