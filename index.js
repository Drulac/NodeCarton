const util = require('util');
const fs = require('fs');
const PNG = require('pngjs').PNG;

Array.prototype.aIndexOf = function(value) {
	for(let i = 0; i < this.length; i++)
	{
		if(this[i] == value)
		{
			return i;
		}
	}
	return -1;
}

Array.prototype.aAindexOf = function(value) {
	for(let i = 0; i < this.length; i++)
	{
		let retour = this[i].indexOf(value);
		if(retour != -1)
		{
			return {x: retour, y:i};
		}
	}
	return -1;
}

fs.createReadStream("img/"+"collines.png")
.pipe(new PNG({
	filterType: 4
}))
.on('parsed', function() {
	let donnees = this.data;
	let data = convertData(this.data, this.width, this.height);

	//traitement de l'image

	data = potDePeinture(15, data, this.width, this.height);
	
	let w = this.width;
	let h = this.height;

	let seuil = 20;

	for (let y = 0; y < data.length; y++) {
		for (let x = 0; x < data[y].length; x++) {
			let rr = data[y][x].r;
			let gg = data[y][x].g;
			let bb = data[y][x].b;
			if(x < w-3)
			{
				let r = ((rr - data[y][x+1].r) + (rr - data[y][x+2].r) + (gg - data[y][x+3].g)) / 3;
				let g = ((gg - data[y][x+1].g) + (gg - data[y][x+2].g) + (gg - data[y][x+3].g)) / 3;
				let b = ((bb - data[y][x+1].b) + (bb - data[y][x+2].b) + (bb - data[y][x+3].b)) / 3;

				if((r > seuil || r < 0-seuil) && (g > seuil || g < 0-seuil) && (b > seuil || b < 0-seuil)) {
					data[y][x].r = 0;
					data[y][x].g = 0;
					data[y][x].b = 0;
				}
			}else if(x < w-2){
				let r = ((rr - data[y][x+1].r) + (gg - data[y][x+2].g)) / 2;
				let g = ((gg - data[y][x+1].g) + (gg - data[y][x+2].g)) / 2;
				let b = ((bb - data[y][x+1].b) + (bb - data[y][x+2].b)) / 2;

				if((r > seuil || r < 0-seuil) && (g > seuil || g < 0-seuil) && (b > seuil || b < 0-seuil)) {
					data[y][x].r = 85;
					data[y][x].g = 85;
					data[y][x].b = 85;
				}
			}else if(x < w-1){
				let r = (rr - data[y][x+1].r);
				let g = (gg - data[y][x+1].g);
				let b = (bb - data[y][x+1].b);

				if((r > seuil || r < 0-seuil) && (g > seuil || g < 0-seuil) && (b > seuil || b < 0-seuil)) {
					data[y][x].r = 170;
					data[y][x].g = 170;
					data[y][x].b = 170;
				}
			}
			if(y < y-3)
			{
				let r = ((rr - data[y+1][x].r) + (rr - data[y+2][x].r) + (gg - data[y+3][x].g)) / 3;
				let g = ((gg - data[y+1][x].g) + (gg - data[y+2][x].g) + (gg - data[y+3][x].g)) / 3;
				let b = ((bb - data[y+1][x].b) + (bb - data[y+2][x].b) + (bb - data[y+3][x].b)) / 3;

				if((r > seuil || r < 0-seuil) && (g > seuil || g < 0-seuil) && (b > seuil || b < 0-seuil)) {
					data[y][x].r = 0;
					data[y][x].g = 0;
					data[y][x].b = 0;
				}
			}else if(y < h-2){
				let r = ((rr - data[y+1][x].r) + (rr - data[y+2][x].r)) / 2;
				let g = ((gg - data[y+1][x].g) + (gg - data[y+2][x].g)) / 2;
				let b = ((bb - data[y+1][x].b) + (bb - data[y+2][x].b)) / 2;

				if((r > seuil || r < 0-seuil) && (g > seuil || g < 0-seuil) && (b > seuil || b < 0-seuil)) {
					data[y][x].r = 85;
					data[y][x].g = 85;
					data[y][x].b = 85;
				}
			}else if(y < h-1){
				let r = (rr - data[y+1][x].r);
				let g = (gg - data[y+1][x].g);
				let b = (bb - data[y+1][x].b);

				if((r > seuil || r < 0-seuil) && (g > seuil || g < 0-seuil) && (b > seuil || b < 0-seuil)) {
					data[y][x].r = 170;
					data[y][x].g = 170;
					data[y][x].b = 170;
				}
			}
		}
	}

	this.data = unconvertData(data);
	this.pack().pipe(fs.createWriteStream('out.png'));
});

function potDePeinture(seuil, data, w, h)
{
	let pixelsValid = [];
	for(let e = 0; e < h; e++)
	{
		pixelsValid[e] = [];
		for(let f = 0; f < w; f++)
		{
			pixelsValid[e][f] = false;
		}
	}

	let index = pixelsValid.aAindexOf(false);
	while(index != -1)
	{
		let retour = remplirCouleur(index.x, index.y, data, pixelsValid, seuil);
		data = retour.data;
		pixelsValid = retour.valid;

		index = pixelsValid.aAindexOf(false);
	}
	return data;
}

function remplirCouleur(x, y, data, valid, seuil)
{
	let retour = remplissage(x, y, data, seuil);

	let r = 0;
	let g = 0;
	let b = 0;

	for(let e = 0; e < retour.length; e++)
	{
		r += data[retour[e].y][retour[e].x].r;
		g += data[retour[e].y][retour[e].x].g;
		b += data[retour[e].y][retour[e].x].b;
	}

	r = Math.floor(r/retour.length);
	g = Math.floor(g/retour.length);
	b = Math.floor(b/retour.length);

	for(let e = 0; e < retour.length; e++)
	{
		data[retour[e].y][retour[e].x].r = r;
		data[retour[e].y][retour[e].x].g = g;
		data[retour[e].y][retour[e].x].b = b;
		valid[retour[e].y][retour[e].x] = true;
	}

	return {data:data, valid:valid};
}

function remplissage(x, y, pixels, seuil)
{
	let valid = [];
	for (let yy = 0; yy < pixels.length; yy++) {
		for (let xx = 0; xx < pixels[yy].length; xx++) {
			let r = pixels[yy][xx].r - pixels[y][x].r;
			let g = pixels[yy][xx].g - pixels[y][x].g;
			let b = pixels[yy][xx].b - pixels[y][x].b;

			if (r < seuil && r > 0-seuil && g < seuil && g > 0-seuil && b < seuil && b > 0-seuil) {
				valid.push({x: xx, y: yy});
			}
		}
	}
	return valid;
}

function convertData(data, w, h)
{
	let donnees = [];
	for(let y = 0; y < h; y++)
	{
		donnees[y] = [];
		for(let x = 0; x < w; x++)
		{
			let id = (y*w+x)*4;
			donnees[y][x] = {r: data[id],g: data[id+1],b: data[id+2]};
		}
	}

	return donnees;
}

function unconvertData(data)
{
	let donnees = [];
	for(y = 0, ny = data.length; y < ny; y++)
	{
		if(data[y] != null)
		{
			for(x = 0, nx = data[y].length; x < nx; x++)
			{
				if(data[y][x] != null)
				{
					donnees.push(data[y][x].r);
					donnees.push(data[y][x].g);
					donnees.push(data[y][x].b);
					donnees.push(255);
				}
			}
		}
	}

	return donnees;
}