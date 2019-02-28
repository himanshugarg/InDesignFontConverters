﻿/******************************************************************************
	Copyright 2019, AssisTech, Indian Institute of Technology, Delhi 
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>. 
*******************************************************************************/
setupEssentials(); 
var mappings = readMappings();
main(mappings);
function main(mappings) {
	for (var i = 0; i < mappings.length; i++) 		
		convert.apply(null, mappings[i]);
	convert(read_tsv(app.activeScript.path + "/reorder.tsv"));
}

function readMappings() {  
  // read all the font mappings
  var table = read_tsv(app.activeScript.path + "/fonts.tsv");

  // the above loop just read the name of the file containing byte to unicode mappings. actually load the file here.
  for (var i = 0; i < table.length; i++) {
    var filename = table[i][0];
    var firstname = filename.split('.')[0];
    table[i][0] = read_tsv(app.activeScript.path + "/" + filename);	
  }
  return table.filter(function(e) {
                                  var docFonts = app.activeDocument.fonts;
                                  for (var i = 0; i < docFonts.count(); i++) 
                                    if (docFonts[i].fontFamily == e[1]) 
                                      return true;	
                                    return false;
                            });
}

// utility functions for lookup and filtering not available in ID javascript
function setupEssentials() {	
	if (typeof Array.prototype.filter != "function")
		Array.prototype.filter = function (func) {
			var a = [];
			for(var i = 0; i < this.length; i++)
				if (func(this[i])) 
					a.push(this[i]);
			return a;
		}	
}

// convert from a source font name/style to target font name/style using the map which is a 2-D array
function convert(map, srcFont, srcStyle, tgtFont, tgtStyle, scalingFactor, language) {
  
	function change() {
		try {
			
			app.findGrepPreferences = NothingEnum.NOTHING;
			app.changeGrepPreferences = NothingEnum.NOTHING;
			if (srcFont) app.findGrepPreferences.appliedFont = srcFont;      
			if (srcStyle) app.findGrepPreferences.fontStyle = srcStyle;
			app.findGrepPreferences.findWhat = map[j][0];
			
			if (map[j][1]) { // don't set target font and style if empty. Otherwise ID will map to itself.
				if (tgtFont) app.changeGrepPreferences.appliedFont = tgtFont;
				if (tgtStyle) app.changeGrepPreferences.fontStyle = tgtStyle;
			}
			app.changeGrepPreferences.changeTo = map[j][1] ? map[j][1]:"";
      
			if (language) app.changeGrepPreferences.appliedLanguage = language; 
			//app.changeGrepPreferences.composer = "Adobe World-Ready Paragraph Composer";
			app.activeDocument.changeGrep();
		} catch(e) {
			alert(srcFont + ", " + tgtFont + ", "  + map[j][0] + ", " + map[j][1] + ": " + e.message);
		}
	};
	app.findChangeGrepOptions.includeFootnotes = true;    
	app.findChangeGrepOptions.includeHiddenLayers = true;    
	app.findChangeGrepOptions.includeLockedLayersForFind = true;    
	app.findChangeGrepOptions.includeLockedStoriesForFind = true;    
	app.findChangeGrepOptions.includeMasterPages = true;
	app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.NOTHING;
	for (var j = 0; j < map.length; j++)
		change();
} 

// read a file containing tab separated values and return it as a 2-d array
function read_tsv(filepath) {
	var ifile = new File(filepath);    
	ifile.encoding = 'UTF-8';
	var a = [];
	if(!ifile.exists)	alert("Could not open " + filepath + " for reading");
	
	ifile.open("r");
	while (!ifile.eof) {
		var words = ifile.readln().split("\t");
		a.push(words.filter(function(e) {return e != ''})); 
	}
	ifile.close();
	return a;
}