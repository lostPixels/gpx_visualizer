<?php


	if( isset($_GET['intent']) )
	{
		$intent  = $_GET['intent'];

		if($intent == 'save')
		{
			save();
		}
		else if($intent == 'test')
		{
			//test();
		}
	}
	else if( isset( $_FILES['file']) )
	{
		upload();
	}
	else{
		postResult( array("result"=>"no_intent") );
	}

	function save()
	{
		$upload_directory = 'gpx/';
		$t_id = uniqid();
		$url = $upload_directory.$t_id.".gpx";

		if( isset( $_FILES['file']) && move_uploaded_file($_FILES['file']['tmp_name'], $url) )
		{

			$db = mysql_connect('localhost','root','');

			if($db)
			{

			}



			$r = array("result"=>"success","file_path"=>$url,"id"=>$t_id);
			postResult($r);
		}	
	}

	function test()
	{
		echo 'hi';
		$db = mysql_connect('localhost','root','');

		$query = sprintf("INSERT firstname, lastname, address, age FROM friends 
	    WHERE firstname='%s' AND lastname='%s'",

	    mysql_real_escape_string($firstname),
	    mysql_real_escape_string($lastname));


	    $result = mysql_query($query);
	}

	function upload()
	{
		$upload_directory = 'gpx/';
		$t_id = uniqid();
		$url = $upload_directory.$t_id.".gpx";

		if( move_uploaded_file($_FILES['file']['tmp_name'], $url) )
		{

			$db = mysql_connect('localhost','root','');

			if($db)
			{

			}



			$r = array("result"=>"success","file_path"=>$url,"id"=>$t_id);
			postResult($r);
		}	
	}



	function postResult($a)
	{
		echo json_encode($a);
	}
?>