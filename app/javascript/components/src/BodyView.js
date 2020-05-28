/* eslint-disable */
import React, {Component} from 'react'
import {PropTypes} from 'prop-types'
import moment from 'moment';

class BodyView extends Component {

    constructor(props) {
        super(props);
    }

    static propTypes = {
        schedulerData: PropTypes.object.isRequired,
    }

    render() {

        const {schedulerData} = this.props;
        const {renderData, headers, config, behaviors} = schedulerData;
        let cellWidth = schedulerData.getContentCellWidth();
        
        let displayRenderData = renderData.filter(o => o.render);
        let tableRows = displayRenderData.map((item) => {
            let rowCells = headers.map((header, index) => {
                let key = item.slotId + '_' + header.time;
                let style = index === headers.length - 1 ? {} : {width: cellWidth};

                if(!!header.nonWorkingTime)
                    style = {...style, backgroundColor: config.nonWorkingTimeBodyBgColor};
                if(item.groupOnly)
                    style = {...style, backgroundColor: config.groupOnlySlotColor};
                if(!!behaviors.getNonAgendaViewBodyCellBgColorFunc){
                    let cellBgColor = behaviors.getNonAgendaViewBodyCellBgColorFunc(schedulerData, item.slotId, header);
                    if(!!cellBgColor)
                        style = {...style, backgroundColor: cellBgColor};
                }
                let className = '';
                const isFriday = moment(header.time).isoWeekday() === 5;
                const isLastDay = moment(header.time).date() === moment(header.time).daysInMonth();
                const isFridayLastDay =  (
                    isFriday &&
                    (moment(header.time).date() === moment(header.time).daysInMonth() - 1 ||
                    moment(header.time).date() === moment(header.time).daysInMonth() - 2)
                );
                if (isFriday) { className = 'friday' }
                if (isLastDay) { className += ' last-day' }
                // if (isFridayLastDay) { style = {...style, borderRight: '1px solid #828282'} }
                return (
                    <td key={key} className={className} style={style}><div></div></td>
                )
            });

            return (
                <tr key={item.slotId} style={{height: item.rowHeight}}>
                    {rowCells}
                </tr>
            );
        });

        return (
            <tbody>
                {tableRows}
            </tbody>
        );
    }
}

export default BodyView
/* eslint-enable */
