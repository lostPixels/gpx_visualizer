<?php
	header('Content-Type: application/json');
	
	if( isset($_POST['intent']) )
	{
		$intent  = $_POST['intent'];

		if($intent == 'save')
		{
			save();
		}
		else if($intent == 'find' && isset($_POST['id']) )
		{
			find( $_POST['id'] );
		}
	}
	else if( isset( $_FILES['file']) )
	{
		upload();
	}
	else{
		//echo json_encode($_POST);
		postResult( array("result"=>"no_intent") );
	}

	function save()
	{
		session_start();

		$file_url = $_SESSION['file_url'];
		$id = $_SESSION['t_id'];

		if( isset($_POST['title']) ) //Make this better!
		{

			$title = $_POST['title'];
			$private = $_POST['private'];
			$thumbnail = $_POST['thumbnail'];
			$settings = $_POST['settings'];



			$db = mysql_connect('localhost','root','');

			if($db)
			{

				$query =    "INSERT INTO rides ".
							"(id, file_url, title, private, thumbnail, settings)".
							"VALUES ".
							"('$id','$file_url','$title','$private','$thumbnail','$settings')";

				mysql_select_db('gpx_visualizer');

				$res = mysql_query($query,$db);

				if(!$res)
				{
					$r = array("result"=>"failed saving","query"=>$query);
					postResult($r);
				}
				else{
					$r = array("result"=>"success","id"=>$id);
					postResult($r);
				}




			}
		}	
	}

	
	function find($id)
	{
		$db = mysql_connect('localhost','root','');

		if($db)
		{

			$query = "SELECT * FROM rides WHERE id = 72934 LIMIT 1";

			mysql_select_db('gpx_visualizer');

			$res = mysql_query($query,$db);

			if(!$res)
			{
				$r = array("result"=>"couldnt find ride","query"=>$query);
				postResult($r);
			}
			else{
				$rows = array();
				while($r = mysql_fetch_assoc($res)) {
				    $rows[] = $r;
				}
				$r = array("result"=>"success","ride"=>$rows);
				postResult($r);
			}
		}
	}



	function upload()
	{
		$upload_directory = 'gpx/';
		$t_id = rand(99999,0);//uniqid();
		$url = $upload_directory.$t_id.".gpx";


		if( isset( $_FILES['file']) && move_uploaded_file($_FILES['file']['tmp_name'], $url) )
		{
			session_start();

			$_SESSION['t_id'] = $t_id;
			$_SESSION['file_url'] = $url;

			session_write_close();

			$r = array("result"=>"success","file_path"=>$url,"id"=>$t_id);
			postResult($r);
		}	
	}



	function postResult($a)
	{
		echo json_encode($a);
	}
?>