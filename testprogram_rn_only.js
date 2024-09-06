/*
 * JavaScript for TestProgram
 *
 * KP
 * Dec 17, 2020
 */
 
/* https://stackoverflow.com/questions/955110/similarity-string-comparison-in-java */
/* And then converted from java to javascript with http://www.jsweet.org/jsweet-live-sandbox/ */
/**
 * Calculates the similarity (a number within 0 and 1) between two strings.
 */
function similarity (s1, s2) {
	var ns1 = s1.replaceAll('\r\n', '\n');
	var ns2 = s2.replaceAll('\r\n', '\n');
	var longer = ns1;
	var shorter = ns2;
	if (ns1.length < ns2.length) {
		longer = ns2;
		shorter = ns1;
	}
	var longerLength = longer.length;
	if (longerLength === 0) {
		return 1.0;
	}
	return (longerLength - editDistance(longer, shorter)) / longerLength;
}

function editDistance(s1, s2) {
	var costs = (function (s) { var a = []; while (s-- > 0)
		a.push(0); return a; })(s2.length + 1);
	for (var i = 0; i <= s1.length; i++) {
		var lastValue = i;
		for (var j = 0; j <= s2.length; j++) {
			if (i === 0) {
				costs[j] = j;
			}
			else {
				if (j > 0) {
					var newValue = costs[j - 1];
					if ((function (c) { return c.charCodeAt == null ? c : c.charCodeAt(0); })(s1.charAt(i - 1)) != (function (c) { return c.charCodeAt == null ? c : c.charCodeAt(0); })(s2.charAt(j - 1))) {
						newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
					}
					costs[j - 1] = lastValue;
					lastValue = newValue;
				}
			}
		}
		if (i > 0) {
			costs[s2.length] = lastValue;
		}
	}
	return costs[s2.length];
}

function round100th(n) {
	return Math.round(n * 100) / 100;
}

/* https://forums.asp.net/t/2119943.aspx?convert+txt+file+to+javascript+array */
function setupPage() {
	var fileResults = document.getElementById('fileResults');
	fileResults.addEventListener('change', function(e) {
		var file = fileResults.files[0];
		var reader = new FileReader();
		var sumDivText = "";
		var total = 0;
		var numTests = 0;

		reader.onload = function(e) {
			resultsText = reader.result;
			$(document).ready(function () {
				var parser;
				var xmlDoc;
				
				parser = new DOMParser();
				xmlDoc = parser.parseFromString(resultsText,"text/xml");
				
				var testNodes = xmlDoc.getElementsByTagName('tests')[0].children				
				if (testNodes) {
					var resDivText = "";
					for (var i = 0; i < testNodes.length; i++) {
						var btnName = "btn" + (i+1);
						if (testNodes[i].tagName == "test") {
							numTests++;

							var lhsText = testNodes[i].getElementsByTagName("generated")[0].childNodes[0].nodeValue;
							lhsText = lhsText.substr(2, lhsText.length-2);

							var rhsText = testNodes[i].getElementsByTagName("expected")[0].childNodes[0].nodeValue;
							rhsText = rhsText.substr(2, rhsText.length-2);
							
							var simPercent = (round100th(similarity(rhsText, lhsText) * 100));
							var nameText = "Run Test " + (i+1) + " (" + testNodes[i].getElementsByTagName("name")[0].innerHTML + ")" + " = " + simPercent + "%"
							var retVal = parseInt(testNodes[i].getElementsByTagName("return")[0].innerHTML);
							var genCount = parseInt(testNodes[i].getElementsByTagName("gencount")[0].innerHTML);
							if ((retVal != 0 && retVal != -1) || genCount < 0) {
								simPercent -= 10;
								if (simPercent < 0) {
									simPercent = 0;
								}
								nameText += " - 10% (Hung/Crashed) -> " + (round100th(simPercent)) + "%";
							}
							total += simPercent;
							sumDivText += "<br>" + nameText;
							var extraClass = "failed";
							if (simPercent >= 100) {
								extraClass = "passed"; //document.getElementById(btnName).classList.add("passed");
							}
							resDivText += 
								"<button class=\"collapsible " + extraClass + "\" id=\"" + btnName + "\">" + nameText + "</button>" +
								"<div class=\"content\">" +
								"	<div style=\"height: 450px; width: 100%;\">" +
								"		<div class=\"mergely-resizer\">" +
								"			<div id=\"compare" + (i+1) + "\">" +
								"			</div>" +
								"		</div>" +
								"	</div>" +
								"</div>" +
								"<br>";
						} else if (testNodes[i].tagName == "minitest") {
							numTests++;
							var nameText = "Mini Test " + (i+1) + " (" + testNodes[i].getElementsByTagName("name")[0].innerHTML + ")";
							var retVal = parseInt(testNodes[i].getElementsByTagName("return")[0].innerHTML);
							var genCount = parseInt(testNodes[i].getElementsByTagName("gencount")[0].innerHTML);
							var regex = testNodes[i].getElementsByTagName("regex")[0].childNodes[0].nodeValue;
							regex=new RegExp(regex.trim());
							var genText = testNodes[i].getElementsByTagName("generated")[0].childNodes[0].nodeValue;
							
							var regexMatched = genText.search(regex);
							var matchedText = "FAIL";
							var matchedScore = 0;
							if (regexMatched >= 0) {
								matchedText = "PASS";
								matchedScore = 100;
							}
							nameText = nameText + " -> " + matchedText + " = " + matchedScore + "%"
							if ((retVal != 0 && retVal != -1) || genCount < 0) {
								matchedScore -= 10;
								if (matchedScore < 0) {
									matchedScore = 0;
								}
								nameText += " - 10% (Hung/Crashed) -> " + (round100th(matchedScore)) + "%";
							}
							sumDivText += "<br>" + nameText;
							total += matchedScore;
							var extraClass = "failed";
							if (matchedScore >= 100) {
								extraClass = "passed";
							}
							resDivText += 
								"<button class=\"collapsible " + extraClass + "\" id=\"" + btnName + "\" style=\"" + borderStyle + "\">" + nameText + 
								"</button>" +
								"<div class=\"content\">" +
								"	<p>Search For:</p>" +
								"	<pre class=\"borderfix\">" + testNodes[i].getElementsByTagName("friendlyregex")[0].childNodes[0].nodeValue + "</pre>" +
								"	<p>Input:</p>" +
								"	<pre class='borderfix'>" + testNodes[i].getElementsByTagName("input")[0].childNodes[0].nodeValue + "</pre>" +
								"	<p>Your Output:</p>" +
								"	<pre class='borderfix'>" + testNodes[i].getElementsByTagName("generated")[0].childNodes[0].nodeValue + "</pre>" +
								"</div>" +
								"<br>";						
						} else if (testNodes[i].tagName == "sourcetest") {
							numTests++;
							var nameText = "Source Test " + (i+1) + " (" + testNodes[i].getElementsByTagName("name")[0].innerHTML + ")";
							var regex = testNodes[i].getElementsByTagName("regex")[0].childNodes[0].nodeValue;
							regex=new RegExp(regex.trim());
							var genText = testNodes[i].getElementsByTagName("sourcefile")[0].childNodes[0].nodeValue;
							
							var regexMatched = genText.search(regex);
							var matchedText = "FAIL";
							var matchedScore = 0;
							var borderStyle = "background-color: crimson";
							var extraClass = "failed";
							if (regexMatched >= 0) {
								matchedText = "PASS";
								matchedScore = 100;
								borderStyle = "background-color: lightgreen";
								extraClass = "passed";
							}
							total += matchedScore;
							nameText = nameText + " -> " + matchedText + " = " + matchedScore + "%"
							sumDivText += "<br>" + nameText;
							resDivText += 
								"<button class=\"collapsible " + extraClass + "\" id=\"" + btnName + "\" style=\"" + borderStyle + "\">" + nameText +
								"</button>" +
								"<div class=\"content\">" +
								"	<p>Search For:</p>" +
								"	<pre class=\"borderfix\">" + testNodes[i].getElementsByTagName("friendlyregex")[0].childNodes[0].nodeValue + "</pre>" +
								"	<p>Source File:</p>" +
								"	<pre class='borderfix'>" + testNodes[i].getElementsByTagName("sourcefile")[0].childNodes[0].nodeValue.replaceAll('<', '&lt;') + "</pre>" +
								"</div>" +
								"<br>";						
						}
					}	
					document.getElementById('results').innerHTML = resDivText;
					for (var i = 0; i < testNodes.length; i++) {
						if (testNodes[i].tagName == "test") {
							var compName = "#compare" + (i+1);
							var btnName = "btn" + (i+1);
							$(compName).mergely({
								width: 'auto',
								height: 'auto',
								license: 'lgpl-separate-notice',
								cmsettings: {
									readOnly: false, 
									lineWrapping: true,
								}
							});

							var lhsText = testNodes[i].getElementsByTagName("generated")[0].childNodes[0].nodeValue;
							lhsText = lhsText.substr(2, lhsText.length-2);
							$(compName).mergely('lhs', lhsText);

							var rhsText = testNodes[i].getElementsByTagName("expected")[0].childNodes[0].nodeValue;
							rhsText = rhsText.substr(2, rhsText.length-2);
							$(compName).mergely('rhs', rhsText);
						}
					}
				}

				setupBorderFix();
				var average = round100th(total / numTests);
				sumDivText = "Score: " + average + "%<br>" + sumDivText;
				document.getElementById("summary").innerHTML = sumDivText;
				document.getElementById("summary").classList.remove("passed");
				document.getElementById("summary").classList.remove("failed");
				if (average >= 100) {
					document.getElementById("summary").classList.add("passed");
				} else {
					document.getElementById("summary").classList.add("failed");
				}
				setupCollapsible();
				fileResults.value = "";
			});
		};
		reader.readAsBinaryString(file);
	});				
}
