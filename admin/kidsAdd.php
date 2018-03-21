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
$type = $_POST['type'];

if ($type=='checkIfExist') {
    $firstName = $_POST['firstName'];
    $lastName = $_POST['lastName'];
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    //below query required to diplay polish signs on page
    $dbh->query('SET NAMES utf8');

    $stmt = $dbh->prepare("SELECT child_id, firstname, lastname FROM child WHERE firstname='$firstName' AND lastname='$lastName'");
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
    $city = $_POST['city'];
    $street = $_POST['street'];
    $phone = $_POST['phone'];
    $email = $_POST['email'];
    $birthday = $_POST['birthday'];
    $teraphyStart = $_POST['teraphyStart'];
    $teraphyEnd = $_POST['teraphyEnd'];
    $opinionNumber = $_POST['opinionNumber'];
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    try {
        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("INSERT INTO child (firstname, lastname, city, street, phone, email, birthday, teraphy_start, teraphy_end, opinion_number)VALUES (:firstname, :lastname,
                                            :city, :street, :phone, :email, :birthday, :teraphyStart, :teraphyEnd, :opinionNumber)");
        $stmt->bindParam(':firstname', $firstName);
        $stmt->bindParam(':lastname', $lastName);
        $stmt->bindParam(':city', $city);
        $stmt->bindParam(':street', $street);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':birthday', $birthday);
        $stmt->bindParam(':teraphyStart', $teraphyStart);
        $stmt->bindParam(':teraphyEnd', $teraphyEnd);
        $stmt->bindParam(':opinionNumber', $opinionNumber);
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
    $oldfirstname = $_POST['oldfirstname'];
    $oldlastname = $_POST['oldlastname'];
    $city = $_POST['city'];
    $street = $_POST['street'];
    $phone = $_POST['phone'];
    $email= $_POST['email'];
    $birthday = $_POST['birthday'];
    $teraphyStart = $_POST['teraphyStart'];
    $teraphyEnd = $_POST['teraphyEnd'];
    $opinionNumber = $_POST['opinionNumber'];
    $newname = $firstname . ' ' . $lastname;
    $oldname = $oldfirstname . ' ' . $oldlastname;
    $firephp->log($teraphyStart);
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    try {

        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("UPDATE child SET firstname=:firstname, lastname=:lastname, city=:city, street=:street, phone=:phone, email=:email,
                                birthday=:birthday, teraphy_start=:teraphyStart, teraphy_end=:teraphyEnd, opinion_number=:opinionNumber WHERE child_ID=:ID");

        $stmt->bindParam(':ID', $kidID);
        $stmt->bindParam(':firstname', $firstname);
        $stmt->bindParam(':lastname', $lastname);
        $stmt->bindParam(':city', $city);
        $stmt->bindParam(':street', $street);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':birthday', $birthday);
        $stmt->bindParam(':teraphyStart', $teraphyStart);
        $stmt->bindParam(':teraphyEnd', $teraphyEnd);
        $stmt->bindParam(':opinionNumber', $opinionNumber);
        $stmt->execute();
        $dbh->commit();

//        if($newname != $oldname) {
//            //need also update events with new names
//            $dbh->beginTransaction();
//            $dbh->query('SET NAMES utf8');
//            $stmt = $dbh->prepare("UPDATE events SET title='$newname' WHERE title LIKE '%$oldname%'");
//            $firephp->log('zmienilem tez zajecia');
//            $stmt->execute();
//            $dbh->commit();
//        }

    }
    catch (Exception $e) {
        $firephp->log($e, 'error');
        $dbh->rollback();


    }


}
if ($type == 'deletekid') {
    $child_id = $_POST['child_id'];
    $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    try {

        $dbh->beginTransaction();
        $dbh->query('SET NAMES utf8');
        $stmt = $dbh->prepare("DELETE FROM child WHERE child_id=:child_id");

        $stmt->bindParam(':child_id', $child_id);
        $stmt->execute();
        $dbh->commit();
        }
    catch (Exception $e) {
        $firephp->log($e, 'error');
        $dbh->rollback();


    }
}
if ($type == 'deletedocument') {
    $child_id = $_POST['child_id'];
    $file_name = $_POST['file_name'];
    $fullpath = '/srv/upload/' . $file_name;
    if(unlink($fullpath)) {
        $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        try {

            $dbh->beginTransaction();
            $dbh->query('SET NAMES utf8');
            $stmt = $dbh->prepare("DELETE FROM documents WHERE child_id=:child_id and file_name=:file_name");

            $stmt->bindParam(':child_id', $child_id);
            $stmt->bindParam(':file_name', $file_name);
            $stmt->execute();
            $dbh->commit();
        } catch (Exception $e) {
            $firephp->log($e, 'error');
            $dbh->rollback();


        }
    }
}
?>