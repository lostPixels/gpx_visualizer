<?php
	$upload_directory = 'gpx/';
	$t_id = uniqid();
	$url = $upload_directory.$t_id.".gpx";
	//var_dump(  $_POST, $_FILES );

	if( isset( $_FILES['file']) && move_uploaded_file($_FILES['file']['tmp_name'], $url) )
	{
		$r = array("result"=>"success","file_path"=>$url,"id"=>$t_id);
		postResult($r);
	}	


	function postResult($a)
	{
		echo json_encode($a);
	}
?>