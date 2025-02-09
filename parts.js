autowatch = 1;
outlets = 2;


var parts = new Array();
var maxparts = 4;
var moveslice = 0;
var dim = [640, 480];
var speedsound = 0.01
var picmatrix  = new JitterMatrix(4, "char", dim);
var newmatrix = new JitterMatrix(4, "char", dim);
var outputmatrix = new JitterMatrix(4, "char", dim);
var resamp = new JitterObject("jit.resamp");


declareattribute("maxparts", null, "setmaxslices", 0);
declareattribute("dim", null, "setdim", 0);
declareattribute ("speedsound", null); 


function setdim(width, height)
{
	if (width < 1) width = 1;
	if (height < 1) height = 1;

	dim[0] = width;
	dim[1] = height;
	newmatrix.dim = dim;
	outputmatrix.dim = dim;
}

function setmaxparts(val) {
	if (val < 1)
		maxparts = 1;
	else
		maxparts = val;
}

function addpart() {
	var part = new Object();
	var choose;
	var which;
	var breakpoint;
	var left;
	var top;
	var width;
	var height;
	var newrect;

	
	choose = Math.random() < 0.5 ? true : false;
	which = Math.random() < 0.5 ? true : false;
	if (moveslice == 0) {
		left = 0;
		top = 0;
		width = dim[0];
		height = dim[1];
	} else {
		left = parts[moveslice-1].left;
		top = parts[moveslice-1].top;
		width = parts[moveslice-1].width;
		height = parts[moveslice-1].height;
	}
	if (!choose) { 
		breakpoint = Math.round((Math.random() * 0.5 + 0.25) * width);
		if (!which) { 
			newrect = [left, top, breakpoint, height];
		} else {
			newrect = [left + breakpoint, top, width - breakpoint, height];
		}
	} else {
		breakpoint = Math.round((Math.random() * 0.7 + 0.15) * height);
		if (!which) { 
			newrect = [left, top, width, breakpoint];
		} else {
			newrect = [left, top + breakpoint, width, height - breakpoint];
		}
	}
	
	part.left = newrect[0];
	part.top = newrect[1];
	part.width = newrect[2];
	part.height = newrect[3];

	part.xpos = Math.random() * 0.5 + 0.25;
	part.ypos = Math.random() * 0.5 + 0.25;

	part.speed = (Math.random() * 2. - 1.) * speedsound; // -0.01 - 0.01
	part.dir = choose; 

	outlet(1, "paintrect", part.left/2, part.top/2, (part.left+part.width)/2, (part.top+part.height)/2, Math.random()*255, Math.random()*255, Math.random()*255);
	parts[moveslice] = part;
	moveslice = (moveslice+1) % maxparts;	
}

function clear() {
	parts.splice(0, parts.length);
	moveslice = 0;
	outputmatrix.clear();
	outlet(1, "clear");
}

function jit_matrix(inname) {
	picmatrix .setinfo(inname);
	picmatrix .frommatrix(inname);
}

function bang() {
	for (var s in parts) {
		var part = parts[s];
		
		if (!part.dir) {
			part.xpos += part.speed;
			if (part.xpos > 100) part.xpos -= 100.;
			if (part.xpos < 0) part.xpos = 100. + part.xpos;
	} else {
			part.ypos += part.speed;
			if (part.ypos > 100) part.ypos -= 100.;
			if (part.ypos < 0) part.ypos = 100. + part.ypos;
		}
		resamp.xshift = part.xpos;
		resamp.yshift = part.ypos;
		resamp.wrap = 1;
		resamp.matrixcalc(picmatrix , newmatrix);

		outputmatrix.usesrcdim = 1;
		outputmatrix.srcdimstart = [0, 0];
		outputmatrix.srcdimend = [part.width, part.height];
		outputmatrix.usedstdim = 1;
		outputmatrix.dstdimstart = [part.left, part.top];
		outputmatrix.dstdimend = [part.left + part.width, part.top + part.height];

		outputmatrix.frommatrix(newmatrix);
	}
	outlet(0, "jit_matrix", outputmatrix.name);
}