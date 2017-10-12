<?php
/**
 * Created by PhpStorm.
 * User: szczepan
 * Date: 28.09.17
 * Time: 23:40
 */
require_once('../FirePHPCore/FirePHP.class.php');
$firephp = FirePHP::getInstance(true);
require_once '../config/db-config.php';

if(!empty($_FILES)){

    try {

        $dbh = new PDO("mysql:host=$mysql_hostname;dbname=$mysql_dbname", $mysql_username, $mysql_password);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        //below query required to diplay polish signs on page
        $dbh->query('SET NAMES utf8');

        $targetDir = "/srv/upload/";
        $fileName = date("Y-m-d H:i:s").'_'.$_FILES['input-file']['name'];
        $child_id = $_POST['id'];
        $targetFile = $targetDir . $fileName;
        $firephp->log($targetFile, 'targetFile');
        $firephp->log($targetDir, 'targetDir');
        $firephp->log($child_id, 'post child_id');
        $firephp->log($_FILES, 'dfsf');
        $firephp->log( $fileName, 'filename');

        if (move_uploaded_file($_FILES['input-file']['tmp_name'], $targetFile)) {
            //insert file information into db table
            $stmt = $dbh->prepare("INSERT INTO documents (child_id, file_name, uploaded) VALUES('" . $child_id . "','" . $fileName . "','" . date("Y-m-d H:i:s") . "')");
            $stmt->execute();
            echo json_encode('file uploaded');
        }
    }
    catch(Exception $e){
        $firephp->log($e, 'error');
        $dbh->rollback();
        echo json_encode('file not uploaded');
    }

}
?>