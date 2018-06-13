function SvgZoom(){
    var canvas_svg;
    var canvas_g;
    var TRANSLATE = [0,0];
    var SCALE =1;
    var zoomFunction;//缩放对象
    var svgZoom = {
        init:function(){
            canvas_svg = d3.select('svg')
            canvas_g = d3.select('#canvas-g')
            //缩放
            zoomFunction = d3.zoom()
                .scaleExtent([0.2, 3])
                .on('start', function () {
                })
                .on('end', function () {
                    TRANSLATE = [d3.event.transform.x,d3.event.transform.y]
                    SCALE = d3.event.transform.k
                })
                .on('zoom', function () {
                    canvas_g.attr('transform', d3.event.transform);
                });
            canvas_svg.on('mousedown', function (e) {
                d3.selectAll('.selected').classed("selected", false);
            }).call(zoomFunction).on('dblclick.zoom', null);
        },
        translate:function (translate) {
            if (isUndefined(translate)) {
                return TRANSLATE;
            } else {
                //todo:设置translate
            }
        },
        scale: function (scale) {
            if (isUndefined(scale)) {
                return SCALE;
            } else {
                //todo:设置scale
            }
        }
    }
    return svgZoom;
}