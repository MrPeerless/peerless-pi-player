// Declare variables
var domColour;
var oppositeColour;
var currentDate = Date().toLocaleString();
var modifiedDate ="1";
var defaultSource = "./graphics/default.jpg?modified=";
var jsonFile = "./data/pi_data.json";

// Check if online or offline
let online = window.navigator.onLine

// Add online/offline graphic to screen
if (online) {
    if ($('#imgOnline').hasClass("white")) {
        $('#imgOnline').attr("src", "./graphics/online.png");
    }
    else {
        $('#imgOnline').attr("src", "./graphics/online_black.png");
    } 
}
else {
    if ($('#imgOnline').hasClass("white")) {
        $('#imgOnline').attr("src", "./graphics/offline.png");
    }
    else {
        $('#imgOnline').attr("src", "./graphics/offline_black.png");
    }
}

// Event listner to detect when comes online
window.addEventListener("online", (event) => {
    if ($('#imgOnline').hasClass("white")) {
        $('#imgOnline').attr("src", "./graphics/online.png");
    }
    else {
        $('#imgOnline').attr("src", "./graphics/online_black.png");
    } 
});

// Event listner to detect when goes offline
window.addEventListener("offline", (event) => {
    if ($('#imgOnline').hasClass("white")) {
        $('#imgOnline').attr("src", "./graphics/offline.png");
    }
    else {
        $('#imgOnline').attr("src", "./graphics/offline_black.png");
    }
});

$(document).ready(function () {
    // Check screen width and if under 750px resize album image size
    var scnHeight = $(window).height();
    if (scnHeight < 1000) {
        $("#imgAlbumArtwork").css({ 'width': '640px' });
    };

    // Set default.jpg into imgAlbumArtwork
    defaultSource += currentDate;

    // Populate elements in page
    $('#imgAlbumArtwork').attr("src", defaultSource);
    $('#artist').text("Peerless-Pi-Player");
    $('#album').text("It's Music To Your Ears");
    $('#track').text("Version 0.1.1");

    // Set background colour of body to dominate colour of image
    colour(defaultSource);

    // When image loaded adjust text positioning
    $("#imgAlbumArtwork").one("load", function () {
        // Set top of artwork image
        var imgHeight = $("#imgAlbumArtwork").height();
        var imgTop = (scnHeight / 2) - 50;
        $("#divImageContainer").css({ top: imgTop });
        // Set top of text relative to image
        var txtTop = (imgHeight / 2) + imgTop
        $("#divTextContainer").css({ top: txtTop });
    })

    // Check at set timeout if album artwork has changed by checking the timeStamp in pi_data.json file
    var interval = 2000;

    function checkModifiedDate() {
        if (!$.active) {
            $.ajaxSetup({ cache: false });
            $.ajax({
                type: "GET",
                url: jsonFile,
                dataType: "json",
                success: function (data, textStatus, request) {
                    var lastModified = data.timeStamp;

                    // If modified date has changed update artwork and text
                    if (lastModified != modifiedDate) {
                        // Update modifedDate with the timeStamp from pi_data.json file
                        modifiedDate = lastModified;
                        // Populate track data
                        $('#artist').text(data.artist);
                        $('#album').text(data.album);
                        if (data.favourite == 1) {
                            $('#track').html(data.track + " " + data.playTime + " &#9829");
                        }
                        else {
                            $('#track').text(data.track + " " + data.playTime);
                        }
                        // Change album image
                        var folderSource = "./graphics/folder.jpg?modified=" + modifiedDate;
                        $('#imgAlbumArtwork').attr("src", folderSource);
                        // Set background colour of body to dominate colour of image
                        colour(folderSource)

                        // When image loaded adjust text positioning
                        $("#imgAlbumArtwork").one("load", function () {
                            // Set top of artwork image
                            var imgHeight = $("#imgAlbumArtwork").height();
                            var imgTop = (scnHeight / 2) - 50;
                            $("#divImageContainer").css({ top: imgTop });
                            // Set top of text relative to image
                            var txtTop = (imgHeight / 2) + imgTop
                            $("#divTextContainer").css({ top: txtTop });
                        })
                    }
                },
                complete: function (data) {
                    // Call next timeout
                    setTimeout(checkModifiedDate, interval);
                },
                error: function () {
                    console.log("Error checking last modified date")
                }
            });
        }
    }
    setTimeout(checkModifiedDate, interval);
});

// Function to get dominate colour of Album Artwork and opposite colour for text
async function colour(filePath) {
    var imagePath = filePath
    const { canvas, context } = await drawImage(imagePath);
    const result = await calculateResult(canvas, context);
    domColour = result
    domColour = domColour.slice(0, -1)
    domColour = domColour + ",1)";

    // Set body background to domColour
    document.body.style.backgroundColor = domColour;
    // Get HEX value of domColour
    var domColourHex = rgb2hex(document.body.style.backgroundColor)
    // Get opposite colour of domColour
    var oppositeColour = invertColor(domColourHex, 1);
    // Set all text colour to oppositeColour
    document.body.style.color = oppositeColour;

    // Switch class of on/offline graphic
    if (oppositeColour == "#FFFFFF") {       
        $('.black').toggleClass('black white');
    }
    else {
        $('.white').toggleClass('white black');
    }

    // Switch on/offline graphic depending on class
    if ($('#imgOnline').hasClass("white")) {
        $('#imgOnline').attr("src", "./graphics/online.png");
    }
    else {
        $('#imgOnline').attr("src", "./graphics/online_black.png");
    } 
};

// Function to convert RGB to HEX
const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

// Function to invert HEX colour
function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // Convert 3-digit hex to 6-digits.
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
    // Invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // Pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}

