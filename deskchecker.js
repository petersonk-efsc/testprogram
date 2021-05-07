/*
 * JavaScript for Desk Checker
 *
 * KP
 * May 5, 2021
 */

var loginName;
var modFilename;
var resultsOutput;
var moduleInput;
var modProgress;
var modStatus;

/**************************************************************************/

function getcurrTime() {
	currTime = new Date();
	return (currTime.getMonth() + 1) 
		+ "/" + currTime.getDate() + "/" 
		+ currTime.getFullYear() + " " 
		+ currTime.getHours() + ":" 
		+ currTime.getMinutes() + ":" 
		+ currTime.getSeconds();
}


/**************************************************************************/

function getfname(fullname) {
	var tmp = fullname.substring(fullname.lastIndexOf('/')+1);
	tmp = tmp.substring(fullname.lastIndexOf('\\')+1);
	return tmp;
}

/**************************************************************************/

function readDcmFile()
{
	var oReq = new XMLHttpRequest();
	oReq.open("GET", modFilename, true);
	oReq.responseType = "arraybuffer";

	oReq.onload = function (oEvent) {
	  var arrayBuffer = oReq.response;
	  if (arrayBuffer) {
		var byteArray = new Uint8Array(arrayBuffer);
		var enc = new TextDecoder("utf-8");
		var resultStr = enc.decode(byteArray);
		var xmlText = modToXml(resultStr, byteArray.byteLength);

		parser = new DOMParser();
		moduleInput = parser.parseFromString(xmlText,"text/xml");
		buildDeskChecker();
	  }
	};

	oReq.send(null);
}


/**************************************************************************/

function setupPage() {
	loginName = "";
	modFilename = "";
	resultsOutput = "";
	moduleInput = "";

	var modFilenameTmp = atob("bmR0YWt0SGFgL0twcXNdZGIvbFBoc09lQnVYZERvTl9KQ3doajBVMWEuWWRyY2ht");
	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.has('mod')) {
		modFilenameTmp = atob(urlParams.get('mod'));
	}
	var newTxt = "";
	for (var i = 0; i < modFilenameTmp.length; i += 2) {
		newTxt += modFilenameTmp[i+1];
	}
	modFilename = newTxt;
		
	var fileResults = document.getElementById('fileResults');
	fileResults.addEventListener('change', function(e) {
		var file = fileResults.files[0];
		var reader = new FileReader();

		reader.onload = function(e) {
			var xmlText = resToXml(reader.result, reader.result.length);

			parser = new DOMParser();
			resultsOutput = parser.parseFromString(xmlText,"text/xml");
		};
		reader.readAsBinaryString(file);
	});
}

/**************************************************************************/

function downloadResults() {
	var resultsElem = resultsOutput.getElementsByTagName("deskcheckResult")[0];
		resultsElem.setAttribute("grade", (modStatus.allCorr * 100.0 / modStatus.allQuest).toFixed(2));
		resultsElem.setAttribute("saveTime", getcurrTime());
	var savedProgs = resultsOutput.getElementsByTagName("program");
	for (var i = 0; i < modProgress.length; i++) {
		if (modProgress[i].incorrStep == -1) {
			var newStep = moduleInput.getElementsByTagName("program")[i].getElementsByTagName("step")[modProgress[i].currStep];
			var newLineNum = newStep.getAttribute("lineNum"); 
			savedProgs[i].getElementsByTagName("lastHighlighted")[0].textContent = newLineNum;
			savedProgs[i].getElementsByTagName("currentStep")[0].textContent = modProgress[i].currStep + 1;
			savedProgs[i].getElementsByTagName("incorrectStep")[0].textContent = 0;
		} else {
			savedProgs[i].getElementsByTagName("lastHighlighted")[0].textContent = modProgress[i].lastHighlight;
			savedProgs[i].getElementsByTagName("currentStep")[0].textContent = modProgress[i].currStep;
			savedProgs[i].getElementsByTagName("incorrectStep")[0].textContent = modProgress[i].incorrStep;
		}
		savedProgs[i].getElementsByTagName("totalQuestions")[0].textContent = modProgress[i].totalQuest;
		savedProgs[i].getElementsByTagName("totalCorrect")[0].textContent = modProgress[i].totalCorr;
		savedProgs[i].getElementsByTagName("totalAnswered")[0].textContent = modProgress[i].totalAns;
		savedProgs[i].getElementsByTagName("bestCorrect")[0].textContent = modProgress[i].bestCorr;
		savedProgs[i].getElementsByTagName("bestCompleted")[0].textContent = modProgress[i].bestComp;
		savedProgs[i].getElementsByTagName("bestTime")[0].textContent = modProgress[i].bestTime;
	}
	// https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server		
	var element = document.createElement('a');
	var resultsString = (new XMLSerializer()).serializeToString(resultsOutput);
	if (!resultsString.startsWith('<?xml')) {
		resultsString = '<?xml version="1.0" encoding="utf-16"?>' + resultsString;
	}

	var tmp = xmlToRes(resultsString, resultsString.length);
	var textToWrite = "";
	for (var i = 0; i < resultsString.length; i++) {
		textToWrite += String.fromCharCode(getXmlResChar(i));
	}
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(textToWrite));
	
	var downFile = getfname(modFilename);
	downFile = downFile.substring(0, downFile.lastIndexOf('.')) + "_" + loginName + ".dcr";
	element.setAttribute('download', downFile);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

/**************************************************************************/

function buildResults() {
	if (resultsOutput == "") {
		res = document.implementation.createDocument("", "", null);
		var resultsElem = res.createElement("deskcheckResult");
		resultsElem.setAttribute("grade", "0.00");
		resultsElem.setAttribute("saveTime", "1/1/0001 12:00:00 AM");
		resultsElem.setAttribute("studName", loginName);
		var programs = moduleInput.getElementsByTagName("program");
		for (var i = 0; i < programs.length; i++) {
			var progElem = res.createElement("program");
			var tmpElem = res.createElement("progName");
			tmpElem.innerHTML = programs[i].getAttribute("progName");
			progElem.appendChild(tmpElem);

			tmpElem = res.createElement("lastHighlighted");
			tmpElem.innerHTML = "0";
			progElem.appendChild(tmpElem);

			tmpElem = res.createElement("currentStep");
			tmpElem.innerHTML = "0";
			progElem.appendChild(tmpElem);

			tmpElem = res.createElement("incorrectStep");
			tmpElem.innerHTML = "0";
			progElem.appendChild(tmpElem);

			tmpElem = res.createElement("totalQuestions");
			tmpElem.innerHTML = "";
			progElem.appendChild(tmpElem);

			tmpElem = res.createElement("totalCorrect");
			tmpElem.innerHTML = "0";
			progElem.appendChild(tmpElem);

			tmpElem = res.createElement("totalAnswered");
			tmpElem.innerHTML = "0";
			progElem.appendChild(tmpElem);

			tmpElem = res.createElement("bestCorrect");
			tmpElem.innerHTML = "0";
			progElem.appendChild(tmpElem);

			tmpElem = res.createElement("bestCompleted");
			tmpElem.innerHTML = "0";
			progElem.appendChild(tmpElem);

			tmpElem = res.createElement("bestTime");
			tmpElem.innerHTML = "1/1/0001 12:00:00 AM";
			progElem.appendChild(tmpElem);
				
			resultsElem.appendChild(progElem);	
		}
		res.appendChild(resultsElem);
		resultsOutput = res;
	}
}

/**************************************************************************/

function resetProg(progNum) {
	modProgress[progNum].lastHighlight = 0;
	modProgress[progNum].currStep = 0;
	modProgress[progNum].incorrStep = 0;
	modProgress[progNum].totalCorr = 0;
	modProgress[progNum].totalAns = 0;
	updateGrade(progNum, 0, 0);
	var ul = document.getElementById('Prog'+ progNum +'Content');
	var items = ul.getElementsByTagName("li");
	for (var j = 0; j < items.length; j++) {
		items[j].className = "notselected";
	}
	moveToFirst(progNum);
}

/**************************************************************************/

function updateStatusList() {
	document.getElementById("resultCount").innerHTML = 
		"<li>Answered: " + modStatus.allAns + " of " + modStatus.allQuest + "</li>"
		+ "<li>Correct: " + modStatus.allCorr + "</li>"
		+ "<li>Grade: " + modStatus.allCorr + " / " + modStatus.allQuest + " = "
		+ (modStatus.allCorr * 100.0 / modStatus.allQuest).toFixed(1) + "%</li>";
}

/**************************************************************************/

function updateGrade(progNum, addCorr, addAns) {
	var updateOverall = false;
	modProgress[progNum].totalCorr += addCorr;
	modProgress[progNum].totalAns += addAns;
	if (modProgress[progNum].totalCorr > modProgress[progNum].bestCorr) {
		modProgress[progNum].bestCorr = modProgress[progNum].totalCorr;
		modProgress[progNum].bestTime = getcurrTime();
		modStatus.allCorr += addCorr;
		updateOverall = true;
	}
	if (modProgress[progNum].totalAns > modProgress[progNum].bestComp) {
		modProgress[progNum].bestComp = modProgress[progNum].totalAns;
		modProgress[progNum].bestTime = getcurrTime();
		modStatus.allAns += addAns;
		updateOverall = true;
	}
	if (updateOverall) {
		updateStatusList();
	}
	var heading = document.getElementById("btn" + (progNum + 1));
	heading.innerHTML = moduleInput.getElementsByTagName("deskcheck")[0].getElementsByTagName("program")[progNum].getAttribute("progName")
		+ " (" + modProgress[progNum].totalCorr + " / " + modProgress[progNum].totalQuest + " = "
		+ (modProgress[progNum].totalCorr * 100.0 / modProgress[progNum].totalQuest).toFixed(1) + "%)"
		+ " (Best grade: " + (modProgress[progNum].bestCorr * 100.0 / modProgress[progNum].totalQuest).toFixed(1) + "%)";
}

/**************************************************************************/

function moveToNextStep(progNum, oldStep, oldLineNum) {
	document.getElementById("prog" + progNum + "_line" + oldLineNum).className = "notselected";
	modProgress[progNum].incorrStep = 0;
	if (oldStep.hasAttribute("output")) {
		var tmp = document.getElementById("Prog" + progNum + "Output").innerHTML;
		document.getElementById("Prog" + progNum + "Output").innerHTML = tmp + oldStep.getAttribute("output").replace("\\n", "<br/>");
	}
	modProgress[progNum].currStep++;
	modProgress[progNum].incorrStep = 0;
	var newStep = moduleInput.getElementsByTagName("program")[progNum].getElementsByTagName("step")[modProgress[progNum].currStep];
	var newLineNum = newStep.getAttribute("lineNum"); 
	modProgress[progNum].lastHighlight = newLineNum;
	document.getElementById("prog" + progNum + "_line" + newLineNum).className = "selected";
	var quest = "Click Next";
	if (newStep.hasAttribute("question")) {
		quest = newStep.getAttribute("question");
	}
	document.getElementById("Prog" + progNum + "Quest").innerHTML = quest;
	if (newStep.hasAttribute("preoutput")) {
		var tmp = document.getElementById("Prog" + progNum + "Output").innerHTML;
		document.getElementById("Prog" + progNum + "Output").innerHTML = tmp + newStep.getAttribute("preoutput").replace("\\n", "<br/>");
	}
	var symbols = newStep.getElementsByTagName("symbol");
	var tmp = "";
	for (var i = 0; i < symbols.length; i++) {
		tmp += "<li>" + symbols[i].getAttribute("varName") + " = " +
		 symbols[i].getAttribute("varValue") + "</li>";
	}
	document.getElementById("Prog" + progNum + "SymTab").innerHTML = tmp;
	document.getElementById('Prog' + progNum + 'Content').style.maxHeight = 
			(document.getElementById('Prog'+progNum+'Content').scrollHeight * 1.10) + "px";
	document.getElementById("Prog" + progNum + "Status").innerHTML = ".";
	document.getElementById("Prog" + progNum + "Status").style.backgroundColor = "";
	document.getElementById("Prog" + progNum + "Status").style.border = "solid white";
	document.getElementById('Prog' + progNum + 'Ans').value = "";
}

/**************************************************************************/

function checkProgAnswer(progNum, theAnswer) {
	var oldStep = moduleInput.getElementsByTagName("program")[progNum].getElementsByTagName("step")[modProgress[progNum].currStep];
	var oldLineNum = oldStep.getAttribute("lineNum");
	if ((modProgress[progNum].currStep + 1) < moduleInput.getElementsByTagName("program")[progNum].getElementsByTagName("step").length) {
		var ans = oldStep.getAttribute("answer")
		if (ans == null || ans == "" || modProgress[progNum].incorrStep == -1) {
			moveToNextStep(progNum, oldStep, oldLineNum);
		} else if (ans == theAnswer) {
			modProgress[progNum].incorrStep = -1;
			document.getElementById("Prog" + progNum + "Status").innerHTML = "Correct!";
			document.getElementById("Prog" + progNum + "Status").style.backgroundColor = "honeydew";
			document.getElementById("Prog" + progNum + "Status").style.border = "solid green";
			updateGrade(progNum, 1, 1);
		} else {
			modProgress[progNum].incorrStep++;
			if (modProgress[progNum].incorrStep == 1) {
				document.getElementById("Prog" + progNum + "Status").innerHTML = "Incorrect, try again";
				document.getElementById("Prog" + progNum + "Status").style.backgroundColor = "lemonchiffon";
				document.getElementById("Prog" + progNum + "Status").style.border = "solid darkorange";

			} else if (modProgress[progNum].incorrStep == 3) {
				document.getElementById("Prog" + progNum + "Status").innerHTML = "Sorry the answer was " + ans;
				document.getElementById("Prog" + progNum + "Status").style.backgroundColor = "mistyrose";
				document.getElementById("Prog" + progNum + "Status").style.border = "solid darkred";
				modProgress[progNum].incorrStep = -1;
				updateGrade(progNum, 0, 1);
			}
		}	
	}
}

/**************************************************************************/

function loadDeskChecker() {
	loginName = document.getElementById("loginName").value;
	if (loginName == "") {
		alert('Need to enter name before continuing');
	} else {
		readDcmFile();
	}
}

/**************************************************************************/

function buildDeskChecker() {
	modStatus = { allCorr: 0, allAns: 0, allQuest: 0 };
	var programs = moduleInput.getElementsByTagName("program");
	modProgress = [];
	var allCorrect = 0;
	for (var i = 0; i < programs.length; i++) {
		modProgress.push({lastHighlight: 0,
			currStep: 0,
			incorrStep: 0,
			totalQuest: 0,
			totalCorr: 0,
			totalAns: 0,
			bestComp: 0,
			bestCorr: 0,
			bestTime: getcurrTime()});
		var steps = programs[i].getElementsByTagName("step");
		for (var j = 0; j < steps.length; j++) {
			if (steps[j].hasAttribute("answer")) {
				if (steps[j].getAttribute("answer") != "") {
					modProgress[i].totalQuest++;
				}
			}
		}
		modStatus.allQuest += modProgress[i].totalQuest;
	}
	
	if (resultsOutput == "") {
		buildResults();
	} else {
		var matches = true;
		var savedProgs = resultsOutput.getElementsByTagName("program");
		for (var i = 0; i < savedProgs.length; i++) {
			if (savedProgs[i].getElementsByTagName("progName")[0].textContent != programs[i].getAttribute("progName")) {
				matches = false;
			}
		}
		if (!matches) {
			alert("Warning - results file does not match module, starting with no results");
			resultsOutput = "";
			buildResults();
		} else if (resultsOutput.getElementsByTagName("deskcheckResult")[0].getAttribute("studName") != loginName) {
			alert("Warning - results file does not match username, starting with no results");
			resultsOutput = "";
			buildResults();
		} else {
			for (var i = 0; i < savedProgs.length; i++) {
				modProgress[i].lastHighlight = parseInt(savedProgs[i].getElementsByTagName("lastHighlighted")[0].textContent);
				modProgress[i].currStep = parseInt(savedProgs[i].getElementsByTagName("currentStep")[0].textContent);
				if (modProgress[i].currStep < 0) {
					modProgress[i].currStep = 0;
				}
				modProgress[i].incorrStep = parseInt(savedProgs[i].getElementsByTagName("incorrectStep")[0].textContent);
				modProgress[i].totalCorr = parseInt(savedProgs[i].getElementsByTagName("totalCorrect")[0].textContent);
				modProgress[i].totalAns = parseInt(savedProgs[i].getElementsByTagName("totalAnswered")[0].textContent);
				modProgress[i].bestCorr = parseInt(savedProgs[i].getElementsByTagName("bestCorrect")[0].textContent);
				modProgress[i].bestComp = parseInt(savedProgs[i].getElementsByTagName("bestCompleted")[0].textContent);
				modProgress[i].bestTime = savedProgs[i].getElementsByTagName("bestTime")[0].textContent;
				modStatus.allCorr += modProgress[i].bestCorr;
				modStatus.allAns += modProgress[i].bestComp;
			}
		}
	}
		
	document.getElementById('setup').innerHTML = "";
	document.getElementById('deskchecker').innerHTML = moduleInput.getElementsByTagName("deskcheck")[0].getAttribute("version") + "<br>";
	var deskDivText = "<div  class='grid-results'><div class='grid-results-item'>Name: " + loginName
		+ "<br/>Module: " + getfname(modFilename)
		+ "<br/><span style='background-color: yellow'>*** Before you leave this page, please SAVE your results!</span></div>"
		+ "<div class='grid-results-item'><ul id='resultCount'><li>Answered: 0 of 0</li>" 
			+ "<li>Correct: 0 </li>"
			+ "<li>Grade: 0 / 0 = 0%</li>"
		+ "</ul></div></div>"
		+ "<button id='saveBtn1' name='saveBtn1' class='widebutton' onclick='downloadResults();'>Save</button><br/><br/>";
	var programs = moduleInput.getElementsByTagName("deskcheck")[0].getElementsByTagName("program");

	for (let j = 0; j < programs.length; j++) {
		var btnName = "btn" + (j+1);
		var nameText = programs[j].getAttribute("progName");
		var extraNameText = " (NOT STARTED)";
								
		var borderStyle = "background-color: mistyrose; border: 3px darkred solid";

		dummyText = "<div id=\"Prog" + j + "Content\" class=\"content\">";
		dummyText += "   <br/><button id=\"Prog" + j + "ResetBtn\" onclick=\"resetProg(" + j + 
			");\">Reset</button><br/>\n";		
		dummyText += "<div>Variables:";
		dummyText += "<ul id=\"Prog" + j + "SymTab\"  style=\"border: solid\"><li> </li></ul></div>";
		dummyText += "<div>Console:<br/><p id=\"Prog" + j + "Output\"  style=\"border: solid; min-height: 10px;\"></p></div>";
		dummyText += "<ol>";
		var codes = programs[j].getElementsByTagName("code")[0].getElementsByTagName("line");
		for (var i = 0; i < codes.length; i++)
		{
			dummyText += "    <li id=\"prog" + j + "_line" + i + "\">" + codes[i].getAttribute("text") + "</li>\n";
		}
		dummyText += "</ol>\n";
		dummyText += "    <div id=\"Prog" + j + "Quest\">The question?</div>\n";
		dummyText += "    <div id=\"Prog" + j + "Status\">.</div>\n";

		dummyText += "   <input id=\"Prog" + j + 
			"Ans\" type=\"text\" onkeydown=\"if (event.keyCode == 13) { document.getElementById('Prog" + 
			j + "Btn').click(); }\">\n";
		dummyText += "   <button id=\"Prog" + j + "Btn\" onclick=\"checkProgAnswer(" + j + 
			", document.getElementById(" +
			"'Prog" + j + "Ans').value);\">Next</button>\n";
		dummyText += "<br/><br/></div>\n";
		dummyText += "</div>\n";
		
		deskDivText += 
			'<button class="collapsible "' +
			' id="' + btnName + '"' +
			' style="' + borderStyle + '"' +
			' data-num="' + (j+1) + '"' +
			' data-correct="' + "0" + '"' +
			' data-total="' + "0" + '"' +
			'>' + 
			nameText + extraNameText +
			"</button>" +
			dummyText +
			"";
	}
	deskDivText += "<br/><button id='saveBtn' name='saveBtn'  class='widebutton' onclick='downloadResults();'>Save</button>"

	document.getElementById('deskchecker').innerHTML = deskDivText;
	setupCollapsible();
	var numProg = programs.length;
	for (i = 0; i < numProg; i++)
	{
		updateGrade(i, 0, 0);
		var ul = document.getElementById('Prog'+i+'Content');
		var items = ul.getElementsByTagName("li");
		for (var j = 0; j < items.length; j++) {
			items[j].className = "notselected";
		}
		moveToFirst(i);
	}
	updateStatusList();
}

/**************************************************************************/

function moveToFirst(progNum) {
	var consoleTxt = "";
	var steps = moduleInput.getElementsByTagName("program")[progNum].getElementsByTagName("step");
	for (var step = 0; step < modProgress[progNum].currStep; step++) {
		if (steps[step].hasAttribute("preoutput")) {
			consoleTxt += steps[step].getAttribute("preoutput");
		}
		if (steps[step].hasAttribute("output")) {
			consoleTxt += steps[step].getAttribute("output");
		}
	}
	if (steps[modProgress[progNum].currStep].hasAttribute("preoutput")) {
		consoleTxt += steps[modProgress[progNum].currStep].getAttribute("preoutput");
	}
	document.getElementById("Prog" + progNum + "Output").innerHTML = consoleTxt.replace("\\n", "<br/>");
	modProgress[progNum].incorrStep = 0;
	var newStep = moduleInput.getElementsByTagName("program")[progNum].getElementsByTagName("step")[modProgress[progNum].currStep];
	var newLineNum = newStep.getAttribute("lineNum"); 
	document.getElementById("prog" + progNum + "_line" + newLineNum).className = "selected";
	var quest = "Click Next";
	if (newStep.hasAttribute("question")) {
		quest = newStep.getAttribute("question");
	}
	document.getElementById("Prog" + progNum + "Quest").innerHTML = quest;

	var symbols = newStep.getElementsByTagName("symbol");
	var tmp = "";
	for (var i = 0; i < symbols.length; i++) {
		tmp += "<li>" + symbols[i].getAttribute("varName") + " = " +
		 symbols[i].getAttribute("varValue") + "</li>";
	}
	document.getElementById("Prog" + progNum + "SymTab").innerHTML = tmp;
	document.getElementById("Prog" + progNum + "Status").innerHTML = ".";
	document.getElementById("Prog" + progNum + "Status").style.backgroundColor = "";
	document.getElementById("Prog" + progNum + "Status").style.border = "solid white";
	document.getElementById('Prog' + progNum + 'Ans').value = "";
}


