import * as Constants from "@mapbox/mapbox-gl-draw/src/constants";
// const doubleClickZoom = require('@mapbox/mapbox-gl-draw/src/lib/double_click_zoom');

import circle from "@turf/circle";
import distance from "@turf/distance";
import { point } from "@turf/helpers";
import DragPan from "../utils/drag_pan";

const DragCircleMode = {
    //Constants.modes.DRAW_POLYGON
};

DragCircleMode.onSetup = function (opts) {
    const polygon = this.newFeature({
        type: Constants.geojsonTypes.FEATURE,
        properties: {
            isCircle: true,
            center: []
        },
        geometry: {
            type: Constants.geojsonTypes.POLYGON,
            coordinates: [[[1, 1], [1.000001, 1.000001], [1.000002, 1.000002]]]
        }
    });

    this.addFeature(polygon);

    this.clearSelectedFeatures();
    //doubleClickZoom.disable(this);
    DragPan.disable(this);
    this.updateUIClasses({ mouse: Constants.cursors.ADD });
    this.activateUIButton('circle');
    this.setActionableState({
        trash: true
    });

    return {
        polygon,
        currentVertexPosition: 0
    };
};

DragCircleMode.onMouseDown = DragCircleMode.onTouchStart = function (state, e) {
    const currentCenter = state.polygon.properties.center;
    if (currentCenter.length === 0) {
        state.polygon.properties.center = [e.lngLat.lng, e.lngLat.lat];
    }
};

DragCircleMode.onStop = function (state) {
    this.activateUIButton();
}

DragCircleMode.onDrag = DragCircleMode.onMouseMove = function (state, e) {
    const center = state.polygon.properties.center;
    if (center.length > 0) {
        const distanceInKm = distance(
            point(center),
            point([e.lngLat.lng, e.lngLat.lat]),
            { units: 'kilometers' });
        const circleFeature = circle(center, distanceInKm);
        state.polygon.incomingCoords(circleFeature.geometry.coordinates);
        state.polygon.properties.radiusInKm = distanceInKm;
    }
};

DragCircleMode.onMouseUp = DragCircleMode.onTouchEnd = function (state, e) {
    DragPan.enable(this);
    return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
};

DragCircleMode.onClick = DragCircleMode.onTap = function (state, e) {
    // don't draw the circle if its a tap or click event
    state.polygon.properties.center = [];
};

DragCircleMode.toDisplayFeatures = function (state, geojson, display) {
    const isActivePolygon = geojson.properties.id === state.polygon.id;
    geojson.properties.active = (isActivePolygon) ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE;
    geojson.properties.isCircle = true;
    return display(geojson);
};

export default DragCircleMode;