<?php
/**
 * Created by PhpStorm.
 * User: Sz
 * Date: 2015-07-23
 * Time: 20:16
 */
require_once('../FirePHPCore/FirePHP.class.php');
$firephp = FirePHP::getInstance(true);
require_once '../config-OERW/db-config.php';
$type = $_POST['type'];

if ($type=='checkIfExist') {
    $firstName = $_POST['firstName'];
    $lastName = $_POST['lastName'];
    $groupName = $_POST['groupName'];
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    //below query required to diplay polish signs on page
    $dbh->query('SET NAMES utf8');

    $stmt = $dbh->prepare("SELECT child_id, firstname, lastname, groupName FROM child WHERE firstname='$firstName' AND lastname='$lastName'AND groupName='$groupName'");
    $stmt->execute();

    $kids = "exists";
    if ($stmt->rowCount() != 0) {
        echo json_encode($kids);
    }
    else
        echo json_encode('ok');
}

if ($type == 'addKid') {
    $firstName = $_POST['firstName'];
    $lastName = $_POST['lastName'];
    $groupName = $_POST['groupName'];
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    try {
        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("INSERT INTO child (firstname, lastname, groupName)VALUES (:firstname, :lastname, :groupName)");

        $stmt->bindParam(':firstname', $firstName);
        $stmt->bindParam(':lastname', $lastName);
        $stmt->bindParam(':groupName', $groupName);
        $stmt->execute();
        $dbh->commit();
    } catch (Exception $e) {
        $firephp->log($e, 'error');
        $dbh->rollback();


    }


}
//edit existing kid
if ($type == 'editkid') {
    $kidID = $_POST['ID'];
    $firstname = $_POST['firstname'];
    $lastname = $_POST['lastname'];
    $groupName = $_POST['groupName'];
    $oldfirstname = $_POST['oldfirstname'];
    $oldlastname = $_POST['oldlastname'];
    $oldgroupName = $_POST['oldgroupName'];
    $newname = $firstname . ' ' . $lastname;
    $newgroupName = $_POST['groupName'];
    $oldname = $oldfirstname . ' ' . $oldlastname;

    $firephp->log($newgroupName);
    $firephp->log($oldname);
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    try {

        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("UPDATE child SET firstname=:firstname, lastname=:lastname, groupName=:groupName  WHERE child_ID=:ID");

        $stmt->bindParam(':ID', $kidID);
        $stmt->bindParam(':firstname', $firstname);
        $stmt->bindParam(':lastname', $lastname);
        $stmt->bindParam(':groupName', $groupName);

        $stmt->execute();
        $dbh->commit();

        //need also update events with new names
        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("UPDATE events SET title='$newname' WHERE title LIKE'%$oldname%'");

        $stmt->execute();
        $dbh->commit();

    }
    catch (Exception $e) {
        $firephp->log($e, 'error');
        $dbh->rollback();


    }


}
?>