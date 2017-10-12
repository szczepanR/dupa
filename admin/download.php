<?php
require_once('../FirePHPCore/FirePHP.class.php');
$firephp = FirePHP::getInstance(true);
$file = $_GET['filename'];
$fullpath = '/srv/upload/' . $file;
$firephp->log($file , 'Filename');
    header("Cache-Control: public");
    header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    header("Content-Disposition: attachment; filename=" . $file . "");
    readfile($fullpath);


?>