function InitComponent(componentClass) {
    var rectWidth = 350, rectHeight = 130;
    var components = $(componentClass)
    //记录缩放平移数据
    var zoomX = null, zoomY = null, scale = null;
    //组件连线拖拽
    var connect = d3.drag()
        .subject(function (d) {
            var origin = d3.mouse(d3.select('#canvas').node());
            return {
                x: origin[0],
                y: origin[1]
            };
        })
        .on('start', function (d) {
            d3.select(this).classed('dragging', true)
            var canvas = d3.select('#canvas');
            var position = d3.mouse(canvas.node());
            canvas.insert('path', ':first-child')
                .datum({
                    x: position[0],
                    y: position[1]
                })
                .classed('connector', true)
                .attr(
                    'd', function (pathDatum) {
                        return 'M' + pathDatum.x + ' ' + pathDatum.y + 'L' + pathDatum.x + ' ' + pathDatum.y;
                    }
                );
            // updates the location of the connection img
            d3.select(this).attr('transform', function () {
                return 'translate(' + position[0] + ', ' + (position[1] - 12) + ')';
            });
            // re-append the image to keep it on top
            canvas.node().appendChild(this);
        })
        .on('drag', function (d) {
            //画虚线path
            d3.select('path.connector').attr('d', function (pathDatum) {
                //获取hover组件
                var destCom = d3.select('.hover');
                if(!destCom.empty()){
                    if(d.gId==destCom.datum().id){
                        d3.select('.connectable').classed('connectable',false);
                        return 'M' + pathDatum.x + ' ' + pathDatum.y + 'L' + d3.event.x + ' ' + d3.event.y;
                    }
                    d3.select('.connectable').classed('connectable',false);
                    destCom.classed('connectable',true);
                    var bbox = {'x': destCom.datum().x, 'y': destCom.datum().y, 'width': rectWidth, 'height': rectHeight}
                    var dp = getPerimeterPoint(pathDatum, bbox);
                    //计算自身连接点
                    var bbox_self = {'x': d.gX, 'y': d.gY, 'width': rectWidth, 'height': rectHeight}
                    var dotSelf = {'x':destCom.datum().x+rectWidth/2,'y':destCom.datum().y+rectHeight/2}
                    var dp_self = getPerimeterPoint(dotSelf, bbox_self);
                    console.log(dp,dp_self)
                    return 'M' + dp_self.x + ' ' + dp_self.y + 'L' + dp.x + ' ' + dp.y;
                }else{
                    d3.select('.connectable').classed('connectable',false);
                    return 'M' + pathDatum.x + ' ' + pathDatum.y + 'L' + d3.event.x + ' ' + d3.event.y;
                }
            });
            d3.select(this).attr('transform', function () {
                return 'translate(' + d3.event.x + ', ' + (d3.event.y - 12) + '),rotate(-45)';
            });
        })
        .on('end', function (d) {
            var ifd = d3.select('.hover');
            if(ifd.empty()){
                d3.select('.connector').remove()
            }
            d3.select(this).classed('dragging', false)
            d3.select(this).remove()
        })
    //控件组拖拽行为
    var componentGroupDrag = d3.drag()
        .on("start", function (d) {
            //重新绘制连线图标
            var addConnect = d3.select('text.add-connect');
            addConnect.remove()
        })
        .on("drag", function (d) {
            console.log(d)
            var dragSelection = d3.select('.drag-selection');
            var $this = d3.select(this);
            if (dragSelection.empty()) {
                $this.append('rect')
                    .attr('width', rectWidth)
                    .attr('height', rectHeight)
                    .attr('rx', 6)
                    .attr('ry', 6)
                    .attr('class', 'drag-selection')
                    .attr('stroke-dasharray', 4).datum({
                    x: 0,
                    y: 0
                });
            } else {
                dragSelection.attr('x', function (d) {
                    d.x += d3.event.dx;
                    return d.x;
                })
                    .attr('y', function (d) {
                        d.y += d3.event.dy;
                        return d.y;
                    });
            }
        })
        .on("end", function (d) {
            var dragSelection = d3.select('.drag-selection');
            if (dragSelection.empty()) {
                return;
            }
            var selected = d3.select('.selected');
            selected.attr('transform', 'translate(' + (d.x = d3.event.x) + ', ' + (d.y = d3.event.y) + ')');
            dragSelection.remove()
            //todo:更新连线位置
        });
    var draggable = {
        /**
         * 按钮放置动作处理
         * @param e
         * @param selector
         */
        componentDropHandler: function (e, selector) {
            var gId = guid()
            var original = {
                x: e.clientX,
                y: e.clientY,
                id:gId
            }
            //调整缩放平移后的位置
            if (zoomX != null && zoomY != null && scale != null) {
                original.x = (original.x / scale) - (zoomX / scale);
                original.y = (original.y / scale) - (zoomY / scale);
            }

            var componentGroup = selector.append('g')
                .attr('transform', 'translate(' + (original.x) + ', ' + original.y + ')')
                .attr('fill', 'transparent')
                .attr('stroke-width', '1px')
                .classed('component-rect', true)
                .on('mousedown', function () {
                    d3.selectAll('.selected').classed("selected", false);
                    d3.select(this).classed('selected', true)
                })
                .on('mouseenter', function (d) {
                    //放置连接图标
                    var selection = d3.select(this);
                    selection.classed('hover', true);
                    var addConnect = d3.select('text.add-connect');
                    if (addConnect.empty()) {
                        var x = (rectWidth / 2);
                        var y = (rectHeight / 2);

                        selection.append('text')
                            .datum({
                                origX: x,
                                origY: y,
                                gId:gId,
                                gX:original.x,
                                gY:original.y
                            })
                            .attr('class', 'add-connect')
                            .attr('transform', 'translate(' + x + ', ' + (y + 14) + '),rotate(-45)')
                            .classed('fa', true)
                            .text("\uf35a").call(connect);
                    }
                })
                .on('mouseleave', function () {
                    var selection = d3.select('text.add-connect');
                    d3.select(this).classed('hover', false)
                    if (!selection.empty()&&!selection.classed('dragging')) {
                        selection.remove()
                    }
                })
                .datum(original).call(componentGroupDrag);
            componentGroup.append('rect')
                .attr('width', rectWidth)
                .attr('height', rectHeight)
                .attr('fill', 'transparent')
                .attr('stroke-width', '1px')
        },
        /**
         * 菜单按钮拖拽配置
         * @param component
         * @returns {{zIndex: number, revert: boolean, revertDuration: number, cancel: boolean, containment: string, cursor: string, start: start, stop: stop, helper: (function(*): (jQuery|HTMLElement))}}
         */
        draggableComponentConfig: function (component) {
            return {
                zIndex: 1011,
                revert: true,
                revertDuration: 0,
                cancel: false,
                containment: 'window',
                cursor: '-webkit-grabbing',
                start: function (e) {
                },
                stop: function (e) {
                    component.dragIcon.remove()
                    var svg = d3.select('.processors');
                    draggable.componentDropHandler(e, svg);
                },
                helper: function (ev) {
                    return $(component.dragIcon);
                }
            }
        },
        /**
         * 初始化菜单按钮
         */
        init: function () {
            components.each(function () {
                var component = $(this);
                component.dragIcon = component.find('i').clone();
                component.draggable(draggable.draggableComponentConfig(component));
            });
            draggable.zoomView();
        },
        /**
         * 缩放拖拽svg
         */
        zoomView: function () {
            d3.select('svg').on('click', function () {
            })
            d3.select('svg').on('mousedown', function (e) {
                d3.selectAll('.selected').classed("selected", false);
            }).call(d3.zoom()
                .scaleExtent([0.2, 5])
                .on('start', function () {
                })
                .on('end', function () {
                    zoomX = d3.event.transform.x;
                    zoomY = d3.event.transform.y;
                    scale = d3.event.transform.k;
                })
                .on('zoom', function () {
                    d3.select('#canvas').attr('transform', 'translate(' + d3.event.transform.x + ',' + d3.event.transform.y + ') scale(' + d3.event.transform.k + ')');
                }))
        }
    }
    return draggable;
}
