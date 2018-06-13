function GroupConnect() {
    //组件连线拖拽
    var connect;
    var sourceGroup;
    var destGroup;
    var groupConnect = {
        getConnect: function () {
            return connect;
        },
        init: function () {
            connect = d3.drag()
                .subject(function (d) {
                    var origin = d3.mouse(d3.select('#canvas-g').node());
                    return {
                        x: origin[0],
                        y: origin[1]
                    };
                })
                .on('start', function (d) {
                    sourceGroup = d3.select(this.parentNode).classed('selected', true)
                    d3.select(this).classed('dragging', true)
                    var canvas = d3.select('#canvas-g');
                    var position = d3.mouse(canvas.node());
                    d3.select('.connections').insert('path', ':first-child')
                        .datum({
                            x: position[0],
                            y: position[1]
                        })
                        .classed('connector', true)
                        .classed('linking', true)
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
                    d3.select('path.connector')
                        .attr('stroke','#ff0000')
                        .attr('stroke-opacity','0.5')
                        .attr('stroke-dasharray',1)
                        .attr('d', function (pathDatum) {
                        //获取hover组件
                        destGroup = d3.select('.hover');
                        if (!destGroup.empty()) {
                            //如果是当前的组，不处理
                            if (sourceGroup.datum().id == destGroup.datum().id) {
                                d3.select('.connectable').classed('connectable', false);
                                return 'M' + pathDatum.x + ' ' + pathDatum.y + 'L' + d3.event.x + ' ' + d3.event.y;
                            }
                            //先取消上一个可连接组，重新设置为当前组 为可连接
                            d3.select('.connectable').classed('connectable', false);
                            destGroup.classed('connectable', true);
                            var bbox = {
                                'x': destGroup.datum().x,
                                'y': destGroup.datum().y,
                                'width': destGroup.datum().width,
                                'height': destGroup.datum().height
                            }
                            var dp = getPerimeterPoint(pathDatum, bbox);
                            //计算自身连接点
                            var bbox_self = {
                                'x': sourceGroup.datum().x,
                                'y': sourceGroup.datum().y,
                                'width': sourceGroup.datum().width,
                                'height': sourceGroup.datum().height
                            }
                            var dotSelf = {
                                'x': destGroup.datum().x + destGroup.datum().width / 2,
                                'y': destGroup.datum().y + destGroup.datum().height / 2
                            }
                            var dp_self = getPerimeterPoint(dotSelf, bbox_self);
                            //连接到两个group 记录点的位置
                            d3.select(this).datum().sourceGroup = {
                                x: sourceGroup.datum().x,
                                y: sourceGroup.datum().y,
                                id: sourceGroup.datum().id,
                                linkPosition: dp_self,
                                width: sourceGroup.datum().width,
                                height: sourceGroup.datum().height
                            }
                            d3.select(this).datum().destGroup = {
                                x: destGroup.datum().x,
                                y: destGroup.datum().y,
                                id: destGroup.datum().id,
                                linkPosition: dp,
                                width: destGroup.datum().width,
                                height: destGroup.datum().height
                            }
                            return 'M' + dp_self.x + ' ' + dp_self.y + 'L' + dp.x + ' ' + dp.y;
                        } else {
                            d3.select('.connectable').classed('connectable', false);
                            return 'M' + pathDatum.x + ' ' + pathDatum.y + 'L' + d3.event.x + ' ' + d3.event.y;
                        }
                    });
                    d3.select(this).attr('transform', function () {
                        return 'translate(' + d3.event.x + ', ' + (d3.event.y - 12) + '),rotate(-45)';
                    });
                })
                .on('end', function (d) {
                    d3.select('path.linking').attr('marker-end', function () {
                        return 'url(#normal)'
                    }).classed('linking', false)
                        .attr('stroke','#000000')
                        .attr('stroke-opacity',null)
                        .attr('stroke-dasharray',null)
                    var ifd = d3.select('.hover');
                    if (ifd.empty() || sourceGroup.datum().id == destGroup.datum().id) {
                        //如果连线目标为空，则删除连线  //如果目标就是本身，则删除连线
                        d3.select('.connector').remove()
                    }else{
                        //todo:判断连线两边是否已经有连线，如果有则删除
                        d3.select('.connections').on('mouseenter',function (d) {
                            console.log(1111111111111111)
                        })
                    }

                    //移除图标
                    d3.select(this).classed('dragging', false)
                    d3.select(this).remove()
                })
        },
        /**
         * 更新所有相关连线位置
         * @param sourceId  拖动groupid
         */
        updatePosition: function (groupId, dropPosition) {
            var connectors = d3.selectAll('path.connector');
            var updates = d3.map()
            console.log(connectors.size())
            connectors.each(function (d) {
                var source = d.sourceGroup
                var dest = d.destGroup
                var sourceLinkNode,destLinkNode;
                var flag  = false;
                //本身是连线起点
                if (groupId == d.sourceGroup.id) {
                    flag = true;//需要更新连线
                    //重新计算目标连接点
                    destLinkNode = getPerimeterPoint({'x': dropPosition.x+source.width/2, 'y': dropPosition.y+source.height/2}, {
                        'x': dest.x,
                        'y': dest.y,
                        'width': dest.width,
                        'height': dest.height
                    })
                    //重新计算本身连接点
                    sourceLinkNode = getPerimeterPoint({'x': dest.x+dest.width/2, 'y': dest.y+dest.height/2}, {
                        'x': dropPosition.x,
                        'y': dropPosition.y,
                        'width': source.width,
                        'height': source.height
                    })
                    //更新数据  位置
                    d.sourceGroup.x=dropPosition.x
                    d.sourceGroup.y=dropPosition.y
                }
                if (groupId == d.destGroup.id) {
                    //本身是连线目标点
                    flag = true;//需要更新连线
                    //重新计算目标连接点
                    destLinkNode = getPerimeterPoint({'x': source.x+source.width/2, 'y': source.y+source.height/2}, {
                        'x': dropPosition.x,
                        'y': dropPosition.y,
                        'width': dest.width,
                        'height': dest.height
                    })
                    //重新计算本身连接点
                    sourceLinkNode = getPerimeterPoint({'x': dropPosition.x+dest.width/2, 'y': dropPosition.y+dest.height/2}, {
                        'x': source.x,
                        'y': source.y,
                        'width': source.width,
                        'height': source.height
                    })
                    d.destGroup.x = dropPosition.x
                    d.destGroup.y = dropPosition.y
                }
                if(flag){
                    //更新数据
                    d.sourceGroup.linkPosition = sourceLinkNode
                    d.destGroup.linkPosition = destLinkNode
                    d3.select(this).attr('d', function (pathDatum) {
                        return 'M' + sourceLinkNode.x + ' ' + sourceLinkNode.y + 'L' + destLinkNode.x + ' ' + destLinkNode.y;
                    });
                }
            })
        }
    }
    return groupConnect;
}