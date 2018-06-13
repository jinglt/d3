function FlowComponent(menuClass) {
    var zoomAction
    var groupConnect;
    //组拖拽
    var componentGroupDrag = d3.drag()
        .on("start", function (d) {
            console.log('drag start:', d.x, d.y)
            //移动时删除连线图标
            d3.select('text.add-connect').remove();
        })
        .on("drag", function (d) {
            var dragSelection = d3.select('.drag-selection');
            var $this = d3.select(this);
            if (dragSelection.empty()) {
                $this.append('rect')
                    .attr('width', flowComponent.config.component.width)
                    .attr('height', flowComponent.config.component.height)
                    .attr('rx', 6)
                    .attr('ry', 6)
                    .attr('class', 'drag-selection')
                    .attr('stroke-dasharray', 4)
                    .datum({
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
            //跟新相关连线
            groupConnect.updatePosition(d.id, d)
        });
    //节点组放置
    var dropComponent = function (e, component) {
        //获取唯一id
        var gId = guid()
        //新建节点datum数据
        var data = {
            x: e.clientX,
            y: e.clientY,
            id: gId,
            width: flowComponent.config.component.width,
            height: flowComponent.config.component.height
        }
        data.x = (data.x / zoomAction.scale()) - (zoomAction.translate()[0] / zoomAction.scale());
        data.y = (data.y / zoomAction.scale()) - (zoomAction.translate()[1] / zoomAction.scale());
        console.log('实际位置：', (data.x), (data.y))
        //新建g节点
        flowComponent.createComponent(data, gId)

    }
    var draggableComponentConfig = function (component) {
        return {
            zIndex: 1011,
            revert: true,
            revertDuration: 0,
            cancel: false,
            containment: 'window',
            cursor: '-webkit-grabbing',
            start: function (e) {
                $('body').append(component.helper)

            },
            stop: function (e) {
                component.dragIcon.remove()
                //判断鼠标位置是否在可放置区域
                if (flowComponent.config.dropArea.left < e.clientX && flowComponent.config.dropArea.top < e.clientY) {
                    dropComponent(e, component)
                    console.log('放置结束：', e.clientX, e.clientY)
                }
            },
            helper: function (ev) {
                //将拖拽节点append到body防止拖动出现滚动条
                $('body').append($(component.dragIcon));
                return $(component.dragIcon);
            }
        }
    }
    var flowComponent = {
        config: {
            //配置项
            component: {
                width: 300,
                height: 100
            },
            dropArea: {
                top: 40,
                left: 260
            }

        },
        init: function () {
            zoomAction = SvgZoom();
            zoomAction.init();
            groupConnect = GroupConnect()
            groupConnect.init()
            //初始化
            $(menuClass).each(function () {
                var component = $(this);
                component.dragIcon = component.clone();
                component.draggable(draggableComponentConfig(component));
            });
        },
        createComponent: function (data, gId) {
            var $this = this;
            var selector = d3.select('.processors');
            var componentGroup = selector.append('g')
                .attr('transform', 'translate(' + (data.x) + ', ' + (data.y) + ')')
                .attr('id', gId)
                .classed('component-group', true)
                .classed('moveable', true);
            componentGroup.append('rect')
                .attr('width', $this.config.component.width)
                .attr('height', $this.config.component.height)
                .attr('fill', '#fff')
                .attr('stroke-width', '1px')
                .classed('border', true)
            componentGroup.append('rect')
                .attr('width', $this.config.component.width)
                .attr('height', $this.config.component.height)
                .attr('fill', '#fff')
                .attr('stroke-width', '1px')
                .attr('filter', 'url(#component-drop-shadow)')
                .classed('body', true)
            componentGroup.append('text')
                .attr('x', 10)
                .attr('y', 30)
                .attr('width', 300)
                .attr('height', 40)
                .text('节点名称：' + 'test')//data.nodeName
                .classed('componentTitle', true)
            componentGroup.append('rect')
                .attr('x', 0)
                .attr('y', 39)
                .attr('width', 300)
                .attr('height', 1)
                .attr('fill', '#c7d2d7')
            componentGroup.append('rect')
                .attr('x', 0)
                .attr('y', 41)
                .attr('width', 300)
                .attr('height', 20)
                .attr('fill', '#fff')
            componentGroup.append('rect')
                .attr('x', 0)
                .attr('y', 60)
                .attr('width', 300)
                .attr('height', 1)
                .attr('fill', '#c7d2d7')
            componentGroup.append('rect')
                .attr('x', 0)
                .attr('y', 61)
                .attr('width', 300)
                .attr('height', 20)
                .attr('fill', '#fff')
            componentGroup.append('rect')
                .attr('x', 0)
                .attr('y', 80)
                .attr('width', 300)
                .attr('height', 1)
                .attr('fill', '#c7d2d7')
            //运行信息
            var runningGroup = componentGroup.append('g')
                .attr('transform', 'translate(10,40)')
                .classed('running-group', true);
            runningGroup.append('text')
                .attr('y', 15)
                .attr('width', 50)
                .attr('height', 10)
                .text('输入数量：9999')
            runningGroup.append('text')
                .attr('y', 35)
                .attr('width', 50)
                .attr('height', 10)
                .text('输出数量：9999')
            runningGroup.append('text')
                .attr('y', 55)
                .attr('width', 50)
                .attr('height', 10)
                .text('运行耗时：20秒')
            //组连线
            componentGroup.on('mousedown', function () {
                d3.selectAll('.selected').classed("selected", false);
                d3.select(this).classed('selected', true)
            })
                .on('mouseenter', function (d) {
                    //放置连接图标
                    var selection = d3.select(this);
                    selection.classed('hover', true);
                    var addConnect = d3.select('text.add-connect');
                    if (addConnect.empty()) {
                        var x = ($this.config.component.width / 2);
                        var y = ($this.config.component.height / 2);

                        selection.append('text')
                            .datum({
                                x: x,
                                y: y,
                                groupId: gId
                            })
                            .attr('class', 'add-connect')
                            .attr('transform', 'translate(' + x + ', ' + (y + 15) + '),rotate(-45)')
                            .classed('fa', true)
                            .text("\uf35a").call(groupConnect.getConnect());
                    }
                })
                .on('mouseleave', function () {
                    var selection = d3.select('text.add-connect');
                    d3.select(this).classed('hover', false)
                    if (!selection.empty() && !selection.classed('dragging')) {
                        selection.remove()
                    }
                });
            //组拖动
            componentGroup.datum(data).call(componentGroupDrag);
        }
    }
    return flowComponent;
}