<?php
	$upload_directory = 'gpx/';
	$t_id = rand(1000000000,9999999999);
	var_dump(  $_REQUEST );

	if( isset( $_FILES['file']) )
	{
		echo 'we cool';
	}




?>