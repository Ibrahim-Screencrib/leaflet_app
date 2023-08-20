
var map = L.map('map').setView([37.8, -96], 4);

L.tileLayer('https://api.mapbox.com/styles/v1/ibdagib/cll3qgc9v004c01mffdx8hy21/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  accessToken: 'pk.eyJ1IjoiaWJkYWdpYiIsImEiOiJjbGwzcWU4ZTcwYzAzM3dwNHk2OXJuZnVtIn0.9InV1Th6nSvbh_qatFtF8Q'
}).addTo(map);

// Set popup options
let popupOptions = {
    maxWidth: 200,
    maxHeight: 150,
    autoPan: false 
}
var popup = L.popup(popupOptions); // create a popup variable
// Add scrolling 
popup.options.autoPan = false

// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>Film Tax Credit Rate</h4>' +  (props ?
        '<b>' + props.name + '</b><br />' + 'Min Rate: ' + props.min_tax_credit + '%' + '</b><br />' + 'Max Rate: ' + props.max_tax_credit + '%' : 'Hover over a state');
};

info.addTo(map);


// get color depending on population min_tax_credit value
function getColor(d) {
    return d > 60 ? '#e80c11' :
        d > 55  ? '#e80c11' :
        d > 45  ? '#720051' :
        d > 35  ? '#e4407b' :
        d > 25   ? '#f381b9' :
        d > 15   ? '#fec1dc' :
        d > 5   ? '#ffc5bc' : '#323232';
}

function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.max_tax_credit)
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
    
    // Add click handler for popup
    layer.on({
        click: function (e) {
            const min_tax_credit = feature.properties.min_tax_credit
            const max_tax_credit = feature.properties.max_tax_credit
            const eligible = feature.properties.eligible
            const links = feature.properties.links
            
            let html = "<div>";
            if (eligible !== undefined) {
            
              eligible.forEach(media => {
                html += `<span class='inline-blk'>${media}</span> `;
              });
            
            }
            html += "</div>";

            // Popup code
            popup.setLatLng(e.latlng)
            popup.setContent(`<h3>${feature.properties.name.toUpperCase()}</h3>
            Tax Credit: &middot; ${min_tax_credit}-${max_tax_credit}%
            <p>1 incentive available</p>
            ${html}
            <p ><a class="popup-link" href="${links}">Read more</a></p>`)
                .openOn(map);
        }
    });
}

function printCountryName(e) {
/* this function returns the name of the country */
    // check if feature exists
    if(e.layer.feature) {
    console.log(e.layer.feature.properties.name); 
    } else {
    console.log("Clicked element has no feature data");
    }

}

/* global statesData */
geojson = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

geojson.bringToFront(); // bring the geojson layer to the front

geojson.on('click', printCountryName); // call the printCountryName function when a user clicks on the geojson layer

map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    var grades = [0, 5, 15, 25, 35, 45, 55, 60];
    var labels = ["Tax Credit %"];
    var from, to;

    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
            '<i style="background:' + getColor(from + 1) + '"></i> ' +
            from + (to ? '&ndash;' + to + '%' : '%+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);

// Add credits control
L.controlCredits({
    imageurl: './ScreenCrib.png',
    imagealt: 'ScreenCrib',
    tooltip: 'Made by ScreenCrib',
    width: '45px',
    height: '45px',
    expandcontent: 'Interactive mapping<br/>by <a href="https://www.screencrib.com/" target="_blank">ScreenCrib</a>',
}).addTo(map);