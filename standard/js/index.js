// Declare variables
var domColour;
var oppositeColour;
var currentDate = Date().toLocaleString();
var modifiedDate;
var source;

$(document).ready(function () {
    // Set default album artwork
    source = "./graphics/folder.jpg?modified=" + currentDate;
    $('#imgAlbumArtwork').attr("src", source);

    // Set background colour of body to dominate colour of image
    colour(source);

    // Get modified date of default album artwork
    modified();

    // Open in fullscreen on click
    document.addEventListener("click", openFullscreen);

    // Function to open screen fullscreen
    function openFullscreen() {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
    }

    // Function to get modified date of default album artwork
    async function modified() {
        var artFile = $('#imgAlbumArtwork').prop('src');
        await $.get(artFile).done(function (response, result, xhr) {
            // Populate modifiedDate
            modifiedDate = xhr.getResponseHeader('last-modified');
        });
    }

    // Check at set interval if artFile changes and update
    setInterval(checkArtFile, 500);

    // Function to check if album artwork has changed by checking the modified date of file
    function checkArtFile() {
        var checkDate;
        var nowDate = Date().toLocaleString();
        var checkFile;
        
        // Upload folder.jpg into hidden imgCheckArtwork
        $('#imgCheckArtwork').attr("src", "./graphics/folder.jpg?modified=" + nowDate);

        // Call check function to check if album artwork file has changed
        check();

        // Function to check if album artowkr has changed
        async function check() {
            // Get the src of hidden #imgCheckArtwork
            checkFile = $('#imgCheckArtwork').prop('src');
            // Get the modified date of checkFile
            try {
                await $.get(checkFile).done(function (response, result, xhr) {
                    checkDate = xhr.getResponseHeader('last-modified');
                    //console.log("xhr status :: " + xhr.status)

                    // If checkdate != modifiedDate reload the image into imgAlbumArtwork
                    if (checkDate != modifiedDate) {
                        var newDate = Date().toLocaleString();
                        source = "./graphics/folder.jpg?modified=" + newDate;
                        $('#imgAlbumArtwork').attr("src", source);
                        // Update modifedDate with the new modified date of the album artowrk file
                        modifiedDate = checkDate;
                        // Set background colour of body to dominate colour of image 
                        colour(source)

                        // Read pi_data.json file and populate artist, album, track span ids
                        $.getJSON("./data/pi_data.json", function (data) {
                            $('#artist').text(data.artist);
                            $('#album').text(data.album);
                            if (data.favourite == 1) {
                                $('#track').html(data.track + " " + data.playTime + " &#9829");
                            }
                            else {
                                $('#track').text(data.track + " " + data.playTime);
                            }                           
                        }).fail(function () {
                            console.log("Error reading pi_data.json file.");
                        });
                    }
                });
            } catch (err) {
                console.log("Error :: " + err)
            }
        }
    }
});

// Function to get dominate colour of Album Artwork and opposite colour for text
async function colour(filePath) {
    var imagePath = filePath
    //const { canvas, context } = await drawImage("./graphics/folder.jpg?modified=" + currentDate);
    const { canvas, context } = await drawImage(imagePath);
    const result = await calculateResult(canvas, context);
    domColour = result
    domColour = domColour.slice(0, -1)
    domColour = domColour + ",1)";
    // Set body background to domColour
    document.body.style.backgroundColor = domColour;
    // Get HEX value of domColour
    domColourHex = rgb2hex(document.body.style.backgroundColor);
    // Get opposite colour of domColour
    oppositeColour = invertColor(domColourHex, 1);
    // Set all text colour to oppositeColour
    document.body.style.color = oppositeColour;
};

// Function to convert RGB to HEX
const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

// Function to invert HEX colour
function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}

