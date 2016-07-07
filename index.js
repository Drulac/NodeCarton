const util = require('util');
const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream("img/"+"collines.png")
.pipe(new PNG({
	filterType: 4
}))
.on('parsed', function() {
	let donnees = this.data;
	let data = convertData(this.data, this.width, this.height);

	//traitement de l'image

	data = potDePeinture(15, data, this.width, this.height);

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