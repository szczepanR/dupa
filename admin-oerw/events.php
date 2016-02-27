<?php
/**
 * Created by PhpStorm.
 * User: Sz
 * Date: 2015-03-27
 * Time: 21:49
 */

/// List of events
//header('Content-Type: application/json;charset=UTF8');
$json = array();

// Query that retrieves events
$requete = "SELECT * FROM event ORDER BY id";

// connection to the database
try {
    $bdd = new PDO('mysql:host=localhost;dbname=fullcalendar', 'root', '');
} catch(Exception $e) {
    exit('Unable to connect to database.');
}
// Execute the query
$bdd->query('SET NAMES utf8');
$resultat = $bdd->query($requete) or die(print_r($bdd->errorInfo()));

// sending the encoded result to success page
echo json_encode($resultat->fetchAll(PDO::FETCH_ASSOC));
//echo ($resultat->fetchAll(PDO::FETCH_ASSOC));

/*
$con = mysqli_connect('localhost','root','','fullcalendar');

if (mysqli_connect_errno()){

    echo 'failed to  connect to mysql'.mysqli_connect_error();
}
$query = "SELECT * FROM event ORDER BY id";
//mysqli_query($con, 'SET NAMES utf8');
$events = mysqli_query($con, $query);

if (!mysqli_set_charset($con, "utf8")) {
    printf("Error loading character set utf8: %s\n", mysqli_error($con));
} else {
    printf("Current character set: %s\n", mysqli_character_set_name($con));
}

while($row = mysqli_fetch_assoc($events)):

    echo $row['title'];


endwhile;
*/