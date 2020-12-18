/*
 * CSS Styles for Collapsibles
 *
 * KP
 * Dec 17, 2020
 */
 
/* https://www.w3schools.com/howto/howto_js_collapsible.asp */

/* Requires jQuery */
/*
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
*/

function setupCollapsible() {
	var coll = document.getElementsByClassName("collapsible");
	var i;

	$('.collapsible').css({
		  //'background-color': '#777',
		  'color': 'black',
		  'cursor': 'pointer',
		  //'padding': '18px',
		  'padding': '3px',
		  'width': '100%',
		  //'border': 'none',
		  'text-align': 'left',
		  'outline': 'none'//,
		  //'font-size': '15px',
	});
	$('.passed').css({
		  'background-color': 'honeydew',
		  'border': '3px green solid'
	});
	$('.failed').css({
		  'background-color': 'mistyrose',
		  'border': '3px darkred solid'
	});
	for (i = 0; i < coll.length; i++) {
	  coll[i].addEventListener("click", function() {
		this.classList.toggle("active");
		var content = this.nextElementSibling;
		if (content.style.maxHeight){
		  content.style.maxHeight = null;
		} else {
		  content.style.maxHeight = content.scrollHeight + "px";
		} 
	  });
	}
}
function setupBorderFix() {
	var coll = document.getElementsByClassName("borderfix");
	var i;

	for (i = 0; i < coll.length; i++) {
		coll[i].style="border:1px solid black;margin-left: 2em; padding-left: 3px;";
	}
}

