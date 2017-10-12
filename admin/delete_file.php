<?php
require_once('../FirePHPCore/FirePHP.class.php');
$firephp = FirePHP::getInstance(true);
$file = $_GET['filename'];
$fullpath = '/srv/upload/' . $file;
$firephp->log($file , 'Filename');

?>