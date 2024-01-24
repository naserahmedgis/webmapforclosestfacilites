const myMap = L.map('map').setView([42.98157916228913, -81.22407248615869], 12);

const tileUrl2 = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution2 = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>| ESRI, Made by Naser Ahmed';
const tileLayer2 = L.tileLayer(tileUrl2, { attribution: attribution2 });
tileLayer2.addTo(myMap);

const tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png';
const attribution = '';
const tileLayer = L.tileLayer(tileUrl, { attribution: attribution });
tileLayer.addTo(myMap);

function generateList() {
    const ul = document.querySelector('.list');
    storeList.forEach((shop) => {
        const li = document.createElement('li');
        const div = document.createElement('div');
        const a = document.createElement('a');
        const p = document.createElement('p');
        a.addEventListener('click', () => {
            flyToStore(shop);
        });
        div.classList.add('shop-item');
        a.innerText = shop.properties.name;
        a.href = '#';
        p.innerText = shop.properties.address;

        div.appendChild(a);
        div.appendChild(p);
        li.appendChild(div);
        ul.appendChild(li);
    });
}

generateList();

function makePopupContent(shop) {
    return `
    <div>
        <h4>${shop.properties.name}</h4>
        <p>${shop.properties.address}</p>
        <div class="phone-number">
            <a href="tel:${shop.properties.phone}">${shop.properties.phone}</a>
        </div>
    </div>
  `;
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function highlightFeature(e) {
    const layer = e.target;
    info.update(layer.feature.properties);

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
}

function resetHighlight(e) {
    const layer = e.target;
    londonLayer.resetStyle(layer);
    info.update();
}

function zoomToFeature(e) {
    myMap.fitBounds(e.target.getBounds());
}

const myIcon = L.icon({
    iconUrl: 'mosque.png',
    iconSize: [40, 40]
});

const shopsLayer = L.geoJSON(storeList, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        const marker = L.marker(latlng, { icon: myIcon });
        marker.on('click', function() {
            flyToStore(feature);
        });
        return marker;
    }
});

shopsLayer.addTo(myMap);

const londonLayer = L.geoJson(londonData, {
    style: style,
    onEachFeature: onEachFeature
});

londonLayer.addTo(myMap);

function getColor(d) {
    return d > 15 ? '#ccece6' :
           d > 10 ? '#99d8c9' :
           d > 5 ? '#66c2a4' :
                    '#2ca25f';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.travel_tim),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.3
    };
}

const info = L.control();

info.onAdd = function (myMap) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>Drive time to the nearest mosque</h4>' + (props ?
        '<b>' + props.GIS_Featur + '</b><br />' + props.travel_tim + ' minutes'
        : 'Hover over a District');
};

info.addTo(myMap);

const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (myMap) {
    const div = L.DomUtil.create('div', 'info legend');
    const grades = [0, 5, 10, 15];
    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
};

legend.addTo(myMap);

function flyToStore(store) {
    const lat = store.geometry.coordinates[1];
    const lng = store.geometry.coordinates[0];
    myMap.flyTo([lat, lng], 14, {
        duration: 3
    });
    setTimeout(() => {
        L.popup({ closeButton: false, offset: L.point(0, -8) })
            .setLatLng([lat, lng])
            .setContent(makePopupContent(store))
            .openOn(myMap);
    }, 3000);
}

// Layer control
const baseLayers = {
    "ESRI Satellite": tileLayer,
    "OpenStreetMap": tileLayer2,
};

const overlays = {
    "Mosques": shopsLayer,
    "District Boundary": londonLayer,
};

L.control.layers(baseLayers, overlays).addTo(myMap);
