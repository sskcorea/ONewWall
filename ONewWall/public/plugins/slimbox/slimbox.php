<?php
/*
Plugin Name: Slimbox
Plugin URI: http://wordpress.org/extend/plugins/slimbox/
Description: Enables <a href="http://www.digitalia.be/software/slimbox2">slimbox 2</a> on all image links including BMP, GIF, JPG, JPEG, and PNG links.
Version: 1.0.7
Author: Kevin Sylvestre
Author URI: http://ksylvest.com
*/

if (!defined('WP_CONTENT_URL'))
      define('WP_CONTENT_URL', get_option('siteurl').'/wp-content');
if (!defined('WP_CONTENT_DIR'))
      define('WP_CONTENT_DIR', ABSPATH.'wp-content');
if (!defined('WP_PLUGIN_URL'))
      define('WP_PLUGIN_URL', WP_CONTENT_URL.'/plugins');
if (!defined('WP_PLUGIN_DIR'))
      define('WP_PLUGIN_DIR', WP_CONTENT_DIR.'/plugins');


function slimbox() {
?>
<script type="text/javascript">
	jQuery(document).ready(function($){	
	    var select = $('a[href$=".bmp"],a[href$=".gif"],a[href$=".jpg"],a[href$=".jpeg"], a[href$=".png"],a[href$=".BMP"],a[href$=".GIF"],a[href$=".JPG"],a[href$=".JPEG"],a[href$=".PNG"]');
		select.slimbox();
	});
</script>
<?php    
}

if (!is_admin()) :
	wp_enqueue_script('jquery');
	wp_enqueue_script('jquery.slimbox', WP_PLUGIN_URL."/slimbox/javascript/jquery.slimbox.js", array('jquery'), '2.03');
	wp_enqueue_style('jquery.slimbox', WP_PLUGIN_URL."/slimbox/stylesheets/jquery.slimbox.css", false, '2.03');
	add_action('wp_head', 'slimbox');
endif;

?>