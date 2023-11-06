var map = L.map('map',
    {
        zoom: 15
    }).setView([3.424967764829511, -76.49883270263673]);           ////SE INSERTA UN MAPA EN EL DIV "map" con coordenadas 3.42335,-76.52086


// seccion de mapa base-------------------------------------------------------

var mapabase = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        maxZoom: 20,

        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

var mapabase2 = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

mapabase.addTo(map);
new L.Control.GeoSearch({ provider: new L.GeoSearch.Provider.Esri() }).addTo(map);

//--------------------- fin seccion de mapa base-------------------------------------



L.control.scale({ position: 'bottomleft' }).addTo(map);


var icono = L.icon({
    iconSize: [35, 35],
    iconUrl: 'images/marcador.png'
});
var leyenda = L.control.layers({ mapabase, mapabase2 }).addTo(map);

let icono2 = L.icon({
    iconSize: [35, 35],
    iconUrl: 'images/geo-alt.svg'
});

let options = {
    icon: 'leaf',
    iconShape: 'marker'
};





let popup = L.popup();
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)//entiendo 
        .setContent("Coordenadas:  " + e.latlng.lat.toString() + "," + e.latlng.lng.toString())
        .openOn(map)
        //console.log("Coordenadas:  " + e.latlng.lat.toString() + "," + e.latlng.lng.toString())
        ;
}

map.on('click', onMapClick);// evento que ejecuta la funcion cuando se toca en el mapa

L.control.locate({
    setView: 'false', flyto: 'true', drawCircle: 'false', showCompass: 'true', drawMarker: 'false', keepCurrentZoomLevel: 'true', locateOptions: {
        enableHighAccuracy: true
    }
}).addTo(map);



//manejo de los puntos importados y su funcion para mostrar en el mapa de calor

function puntos(data) {
    function createMarker(feature, latlng) {
        return L.marker(latlng, { icon: icono });
    }

    // combierto la informacion en un elemento representable

    let marcador = L.geoJson(data, {
        pointToLayer: createMarker
    });
    leyenda.addOverlay(marcador, 'Marcador');
    console.log(marcador)
    for (let clave in marcador._layers) {
        marcador._layers[clave].bindTooltip(`punto numero: ${marcador._layers[clave]._leaflet_id}`, { permanent: false, className: 'labelstyle', direction: 'top', opacity: 1 }).openTooltip().addTo(map);
    }

    let heatP = marcador._layers;
    let pList = []
    for (let point in heatP) {
        pList.push(heatP[point]);
    }
    console.log(marcador.icon)
    L.easyButton('<img src="iconos/heatmap.png"  align="absmiddle" height="16px" >', function () {
        //esta forma de crear los puntos de calor me parece que se puede mejorar. propongo hacerlo en un proximo momento
        let heat = L.heatLayer([[pList[0]._latlng.lat, pList[0]._latlng.lng, 10]], { radius: 30 }).addTo(map);
        //este array añade los puntos creados en la parte de arrriba.
        for (let point of pList) {

            heat.addLatLng([point._latlng.lat, point._latlng.lng, 10], { radius: 25 });

        };
    }).addTo(map);
    //boton para cambiar icono de los puntos pero solo pude de la forma facil, la que quiero de cambiar el tipo de icono aun no sé como---------
    L.easyButton('<img src="iconos/colors.png" align="absmiddle" height="16px" >', function () {
        // Cambia el estilo del marcador al nuevo icono (icono2)
        marcador.createIcon('images/geo-alt.svg')
    }).addTo(map);

}
let datosImportados;
fetch('puntosForo.geojson')
    // primer promesa para determinar si hubo un error en la respuesta
    .then(response => {
        if (!response.ok) {
            throw new Error('Hubo un problema al realizar la solicitud.');
        }
        return response.json();
        // O response.text() si esperas otro tipo de respuesta
    })
    //promesa que toma y trabaja los datos
    .then(data => {
        datosImportados = data;
        puntos(data)


    })
    //respuesta que muestra el error
    .catch(error => {
        console.error('Error: ', error);
    })





//seccion para añadir servicios WMS de idesc
var comunas = L.tileLayer.wms('http://ws-idesc.cali.gov.co:8081/geoserver/wms?service=WMS&version=1.1.0',
    {
        layers: 'idesc:mc_comunas',
        format: 'image/png',
        transparent: true
    });
map.addLayer(comunas);
var equipamiento = L.tileLayer.wms('http://ws-idesc.cali.gov.co:8081/geoserver/wms?service=WMS&version=1.1.0',
    {
        layers: 'pot_2014:eqp_uco_salud',
        format: 'image/png',
        transparent: true
    });
map.addLayer(comunas);



// estas lineas permiten agregar estos elementos a la leyenda, se ingresa la variable a agregar y el nombre que queremos que tenga en la leyenda.

leyenda.addOverlay(comunas, 'Comunas');
leyenda.addOverlay(equipamiento, 'equipamiento de salud');


//añadir grilla
L.latlngGraticule({
    showLabel: true,
    opacity:0.7,
    color: 'black',
    zoomInterval: [
        {start: 12, end: 18, interval: 0.1}

    ]
}).addTo(map);
//geocodificador


