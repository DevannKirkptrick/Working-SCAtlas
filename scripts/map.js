$(window).on('load', function() {
  var documentSettings = {};
  var markerColors = [];

  var polygonSettings = [];
  var polygonSheets = 1;
  var polygonsLegend;

  var completePoints = false;
  var completePolygons = false;
  var completePolylines = false;

  /**
   * Returns an Awesome marker with specified parameters
   */
  function createMarkerIcon(icon, prefix, markerColor, iconColor) {
    return L.AwesomeMarkers.icon({
      icon: icon,
      prefix: prefix,
      markerColor: markerColor,
      iconColor: iconColor
    });
  }


  /**
   * Sets the map view so that all markers are visible, or
   * to specified (lat, lon) and zoom if all three are specified
   */
  function centerAndZoomMap(points) {
    var lat = map.getCenter().lat, latSet = false;
    var lon = map.getCenter().lng, lonSet = false;
    var zoom = 12, zoomSet = false;
    var center;

    if (getSetting('_initLat') !== '') {
      lat = getSetting('_initLat');
      latSet = true;
    }

    if (getSetting('_initLon') !== '') {
      lon = getSetting('_initLon');
      lonSet = true;
    }

    if (getSetting('_initZoom') !== '') {
      zoom = parseInt(getSetting('_initZoom'));
      zoomSet = true;
    }

    if ((latSet && lonSet) || !points) {
      center = L.latLng(lat, lon);
    } else {
      center = points.getBounds().getCenter();
    }

    if (!zoomSet && points) {
      zoom = map.getBoundsZoom(points.getBounds());
    }

    map.setView(center, zoom);
  }


  /**
   * Given a collection of points, determines the layers based on 'Group'
   * column in the spreadsheet.
   */
  function determineLayers(Testlayers) {
    var layerNamesFromSpreadsheet = [];
    var layers = {};
    for (var i in Testlayers) {
      var pointLayerNameFromSpreadsheet = Testlayers[i].layernames;
      if (layerNamesFromSpreadsheet.indexOf(pointLayerNameFromSpreadsheet) === -1) {
        layerNamesFromSpreadsheet.push(pointLayerNameFromSpreadsheet);
      }
    }

    // if none of the points have named layers or if there was only one name, return no layers
    if (layerNamesFromSpreadsheet.length === 1) {
      layers = undefined;
    } else {
      for (var i in layerNamesFromSpreadsheet) {
        var layerNameFromSpreadsheet = layerNamesFromSpreadsheet[i];
        layers[layerNameFromSpreadsheet] = L.layerGroup();
        layers[layerNameFromSpreadsheet].addTo(map);
      }
    }
    return layers;
  }

  /**
   * Assigns points to appropriate layers and clusters them if needed
   */
  function mapPoints(points, layers) {
    var markerArray = [];
    // check that map has loaded before adding points to it?
    for (var i in points) {
      var point = points[i];

      // If icon contains '.', assume it's a path to a custom icon,
      // otherwise create a Font Awesome icon
      var iconSize = point['Custom Size'];
      var size = (iconSize.indexOf('x') > 0)
      ? [parseInt(iconSize.split('x')[0]), parseInt(iconSize.split('x')[1])]
      : [32, 32];

      var anchor = [size[0] / 2, size[1]];

      var icon = (point['Marker Icon'].indexOf('.') > 0)
        ? L.icon({
          iconUrl: point['Marker Icon'],
          iconSize: size,
          iconAnchor: anchor
        })
        : createMarkerIcon(point['Marker Icon'],
          'fa',
          point['Marker Color'].toLowerCase(),
          point['Icon Color']
        );

      if (point.Latitude !== '' && point.Longitude !== '') {
        var marker = L.marker([point.Latitude, point.Longitude], {icon: icon})
          .bindPopup("<b>" + point['Name'] + '</b><br>' +
          (point['Image'] ? ('<img src="' + point['Image'] + '"><br>') : '') +
          point['Description']);

        if (layers !== undefined && layers.length !== 1) {
          marker.addTo(layers[point.Group]);
        }

        markerArray.push(marker);
      }
    }

    var group = L.featureGroup(markerArray);
    var clusters = (getSetting('_markercluster') === 'on') ? true : false;

    // if layers.length === 0, add points to map instead of layer
    if (layers === undefined || layers.length === 0) {
      map.addLayer(
        clusters
        ? L.markerClusterGroup().addLayer(group).addTo(map)
        : group
      );
    } else {
      if (clusters) {
        // Add multilayer cluster support
        multilayerClusterSupport = L.markerClusterGroup.layerSupport();
        multilayerClusterSupport.addTo(map);

        for (i in layers) {
          multilayerClusterSupport.checkIn(layers[i]);
          layers[i].addTo(map);
        }
      }


      var overLayers = [
	[
		{
			name: "title",
			layer: layername
		},
		{
			group: "BC 37th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey37bc
				},
				{
					name: "Academies",
					layer: academy37bc
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre37bc
				},
				{
					name: "Bridges",
					layer: bridge37bc
				},
				{
					name: "Castles",
					layer: castle37bc
				},
				{
					name: "Churches",
					layer: church37bc
				},
				{
					name: "Forts",
					layer: fort37bc
				},
				{
					name: "Gates",
					layer: gate37bc
				},
				{
					name: "Monasteries",
					layer: monastery37bc
				},
				{
					name: "Mosques",
					layer: mosque37bc
				},
				{
					name: "Palaces",
					layer: palace37bc
				},
				{
					name: "Shrines",
					layer: shrine37bc
				},
				{
					name: "Temples",
					layer: temple37bc
				},
				{
					name: "Theatres",
					layer: theatre37bc
				},
				{
					name: "Tombs",
					layer: tomb37bc
				},
				{
					name: "Villages",
					layer: village37bc
				}
			]
		},
		{
			group: "BC 33rd CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey33bc
				},
				{
					name: "Academies",
					layer: academy33bc
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre33bc
				},
				{
					name: "Bridges",
					layer: bridge33bc
				},
				{
					name: "Castles",
					layer: castle33bc
				},
				{
					name: "Churches",
					layer: church33bc
				},
				{
					name: "Forts",
					layer: fort33bc
				},
				{
					name: "Gates",
					layer: gate33bc
				},
				{
					name: "Monasteries",
					layer: monastery33bc
				},
				{
					name: "Mosques",
					layer: mosque33bc
				},
				{
					name: "Palaces",
					layer: palace33bc
				},
				{
					name: "Shrines",
					layer: shrine33bc
				},
				{
					name: "Temples",
					layer: temple33bc
				},
				{
					name: "Theatres",
					layer: theatre33bc
				},
				{
					name: "Tombs",
					layer: tomb33bc
				},
				{
					name: "Villages",
					layer: village33bc
				}
			]
		},
		{
			group: "BC 31st CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey31bc
				},
				{
					name: "Academies",
					layer: academy31bc
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre31bc
				},
				{
					name: "Bridges",
					layer: bridge31bc
				},
				{
					name: "Castles",
					layer: castle31bc
				},
				{
					name: "Churches",
					layer: church31bc
				},
				{
					name: "Forts",
					layer: fort31bc
				},
				{
					name: "Gates",
					layer: gate31bc
				},
				{
					name: "Monasteries",
					layer: monastery31bc
				},
				{
					name: "Mosques",
					layer: mosque31bc
				},
				{
					name: "Palaces",
					layer: palace31bc
				},
				{
					name: "Shrines",
					layer: shrine31bc
				},
				{
					name: "Temples",
					layer: temple31bc
				},
				{
					name: "Theatres",
					layer: theatre31bc
				},
				{
					name: "Tombs",
					layer: tomb31bc
				},
				{
					name: "Villages",
					layer: village31bc
				}
			]
		},
		{
			group: "BC 13th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey13bc
				},
				{
					name: "Academies",
					layer: academy13bc
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre13bc
				},
				{
					name: "Bridges",
					layer: bridge13bc
				},
				{
					name: "Castles",
					layer: castle13bc
				},
				{
					name: "Churches",
					layer: church13bc
				},
				{
					name: "Forts",
					layer: fort13bc
				},
				{
					name: "Gates",
					layer: gate13bc
				},
				{
					name: "Monasteries",
					layer: monastery13bc
				},
				{
					name: "Mosques",
					layer: mosque13bc
				},
				{
					name: "Palaces",
					layer: palace13bc
				},
				{
					name: "Shrines",
					layer: shrine13bc
				},
				{
					name: "Temples",
					layer: temple13bc
				},
				{
					name: "Theatres",
					layer: theatre13bc
				},
				{
					name: "Tombs",
					layer: tomb13bc
				},
				{
					name: "Villages",
					layer: village13bc
				}
			]
		},
		{
			group: "BC 10th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey10bc
				},
				{
					name: "Academies",
					layer: academy10bc
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre10bc
				},
				{
					name: "Bridges",
					layer: bridge10bc
				},
				{
					name: "Castles",
					layer: castle10bc
				},
				{
					name: "Churches",
					layer: church10bc
				},
				{
					name: "Forts",
					layer: fort10bc
				},
				{
					name: "Gates",
					layer: gate10bc
				},
				{
					name: "Monasteries",
					layer: monastery10bc
				},
				{
					name: "Mosques",
					layer: mosque10bc
				},
				{
					name: "Palaces",
					layer: palace10bc
				},
				{
					name: "Shrines",
					layer: shrine10bc
				},
				{
					name: "Temples",
					layer: temple10bc
				},
				{
					name: "Theatres",
					layer: theatre10bc
				},
				{
					name: "Tombs",
					layer: tomb10bc
				},
				{
					name: "Villages",
					layer: village10bc
				}
			]
		},
		{
			group: "BC 8th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey8bc
				},
				{
					name: "Academies",
					layer: academy8bc
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre8bc
				},
				{
					name: "Bridges",
					layer: bridge8bc
				},
				{
					name: "Castles",
					layer: castle8bc
				},
				{
					name: "Churches",
					layer: church8bc
				},
				{
					name: "Forts",
					layer: fort8bc
				},
				{
					name: "Gates",
					layer: gate8bc
				},
				{
					name: "Monasteries",
					layer: monastery8bc
				},
				{
					name: "Mosques",
					layer: mosque8bc
				},
				{
					name: "Palaces",
					layer: palace8bc
				},
				{
					name: "Shrines",
					layer: shrine8bc
				},
				{
					name: "Temples",
					layer: temple8bc
				},
				{
					name: "Theatres",
					layer: theatre8bc
				},
				{
					name: "Tombs",
					layer: tomb8bc
				},
				{
					name: "Villages",
					layer: village8bc
				}
			]
		},
		{
			group: "BC 6th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey6bc
				},
				{
					name: "Academies",
					layer: academy6bc
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre6bc
				},
				{
					name: "Bridges",
					layer: bridge6bc
				},
				{
					name: "Castles",
					layer: castle6bc
				},
				{
					name: "Churches",
					layer: church6bc
				},
				{
					name: "Forts",
					layer: fort6bc
				},
				{
					name: "Gates",
					layer: gate6bc
				},
				{
					name: "Monasteries",
					layer: monastery6bc
				},
				{
					name: "Mosques",
					layer: mosque6bc
				},
				{
					name: "Palaces",
					layer: palace6bc
				},
				{
					name: "Shrines",
					layer: shrine6bc
				},
				{
					name: "Temples",
					layer: temple6bc
				},
				{
					name: "Theatres",
					layer: theatre6bc
				},
				{
					name: "Tombs",
					layer: tomb6bc
				},
				{
					name: "Villages",
					layer: village6bc
				}
			]
		},
		{
			group: "BC 5th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey5bc
				},
				{
					name: "Academies",
					layer: academy5bc
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre5bc
				},
				{
					name: "Bridges",
					layer: bridge5bc
				},
				{
					name: "Castles",
					layer: castle5bc
				},
				{
					name: "Churches",
					layer: church5bc
				},
				{
					name: "Forts",
					layer: fort5bc
				},
				{
					name: "Gates",
					layer: gate5bc
				},
				{
					name: "Monasteries",
					layer: monastery5bc
				},
				{
					name: "Mosques",
					layer: mosque5bc
				},
				{
					name: "Palaces",
					layer: palace5bc
				},
				{
					name: "Shrines",
					layer: shrine5bc
				},
				{
					name: "Temples",
					layer: temple5bc
				},
				{
					name: "Theatres",
					layer: theatre5bc
				},
				{
					name: "Tombs",
					layer: tomb5bc
				},
				{
					name: "Villages",
					layer: village5bc
				}
			]
		},
		{
			group: "BC 2nd CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey2bc
				},
				{
					name: "Academies",
					layer: academy2bc
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre2bc
				},
				{
					name: "Bridges",
					layer: bridge2bc
				},
				{
					name: "Castles",
					layer: castle2bc
				},
				{
					name: "Churches",
					layer: church2bc
				},
				{
					name: "Forts",
					layer: fort2bc
				},
				{
					name: "Gates",
					layer: gate2bc
				},
				{
					name: "Monasteries",
					layer: monastery2bc
				},
				{
					name: "Mosques",
					layer: mosque2bc
				},
				{
					name: "Palaces",
					layer: palace2bc
				},
				{
					name: "Shrines",
					layer: shrine2bc
				},
				{
					name: "Temples",
					layer: temple2bc
				},
				{
					name: "Theatres",
					layer: theatre2bc
				},
				{
					name: "Tombs",
					layer: tomb2bc
				},
				{
					name: "Villages",
					layer: village2bc
				}
			]
		},
		{
			group: "1st CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey1ad
				},
				{
					name: "Academies",
					layer: academy1ad
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre1ad
				},
				{
					name: "Bridges",
					layer: bridge1ad
				},
				{
					name: "Castles",
					layer: castle1ad
				},
				{
					name: "Churches",
					layer: church1ad
				},
				{
					name: "Forts",
					layer: fort1ad
				},
				{
					name: "Gates",
					layer: gate1ad
				},
				{
					name: "Monasteries",
					layer: monastery1ad
				},
				{
					name: "Mosques",
					layer: mosque1ad
				},
				{
					name: "Palaces",
					layer: palace1ad
				},
				{
					name: "Shrines",
					layer: shrine1ad
				},
				{
					name: "Temples",
					layer: temple1ad
				},
				{
					name: "Theatres",
					layer: theatre1ad
				},
				{
					name: "Tombs",
					layer: tomb1ad
				},
				{
					name: "Villages",
					layer: village1ad
				}
			]
		},
		{
			group: "2nd CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey2ad
				},
				{
					name: "Academies",
					layer: academy2ad
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre2ad
				},
				{
					name: "Bridges",
					layer: bridge2ad
				},
				{
					name: "Castles",
					layer: castle2ad
				},
				{
					name: "Churches",
					layer: church2ad
				},
				{
					name: "Forts",
					layer: fort2ad
				},
				{
					name: "Gates",
					layer: gate2ad
				},
				{
					name: "Monasteries",
					layer: monastery2ad
				},
				{
					name: "Mosques",
					layer: mosque2ad
				},
				{
					name: "Palaces",
					layer: palace2ad
				},
				{
					name: "Shrines",
					layer: shrine2ad
				},
				{
					name: "Temples",
					layer: temple2ad
				},
				{
					name: "Theatres",
					layer: theatre2ad
				},
				{
					name: "Tombs",
					layer: tomb2ad
				},
				{
					name: "Villages",
					layer: village2ad
				}
			]
		},
		{
			group: "3rd CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey3ad
				},
				{
					name: "Academies",
					layer: academy3ad
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre3ad
				},
				{
					name: "Bridges",
					layer: bridge3ad
				},
				{
					name: "Castles",
					layer: castle3ad
				},
				{
					name: "Churches",
					layer: church3ad
				},
				{
					name: "Forts",
					layer: fort3ad
				},
				{
					name: "Gates",
					layer: gate3ad
				},
				{
					name: "Monasteries",
					layer: monastery3ad
				},
				{
					name: "Mosques",
					layer: mosque3ad
				},
				{
					name: "Palaces",
					layer: palace3ad
				},
				{
					name: "Shrines",
					layer: shrine3ad
				},
				{
					name: "Temples",
					layer: temple3ad
				},
				{
					name: "Theatres",
					layer: theatre3ad
				},
				{
					name: "Tombs",
					layer: tomb3ad
				},
				{
					name: "Villages",
					layer: village3ad
				}
			]
		},
		{
			group: "4th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey4ad
				},
				{
					name: "Academies",
					layer: academy4ad
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre4ad
				},
				{
					name: "Bridges",
					layer: bridge4ad
				},
				{
					name: "Castles",
					layer: castle4ad
				},
				{
					name: "Churches",
					layer: church4ad
				},
				{
					name: "Forts",
					layer: fort4ad
				},
				{
					name: "Gates",
					layer: gate4ad
				},
				{
					name: "Monasteries",
					layer: monastery4ad
				},
				{
					name: "Mosques",
					layer: mosque4ad
				},
				{
					name: "Palaces",
					layer: palace4ad
				},
				{
					name: "Shrines",
					layer: shrine4ad
				},
				{
					name: "Temples",
					layer: temple4ad
				},
				{
					name: "Theatres",
					layer: theatre4ad
				},
				{
					name: "Tombs",
					layer: tomb4ad
				},
				{
					name: "Villages",
					layer: village4ad
				}
			]
		},
		{
			group: "5th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey5ad
				},
				{
					name: "Academies",
					layer: academy5ad
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre5ad
				},
				{
					name: "Bridges",
					layer: bridge5ad
				},
				{
					name: "Castles",
					layer: castle5ad
				},
				{
					name: "Churches",
					layer: church5ad
				},
				{
					name: "Forts",
					layer: fort5ad
				},
				{
					name: "Gates",
					layer: gate5ad
				},
				{
					name: "Monasteries",
					layer: monastery5ad
				},
				{
					name: "Mosques",
					layer: mosque5ad
				},
				{
					name: "Palaces",
					layer: palace5ad
				},
				{
					name: "Shrines",
					layer: shrine5ad
				},
				{
					name: "Temples",
					layer: temple5ad
				},
				{
					name: "Theatres",
					layer: theatre5ad
				},
				{
					name: "Tombs",
					layer: tomb5ad
				},
				{
					name: "Villages",
					layer: village5ad
				}
			]
		},
		{
			group: "6th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey6ad
				},
				{
					name: "Academies",
					layer: academy6ad
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre6ad
				},
				{
					name: "Bridges",
					layer: bridge6ad
				},
				{
					name: "Castles",
					layer: castle6ad
				},
				{
					name: "Churches",
					layer: church6ad
				},
				{
					name: "Forts",
					layer: fort6ad
				},
				{
					name: "Gates",
					layer: gate6ad
				},
				{
					name: "Monasteries",
					layer: monastery6ad
				},
				{
					name: "Mosques",
					layer: mosque6ad
				},
				{
					name: "Palaces",
					layer: palace6ad
				},
				{
					name: "Shrines",
					layer: shrine6ad
				},
				{
					name: "Temples",
					layer: temple6ad
				},
				{
					name: "Theatres",
					layer: theatre6ad
				},
				{
					name: "Tombs",
					layer: tomb6ad
				},
				{
					name: "Villages",
					layer: village6ad
				}
			]
		},
		{
			group: "7th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey7ad
				},
				{
					name: "Academies",
					layer: academy7ad
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre7ad
				},
				{
					name: "Bridges",
					layer: bridge7ad
				},
				{
					name: "Castles",
					layer: castle7ad
				},
				{
					name: "Churches",
					layer: church7ad
				},
				{
					name: "Forts",
					layer: fort7ad
				},
				{
					name: "Gates",
					layer: gate7ad
				},
				{
					name: "Monasteries",
					layer: monastery7ad
				},
				{
					name: "Mosques",
					layer: mosque7ad
				},
				{
					name: "Palaces",
					layer: palace7ad
				},
				{
					name: "Shrines",
					layer: shrine7ad
				},
				{
					name: "Temples",
					layer: temple7ad
				},
				{
					name: "Theatres",
					layer: theatre7ad
				},
				{
					name: "Tombs",
					layer: tomb7ad
				},
				{
					name: "Villages",
					layer: village7ad
				}
			]
		},
		{
			group: "8th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey8ad
				},
				{
					name: "Academies",
					layer: academy8ad
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre8ad
				},
				{
					name: "Bridges",
					layer: bridge8ad
				},
				{
					name: "Castles",
					layer: castle8ad
				},
				{
					name: "Churches",
					layer: church8ad
				},
				{
					name: "Forts",
					layer: fort8ad
				},
				{
					name: "Gates",
					layer: gate8ad
				},
				{
					name: "Monasteries",
					layer: monastery8ad
				},
				{
					name: "Mosques",
					layer: mosque8ad
				},
				{
					name: "Palaces",
					layer: palace8ad
				},
				{
					name: "Shrines",
					layer: shrine8ad
				},
				{
					name: "Temples",
					layer: temple8ad
				},
				{
					name: "Theatres",
					layer: theatre8ad
				},
				{
					name: "Tombs",
					layer: tomb8ad
				},
				{
					name: "Villages",
					layer: village8ad
				}
			]
		},
				{
			group: "9th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey9ad
				},
				{
					name: "Academies",
					layer: academy9ad
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre9ad
				},
				{
					name: "Bridges",
					layer: bridge9ad
				},
				{
					name: "Castles",
					layer: castle9ad
				},
				{
					name: "Churches",
					layer: church9ad
				},
				{
					name: "Forts",
					layer: fort9ad
				},
				{
					name: "Gates",
					layer: gate9ad
				},
				{
					name: "Monasteries",
					layer: monastery9ad
				},
				{
					name: "Mosques",
					layer: mosque9ad
				},
				{
					name: "Palaces",
					layer: palace9ad
				},
				{
					name: "Shrines",
					layer: shrine9ad
				},
				{
					name: "Temples",
					layer: temple9ad
				},
				{
					name: "Theatres",
					layer: theatre9ad
				},
				{
					name: "Tombs",
					layer: tomb9ad
				},
				{
					name: "Villages",
					layer: village9ad
				}
			]
		},
				{
			group: "10th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey10ad
				},
				{
					name: "Academies",
					layer: academy10ad
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre10ad
				},
				{
					name: "Bridges",
					layer: bridge10ad
				},
				{
					name: "Castles",
					layer: castle10ad
				},
				{
					name: "Churches",
					layer: church10ad
				},
				{
					name: "Forts",
					layer: fort10ad
				},
				{
					name: "Gates",
					layer: gate10ad
				},
				{
					name: "Monasteries",
					layer: monastery10ad
				},
				{
					name: "Mosques",
					layer: mosque10ad
				},
				{
					name: "Palaces",
					layer: palace10ad
				},
				{
					name: "Shrines",
					layer: shrine10ad
				},
				{
					name: "Temples",
					layer: temple10ad
				},
				{
					name: "Theatres",
					layer: theatre10ad
				},
				{
					name: "Tombs",
					layer: tomb10ad
				},
				{
					name: "Villages",
					layer: village10ad
				}
			]
		},
				{
			group: "11th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey11ad
				},
				{
					name: "Academies",
					layer: academy11ad
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre11ad
				},
				{
					name: "Bridges",
					layer: bridge11ad
				},
				{
					name: "Castles",
					layer: castle11ad
				},
				{
					name: "Churches",
					layer: church11ad
				},
				{
					name: "Forts",
					layer: fort11ad
				},
				{
					name: "Gates",
					layer: gate11ad
				},
				{
					name: "Monasteries",
					layer: monastery11ad
				},
				{
					name: "Mosques",
					layer: mosque11ad
				},
				{
					name: "Palaces",
					layer: palace11ad
				},
				{
					name: "Shrines",
					layer: shrine11ad
				},
				{
					name: "Temples",
					layer: temple11ad
				},
				{
					name: "Theatres",
					layer: theatre11ad
				},
				{
					name: "Tombs",
					layer: tomb11ad
				},
				{
					name: "Villages",
					layer: village11ad
				}
			]
		},
				{
			group: "12th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey12ad
				},
				{
					name: "Academies",
					layer: academy12ad
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre12ad
				},
				{
					name: "Bridges",
					layer: bridge12ad
				},
				{
					name: "Castles",
					layer: castle12ad
				},
				{
					name: "Churches",
					layer: church12ad
				},
				{
					name: "Forts",
					layer: fort12ad
				},
				{
					name: "Gates",
					layer: gate12ad
				},
				{
					name: "Monasteries",
					layer: monastery12ad
				},
				{
					name: "Mosques",
					layer: mosque12ad
				},
				{
					name: "Palaces",
					layer: palace12ad
				},
				{
					name: "Shrines",
					layer: shrine12ad
				},
				{
					name: "Temples",
					layer: temple12ad
				},
				{
					name: "Theatres",
					layer: theatre12ad
				},
				{
					name: "Tombs",
					layer: tomb12ad
				},
				{
					name: "Villages",
					layer: village12ad
				}
			]
		},
				{
			group: "13th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey13ad
				},
				{
					name: "Academies",
					layer: academy13ad
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre13ad
				},
				{
					name: "Bridges",
					layer: bridge13ad
				},
				{
					name: "Castles",
					layer: castle13ad
				},
				{
					name: "Churches",
					layer: church13ad
				},
				{
					name: "Forts",
					layer: fort13ad
				},
				{
					name: "Gates",
					layer: gate13ad
				},
				{
					name: "Monasteries",
					layer: monastery13ad
				},
				{
					name: "Mosques",
					layer: mosque13ad
				},
				{
					name: "Palaces",
					layer: palace13ad
				},
				{
					name: "Shrines",
					layer: shrine13ad
				},
				{
					name: "Temples",
					layer: temple13ad
				},
				{
					name: "Theatres",
					layer: theatre13ad
				},
				{
					name: "Tombs",
					layer: tomb13ad
				},
				{
					name: "Villages",
					layer: village13ad
				}
			]
		},
				{
			group: "14th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey14ad
				},
				{
					name: "Academies",
					layer: academy14ad
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre14ad
				},
				{
					name: "Bridges",
					layer: bridge14ad
				},
				{
					name: "Castles",
					layer: castle14ad
				},
				{
					name: "Churches",
					layer: church14ad
				},
				{
					name: "Forts",
					layer: fort14ad
				},
				{
					name: "Gates",
					layer: gate14ad
				},
				{
					name: "Monasteries",
					layer: monastery14ad
				},
				{
					name: "Mosques",
					layer: mosque14ad
				},
				{
					name: "Palaces",
					layer: palace14ad
				},
				{
					name: "Shrines",
					layer: shrine14ad
				},
				{
					name: "Temples",
					layer: temple14ad
				},
				{
					name: "Theatres",
					layer: theatre14ad
				},
				{
					name: "Tombs",
					layer: tomb14ad
				},
				{
					name: "Villages",
					layer: village14ad
				}
			]
		},
				{
			group: "15th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey15ad
				},
				{
					name: "Academies",
					layer: academy15ad
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre15ad
				},
				{
					name: "Bridges",
					layer: bridge15ad
				},
				{
					name: "Castles",
					layer: castle15ad
				},
				{
					name: "Churches",
					layer: church15ad
				},
				{
					name: "Forts",
					layer: fort15ad
				},
				{
					name: "Gates",
					layer: gate15ad
				},
				{
					name: "Monasteries",
					layer: monastery15ad
				},
				{
					name: "Mosques",
					layer: mosque15ad
				},
				{
					name: "Palaces",
					layer: palace15ad
				},
				{
					name: "Shrines",
					layer: shrine15ad
				},
				{
					name: "Temples",
					layer: temple15ad
				},
				{
					name: "Theatres",
					layer: theatre15ad
				},
				{
					name: "Tombs",
					layer: tomb15ad
				},
				{
					name: "Villages",
					layer: village15ad
				}
			]
		},
				{
			group: "16th CE",
			collapsed: true,
			layers: [
				{
					name: "Abbeys",
					layer: abbey16ad
				},
				{
					name: "Academies",
					layer: academy16ad
				},
				{
					name: "Amphitheatres",
					layer: amphitheatre16ad
				},
				{
					name: "Bridges",
					layer: bridge16ad
				},
				{
					name: "Castles",
					layer: castle16ad
				},
				{
					name: "Churches",
					layer: church16ad
				},
				{
					name: "Forts",
					layer: fort16ad
				},
				{
					name: "Gates",
					layer: gate16ad
				},
				{
					name: "Monasteries",
					layer: monastery16ad
				},
				{
					name: "Mosques",
					layer: mosque16ad
				},
				{
					name: "Palaces",
					layer: palace16ad
				},
				{
					name: "Shrines",
					layer: shrine16ad
				},
				{
					name: "Temples",
					layer: temple16ad
				},
				{
					name: "Theatres",
					layer: theatre16ad
				},
				{
					name: "Tombs",
					layer: tomb16ad
				},
				{
					name: "Villages",
					layer: village16ad
				}
			]
		}
	]
];
      
      var pointsLegend = L.Control.PanelLayers(null, overLayers, {
	collapsibleGroups: true,
	collapsed: false
});   
        pointsLegend.addTo(map);
    }


    var displayTable = getSetting('_displayTable') == 'on' ? true : false;

    // Display table with active points if specified
    var columns = getSetting('_tableColumns').split(',')
                  .map(Function.prototype.call, String.prototype.trim);

    if (displayTable && columns.length > 1) {
      tableHeight = trySetting('_tableHeight', 40);
      if (tableHeight < 10 || tableHeight > 90) {tableHeight = 40;}
      $('#map').css('height', (100 - tableHeight) + 'vh');
      map.invalidateSize();

      // Set background (and text) color of the table header
      var colors = getSetting('_tableHeaderColor').split(',');
      if (colors[0] != '') {
        $('table.display').css('background-color', colors[0]);
        if (colors.length >= 2) {
          $('table.display').css('color', colors[1]);
        }
      }

      // Update table every time the map is moved/zoomed or point layers are toggled
      map.on('moveend', updateTable);
      map.on('layeradd', updateTable);
      map.on('layerremove', updateTable);

      // Clear table data and add only visible markers to it
      function updateTable() {
        var pointsVisible = [];
        for (i in points) {
          if (map.hasLayer(layers[points[i].Group]) &&
              map.getBounds().contains(L.latLng(points[i].Latitude, points[i].Longitude))) {
            pointsVisible.push(points[i]);
          }
        }

        tableData = pointsToTableData(pointsVisible);

        table.clear();
        table.rows.add(tableData);
        table.draw();
      }

      // Convert Leaflet marker objects into DataTable array
      function pointsToTableData(ms) {
        var data = [];
        for (i in ms) {
          var a = [];
          for (j in columns) {
            a.push(ms[i][columns[j]]);
          }
          data.push(a);
        }
        return data;
      }

      // Transform columns array into array of title objects
      function generateColumnsArray() {
        var c = [];
        for (i in columns) {
          c.push({title: columns[i]});
        }
        return c;
      }

      // Initialize DataTable
      var table = $('#maptable').DataTable({
        paging: false,
        scrollCollapse: true,
        scrollY: 'calc(' + tableHeight + 'vh - 40px)',
        info: false,
        searching: false,
        columns: generateColumnsArray(),
      });
    }

    completePoints = true;
    return group;
  }

  var polygon = 0; // current active polygon
  var layer = 0; // number representing current layer among layers in legend

  /**
   * Store bucket info for Polygons
   */
  allDivisors = [];
  allColors = [];
  allIsNumerical = [];
  allGeojsons = [];
  allPolygonLegends = [];
  allPolygonLayers = [];
  allPopupProperties = [];
  allTextLabelsLayers = [];
  allTextLabels = [];

  function loadAllGeojsons(p) {
    if (p < polygonSettings.length && getPolygonSetting(p, '_polygonsGeojsonURL')) {
      // Pre-process popup properties to be used in onEachFeature below
      polygon = p;
      var popupProperties = getPolygonSetting(p, '_popupProp').split(';');
      for (i in popupProperties) { popupProperties[i] = popupProperties[i].split(','); }
      allPopupProperties.push(popupProperties);

      // Load geojson
      $.getJSON(getPolygonSetting(p, '_polygonsGeojsonURL'), function(data) {
          geoJsonLayer = L.geoJson(data, {
            onEachFeature: onEachFeature,
            pointToLayer: function(feature, latlng) {
              return L.circleMarker(latlng, {
                className: 'geojson-point-marker'
              });
            }
          });
          allGeojsons.push(geoJsonLayer);
          loadAllGeojsons(p+1);
      });
    } else {
      processAllPolygons();
    }
  }

  function processAllPolygons() {
    var p = 0;  // polygon sheet

    while (p < polygonSettings.length && getPolygonSetting(p, '_polygonsGeojsonURL')) {
      isNumerical = [];
      divisors = [];
      colors = [];

      polygonLayers = getPolygonSetting(p, '_polygonLayers').split(';');
      for (i in polygonLayers) { polygonLayers[i] = polygonLayers[i].split(','); }

      divisors = getPolygonSetting(p, '_bucketDivisors').split(';');

      if (divisors.length != polygonLayers.length) {
        alert('Error in Polygons: The number of sets of divisors has to match the number of properties');
        return;
      }

      colors = getPolygonSetting(p, '_bucketColors').split(';');
      for (i = 0; i < divisors.length; i++) {
        divisors[i] = divisors[i].split(',');
        for (j = 0; j < divisors[i].length; j++) {
          divisors[i][j] = divisors[i][j].trim();
        }
        if (!colors[i]) {
          colors[i] = [];
        } else {
          colors[i] = colors[i].split(',');
        }
      }

      for (i = 0; i < divisors.length; i++) {
        if (divisors[i].length == 0) {
          alert('Error in Polygons: The number of divisors should be > 0');
          return; // Stop here
        } else if (colors[i].length == 0) {
          // If no colors specified, generate the colors
          colors[i] = palette(tryPolygonSetting(p, '_colorScheme', 'tol-sq'), divisors[i].length);
          for (j = 0; j < colors[i].length; j++) {
            colors[i][j] = '#' + colors[i][j].trim();
          }
        } else if (divisors[i].length != colors[i].length) {
          alert('Error in Polygons: The number of divisors should match the number of colors');
          return; // Stop here
        }
      }

      // For each set of divisors, decide whether textual or numerical
      for (i = 0; i < divisors.length; i++) {
        if (!isNaN(parseFloat(divisors[i][0].trim()))) {
          isNumerical[i] = true;
          for (j = 0; j < divisors[i].length; j++) {
            divisors[i][j] = parseFloat(divisors[i][j].trim());
          }
        } else {
          isNumerical[i] = false;
        }
      }

      allDivisors.push(divisors);
      allColors.push(colors);
      allIsNumerical.push(isNumerical);
      allPolygonLayers.push(polygonLayers);

      var legendPos = tryPolygonSetting(p, '_polygonsLegendPosition', 'off');
      polygonsLegend = L.control({position: (legendPos == 'off') ? 'topleft' : legendPos});

      polygonsLegend.onAdd = function(map) {
        var content = '<h6 class="pointer">' + getPolygonSetting(p, '_polygonsLegendTitle') + '</h6>';
        content += '<form>';

        for (i in polygonLayers) {
          var layer = polygonLayers[i][1]
            ? polygonLayers[i][1].trim()
            : polygonLayers[i][0].trim();

            layer = (layer == '') ? 'On' : layer;

          content += '<label><input type="radio" name="prop" value="' + p + ';' + i + '"> ';
          content += layer + '</label><br>';
        }

        content += '<label><input type="radio" name="prop" value="' + p + ';-1"> Off</label></form><div class="polygons-legend-scale">';

        var div = L.DomUtil.create('div', 'leaflet-control leaflet-control-custom leaflet-bar ladder polygons-legend' + p);
        div.innerHTML = content;
        div.innerHTML += '</div>';
        return div;
      };

      polygonsLegend.addTo(map);
      if (getPolygonSetting(p, '_polygonsLegendPosition') == 'off') {
        $('.polygons-legend' + p).css('display', 'none');
      }
      allPolygonLegends.push(polygonsLegend);

      p++;
    }

    // Generate polygon labels layers
    for (i in allTextLabels) {
      var g = L.featureGroup(allTextLabels[i]);
      allTextLabelsLayers.push(g);
    }

    // This is triggered when user changes the radio button
    $('.ladder input:radio[name="prop"]').change(function() {
      polygon = parseInt($(this).val().split(';')[0]);
      layer = parseInt($(this).val().split(';')[1]);

      if (layer == -1) {
        $('.polygons-legend' + polygon).find('.polygons-legend-scale').hide();
        if (map.hasLayer(allGeojsons[polygon])) {
          map.removeLayer(allGeojsons[polygon]);
          if (map.hasLayer(allTextLabelsLayers[polygon])) {
            map.removeLayer(allTextLabelsLayers[polygon]);
          }
        }
      } else {
        updatePolygons();
      }
    });

    for (t = 0; t < p; t++) {
      if (getPolygonSetting(t, '_polygonShowOnStart') == 'on') {
        $('.ladder input:radio[name="prop"][value="' + t + ';0"]').click();
      } else {
        $('.ladder input:radio[name="prop"][value="' + t + ';-1"]').click();
      }
    }

    $('.polygons-legend-merged h6').eq(0).click().click();

    completePolygons = true;
  }


  function updatePolygons() {
    p = polygon;
    z = layer;
    allGeojsons[p].setStyle(polygonStyle);

    if (!map.hasLayer(allGeojsons[p])) {
      map.addLayer(allGeojsons[p]);
      if (!map.hasLayer(allTextLabelsLayers[p]) && allTextLabelsLayers[p]) {
        map.addLayer(allTextLabelsLayers[p]);
      }
    }

    doubleClickPolylines();

    // If no scale exists: hide the legend. Ugly temporary fix.
    // Can't use 'hide' because it is later toggled
    if (allDivisors[p][z] == '') {
      $('.polygons-legend' + p).find('.polygons-legend-scale').css({'margin': '0px', 'padding': '0px', 'border': '0px solid'});
      return;
    }

    $('.polygons-legend' + p + ' .polygons-legend-scale').html('');

    var labels = [];
    var from, to, isNum, color;

    for (var i = 0; i < allDivisors[p][z].length; i++) {
      isNum = allIsNumerical[p][z];
      from = allDivisors[p][z][i];
      to = allDivisors[p][z][i+1];

      color = getColor(from);
      from = from ? comma(from) : from;
      to = to ? comma(to) : to;

      labels.push(
        '<i style="background:' + color + '; opacity: '
        + tryPolygonSetting(p, '_colorOpacity', '0.7') + '"></i> ' +
        from + ((to && isNum) ? '&ndash;' + to : (isNum) ? '+' : ''));
    }

    $('.polygons-legend' + p + ' .polygons-legend-scale').html(labels.join('<br>'));
    $('.polygons-legend' + p + ' .polygons-legend-scale').show();

    togglePolygonLabels();
  }

  /**
   * Generates CSS for each geojson feature
   */
  function polygonStyle(feature) {
    var value = feature.properties[allPolygonLayers[polygon][layer][0].trim()];

    var style = {};

    if (feature.geometry.type == 'Point') {
      return {  // Point style
        radius: 4,
        weight: 1,
        opacity: 1,
        color: getColor(value),
        fillOpacity: tryPolygonSetting(polygon, '_colorOpacity', '0.7'),
        fillColor: 'white'
      }
    } else {
      return {  // Polygon and Polyline style
        weight: 2,
        opacity: 1,
        color: tryPolygonSetting(polygon, '_outlineColor', 'white'),
        dashArray: '3',
        fillOpacity: tryPolygonSetting(polygon, '_colorOpacity', '0.7'),
        fillColor: getColor(value)
      }
    }
  }

  /**
   * Returns a color for polygon property with value d
   */
  function getColor(d) {
    var num = allIsNumerical[polygon][layer];
    var col = allColors[polygon][layer];
    var div = allDivisors[polygon][layer];

    var i;

    if (num) {
      i = col.length - 1;
      while (d < div[i]) i -= 1;
    } else {
      for (i = 0; i < col.length - 1; i++) {
        if (d == div[i]) break;
      }
    }

    if (!col[i]) {i = 0}
    return col[i];
  }


  /**
   * Generates popup windows for every polygon
   */
  function onEachFeature(feature, layer) {
    // Do not bind popups if 1. no popup properties specified and 2. display
    // images is turned off.
    if (getPolygonSetting(polygon, '_popupProp') == ''
     && getPolygonSetting(polygon, '_polygonDisplayImages') == 'off') return;

    var info = '';
    props = allPopupProperties[polygon];

    for (i in props) {
      if (props[i] == '') { continue; }

      info += props[i][1]
        ? props[i][1].trim()
        : props[i][0].trim();

      var val = feature.properties[props[i][0].trim()];
      info += ': <b>' + (val ? comma(val) : val) + '</b><br>';
    }

    if (getPolygonSetting(polygon, '_polygonDisplayImages') == 'on') {
      if (feature.properties['img']) {
        info += '<img src="' + feature.properties['img'] + '">';
      }
    }

    layer.bindPopup(info);

    // Add polygon label if needed
    if (getPolygonSetting(polygon, '_polygonLabel') != '') {
      var myTextLabel = L.marker(polylabel(layer.feature.geometry.coordinates, 1.0).reverse(), {
        icon: L.divIcon({
          className: 'polygon-label' + polygon + ' polygon-label',
          html: feature.properties[getPolygonSetting(polygon, '_polygonLabel')],
        })
      });

      if (!allTextLabels[polygon]) {allTextLabels.push([]);}
      allTextLabels[polygon].push(myTextLabel);
    }
  }

  /**
   * Perform double click on polyline legend checkboxes so that they get
   * redrawn and thus get on top of polygons
   */
  function doubleClickPolylines() {
    $('#polylines-legend form label input').each(function(i) {
      $(this).click().click();
    });
  }

  /**
   * Here all data processing from the spreadsheet happens
   */
  function onMapDataLoad() {
    var options = mapData.sheets(constants.optionsSheetName).elements;
    createDocumentSettings(options);

    createPolygonSettings(mapData.sheets(constants.polygonsSheetName).elements);
    i = 1;
    while (mapData.sheets(constants.polygonsSheetName + i)) {
      createPolygonSettings(mapData.sheets(constants.polygonsSheetName + i).elements);
      i++;
      polygonSheets++;
    }

    document.title = getSetting('_mapTitle');
    addBaseMap();

    // Add point markers to the map
    var points = mapData.sheets(constants.pointsSheetName);
    var layers;
    var group = '';
    if (points && points.elements.length > 0) {
      layers = determineLayers(points.elements);
      group = mapPoints(points.elements, layers);
    } else {
      completePoints = true;
    }

    centerAndZoomMap(group);

    // Add polylines
    var polylines = mapData.sheets(constants.polylinesSheetName);
    if (polylines && polylines.elements.length > 0) {
      processPolylines(polylines.elements);
    } else {
      completePolylines = true;
    }

    // Add polygons
    if (getPolygonSetting(0, '_polygonsGeojsonURL')) {
      loadAllGeojsons(0);
    } else {
      completePolygons = true;
    }

    // Add Nominatim Search control
    if (getSetting('_mapSearch') !== 'off') {
      var geocoder = L.Control.geocoder({
        expand: 'click',
        position: getSetting('_mapSearch'),
        geocoder: new L.Control.Geocoder.Nominatim({
          geocodingQueryParams: {
            viewbox: [],  // by default, viewbox is empty
            bounded: 0,
          }
        }),
      }).addTo(map);

      function updateGeocoderBounds() {
        var bounds = map.getBounds();
        var mapBounds = [
          bounds._southWest.lat, bounds._northEast.lat,
          bounds._southWest.lng, bounds._northEast.lng,
        ];
        geocoder.options.geocoder.options.geocodingQueryParams.viewbox = mapBounds;
      }

      // Update search viewbox coordinates every time the map moves
      map.on('moveend', updateGeocoderBounds);
    }

    // Add location control
    if (getSetting('_mapMyLocation') !== 'off') {
      var locationControl = L.control.locate({
        keepCurrentZoomLevel: true,
        returnToPrevBounds: true,
        position: getSetting('_mapMyLocation')
      }).addTo(map);
    }

    // Add zoom control
    if (getSetting('_mapZoom') !== 'off') {
      L.control.zoom({position: getSetting('_mapZoom')}).addTo(map);
    }

    map.on('zoomend', function() {
      togglePolygonLabels();
    });

    addTitle();

    // Change Map attribution to include author's info + urls
    changeAttribution();

    // Append icons to categories in markers legend
    $('#points-legend form label span').each(function(i) {
      var legendIcon = (markerColors[i].indexOf('.') > 0)
        ? '<img src="' + markerColors[i] + '" class="markers-legend-icon">'
        : '&nbsp;<i class="fa fa-map-marker" style="color: '
          + markerColors[i]
          + '"></i>';
      $(this).prepend(legendIcon);
    });

    // When all processing is done, hide the loader and make the map visible
    showMap();

    function showMap() {
      if (completePoints && completePolylines && completePolygons) {
        $('.ladder h6').append('<span class="legend-arrow"><i class="fa fa-chevron-down"></i></span>');
        $('.ladder h6').addClass('minimize');

        for (i in allPolygonLegends) {
          if (getPolygonSetting(i, '_polygonsLegendIcon') != '') {
            $('.polygons-legend' + i + ' h6').prepend(
              '<span class="legend-icon"><i class="fa ' + getPolygonSetting(i, '_polygonsLegendIcon') + '"></i></span>');
          }
        }

        $('.ladder h6').click(function() {
          if ($(this).hasClass('minimize')) {
            $('.ladder h6').addClass('minimize');
            $('.legend-arrow i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
            $(this).removeClass('minimize')
              .parent().find('.legend-arrow i')
              .removeClass('fa-chevron-down')
              .addClass('fa-chevron-up');
          } else {
            $(this).addClass('minimize');
            $(this).parent().find('.legend-arrow i')
              .removeClass('fa-chevron-up')
              .addClass('fa-chevron-down');
          }
        });

        $('.ladder h6').get(0).click();

        $('#map').css('visibility', 'visible');
        $('.loader').hide();

        // Open intro popup window in the center of the map
        if (getSetting('_introPopupText') != '') {
          initIntroPopup(getSetting('_introPopupText'), map.getCenter());
        };

        togglePolygonLabels();
      } else {
        setTimeout(showMap, 50);
      }
    }
  }

  /**
   * Adds title and subtitle from the spreadsheet to the map
   */
  function addTitle() {
    var dispTitle = getSetting('_mapTitleDisplay');

    if (dispTitle !== 'off') {
      var title = '<h3 class="pointer">' + getSetting('_mapTitle') + '</h3>';
      var subtitle = '<h5>' + getSetting('_mapSubtitle') + '</h5>';

      if (dispTitle == 'topleft') {
        $('div.leaflet-top').prepend('<div class="map-title leaflet-bar leaflet-control leaflet-control-custom">' + title + subtitle + '</div>');
      } else if (dispTitle == 'topcenter') {
        $('#map').append('<div class="div-center"></div>');
        $('.div-center').append('<div class="map-title leaflet-bar leaflet-control leaflet-control-custom">' + title + subtitle + '</div>');
      }

      $('.map-title h3').click(function() { location.reload(); });
    }
  }


  /**
   * Adds polylines to the map
   */
  function processPolylines(p) {
    if (!p || p.length == 0) return;

    var pos = (getSetting('_polylinesLegendPos') == 'off')
      ? 'topleft'
      : getSetting('_polylinesLegendPos');

    var polylinesLegend = L.control.layers(null, null, {
      position: pos,
      collapsed: false,
    });

    for (i = 0; i < p.length; i++) {
      $.getJSON(p[i]['GeoJSON URL'], function(index) {
        return function(data) {
          latlng = [];

          for (l in data['features']) {
            latlng.push(data['features'][l].geometry.coordinates);
          }

          // Reverse [lon, lat] to [lat, lon] for each point
          for (l in latlng) {
            for (c in latlng[l]) {
              latlng[l][c].reverse();
              // If coords contained 'z' (altitude), remove it
              if (latlng[l][c].length == 3) {
                latlng[l][c].shift();
              }
            }
          }

          line = L.polyline(latlng, {
            color: (p[index]['Color'] == '') ? 'grey' : p[index]['Color'],
            weight: trySetting('_polylinesWeight', 2),
          }).addTo(map);

          if (p[index]['Description'] && p[index]['Description'] != '') {
            line.bindPopup(p[index]['Description']);
          }

          polylinesLegend.addOverlay(line,
            '<i class="color-line" style="background-color:' + p[index]['Color']
            + '"></i> ' + p[index]['Display Name']);

          if (index == 0) {
            if (polylinesLegend._container) {
              polylinesLegend._container.id = 'polylines-legend';
              polylinesLegend._container.className += ' ladder';
            }

            if (getSetting('_polylinesLegendTitle') != '') {
              $('#polylines-legend').prepend('<h6 class="pointer">' + getSetting('_polylinesLegendTitle') + '</h6>');
              if (getSetting('_polylinesLegendIcon') != '') {
                $('#polylines-legend h6').prepend('<span class="legend-icon"><i class="fa '
                  + getSetting('_polylinesLegendIcon') + '"></i></span>');
              }

              // Add map title if set to be displayed in polylines legend
              if (getSetting('_mapTitleDisplay') == 'in polylines legend') {
                var title = '<h3>' + getSetting('_mapTitle') + '</h3>';
                var subtitle = '<h6>' + getSetting('_mapSubtitle') + '</h6>';
                $('#polylines-legend').prepend(title + subtitle);
              }
            }
          }

          if (p.length == index + 1) {
            completePolylines = true;
          }
        };
      }(i));
    }

    if (getSetting('_polylinesLegendPos') !== 'off') {
      polylinesLegend.addTo(map);
    }
  }


  function initIntroPopup(info, coordinates) {
    // This is a pop-up for mobile device
    if (window.matchMedia("only screen and (max-width: 760px)").matches) {
      $('body').append('<div id="mobile-intro-popup"><p>' + info +
        '</p><div id="mobile-intro-popup-close"><i class="fa fa-times"></i></div></div>');

      $('#mobile-intro-popup-close').click(function() {
        $("#mobile-intro-popup").hide();
      });
      return;
    }

    /* And this is a standard popup for bigger screens */
    L.popup({className: 'intro-popup'})
      .setLatLng(coordinates) // this needs to change
      .setContent(info)
      .openOn(map);
  }

  /**
   * Turns on and off polygon text labels depending on current map zoom
   */
  function togglePolygonLabels() {
    for (i in allTextLabels) {
      if (map.getZoom() <= tryPolygonSetting(i, '_polygonLabelZoomLevel', 9)) {
        $('.polygon-label' + i).hide();
      } else {
        if ($('.polygons-legend' + i + ' input[name=prop]:checked').val() != '-1') {
          $('.polygon-label' + i).show();
        }
      }
    }
  }

  /**
   * Changes map attribution (author, GitHub repo, email etc.) in bottom-right
   */
  function changeAttribution() {
    var attributionHTML = $('.leaflet-control-attribution')[0].innerHTML;
    var credit = 'View <a href="' + googleDocURL + '" target="_blank">data</a>';
    var name = getSetting('_authorName');
    var url = getSetting('_authorURL');

    if (name && url) {
      if (url.indexOf('@') > 0) { url = 'mailto:' + url; }
      credit += ' by <a href="' + url + '">' + name + '</a> | ';
    } else if (name) {
      credit += ' by ' + name + ' | ';
    } else {
      credit += ' | ';
    }

    credit += 'View <a href="' + getSetting('_githubRepo') + '">code</a>';
    if (getSetting('_codeCredit')) credit += ' by ' + getSetting('_codeCredit');
    credit += ' with ';
    $('.leaflet-control-attribution')[0].innerHTML = credit + attributionHTML;
  }


  /**
   * Loads the basemap and adds it to the map
   */
  function addBaseMap() {
    var basemap = trySetting('_tileProvider', 'CartoDB.Positron');
    L.tileLayer.provider(basemap, {
      maxZoom: 18
    }).addTo(map);
    L.control.attribution({
      position: trySetting('_mapAttribution', 'bottomright')
    }).addTo(map);
  }

  /**
   * Returns the value of a setting s
   * getSetting(s) is equivalent to documentSettings[constants.s]
   */
  function getSetting(s) {
    return documentSettings[constants[s]];
  }

  /**
   * Returns the value of a setting s
   * getSetting(s) is equivalent to documentSettings[constants.s]
   */
  function getPolygonSetting(p, s) {
    return polygonSettings[p][constants[s]];
  }

  /**
   * Returns the value of setting named s from constants.js
   * or def if setting is either not set or does not exist
   * Both arguments are strings
   * e.g. trySetting('_authorName', 'No Author')
   */
  function trySetting(s, def) {
    s = getSetting(s);
    if (!s || s.trim() === '') { return def; }
    return s;
  }

  function tryPolygonSetting(p, s, def) {
    s = getPolygonSetting(p, s);
    if (!s || s.trim() === '') { return def; }
    return s;
  }

  /**
   * Triggers the load of the spreadsheet and map creation
   */
   var mapData;

   $.ajax({
       url:'csv/Options.csv',
       type:'HEAD',
       error: function() {
         // Options.csv does not exist, so use Tabletop to fetch data from
         // the Google sheet
         mapData = Tabletop.init({
           key: googleDocURL,
           callback: function(data, mapData) { onMapDataLoad(); }
         });
       },
       success: function() {
         // Get all data from .csv files
         mapData = Procsv;
         mapData.load({
           self: mapData,
           tabs: ['Options', 'Points', 'Polygons', 'Polylines'],
           callback: onMapDataLoad
         });
       }
   });

  /**
   * Reformulates documentSettings as a dictionary, e.g.
   * {"webpageTitle": "Leaflet Boilerplate", "infoPopupText": "Stuff"}
   */
  function createDocumentSettings(settings) {
    for (var i in settings) {
      var setting = settings[i];
      documentSettings[setting.Setting] = setting.Customize;
    }
  }

  /**
   * Reformulates polygonSettings as a dictionary, e.g.
   * {"webpageTitle": "Leaflet Boilerplate", "infoPopupText": "Stuff"}
   */
  function createPolygonSettings(settings) {
    p = {};
    for (var i in settings) {
      var setting = settings[i];
      p[setting.Setting] = setting.Customize;
    }
    polygonSettings.push(p);
  }

  // Returns a string that contains digits of val split by comma evey 3 positions
  // Example: 12345678 -> "12,345,678"
  function comma(val) {
      while (/(\d+)(\d{3})/.test(val.toString())) {
          val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
      }
      return val;
  }

});
