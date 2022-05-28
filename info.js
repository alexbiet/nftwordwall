const fs = require('fs');

let count = 0;
let colors = ["Magenta", "Red", "Orange", "Lime", "Cyan", "White"];
let fonts = ["Kodchasan", "Press Start 2P", "Titan One", "Black Ops One", "Cabin Sketch", "Reggae One"];
let sizes = ["tiny", "smaller", "small", "medium", "large", "huge"];
let faces = ["SmirkyBlue", "HypedOrange", "AngryRed", "CoolGreen", "SusPurple", "CrazyYellow"];

for(let i = 0; i < 6; i++) {
    for(let x = 0; x < 6; x++) {
        for(let y = 0; y < 6; y++) {
                for(let z = 0; z <6; z++) {
    let metaData = {
        "image": `https://bafybeibcoepngugidjcroor2lnxc62sxkizozk3uimvoqk4hksok4ncx4i.ipfs.nftstorage.link/face-${z+1}.png`,
        "attributes": [
          {
            "trait_type": "Color",
            "value": `${colors[i]}`
          },
          {
            "trait_type": "Font",
            "value": `${fonts[x]}`
          },
          {
            "trait_type": "Size",
            "value": `${sizes[y]}`
          },
          {
            "trait_type": "Face",
            "value": `${faces[z]}`
          }
        ],
        "animation_url": "https://bafybeiaxijj6qmh5ulqergprjk3yfulnbe4c76mrjnznmsgeotzmra7ylu.ipfs.infura-ipfs.io/"
    };

    count++;
    let metaString = JSON.stringify(metaData);
    fs.writeFile(`wordWall${count}.json`, metaString, function(err) {
        if (err) {
            console.log(err);
        }
    });


}
}
}
}



