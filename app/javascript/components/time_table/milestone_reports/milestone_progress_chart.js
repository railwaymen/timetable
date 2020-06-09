import _ from 'lodash';
import moment from 'moment';

import Chart from 'chart.js';
import React, { useState, useEffect, useRef } from 'react';
import { formattedDuration } from '../../shared/helpers';

function MilestoneProgressChart(props) {
  const {
    workTimes, fromDate, toDate, estimateTotal,
  } = props;
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);

  function updateChartWithData() {
    if (chart) {
      const days = moment(toDate).diff(moment(fromDate), 'days');

      const labels = [];
      const data = [];
      const estimateData = [];
      let total = 0;

      _.times(days + 1, (day) => {
        const date = moment(fromDate).add(day, 'days').formatDate();
        total += _.chain(workTimes).filter({ date }).sumBy('duration');
        labels.push(date);
        estimateData.push(estimateTotal);
        data.push(total);
      });

      chart.config.data = {
        datasets: [{ data, fill: false, borderColor: 'rgb(0, 123, 255)' }, { data: estimateData, pointRadius: 0, fill: false }],
        labels,
      };
      chart.update();
    }
  }

  useEffect(() => {
    if (chartRef && chartRef.current) {
      const newChartInstance = new Chart(chartRef.current.getContext('2d'), {
        type: 'line',
        options: {
          legend: { display: false },
          responsive: true,
          scales: {
            yAxes: [{
              display: false,
            }],
          },
          tooltips: {
            callbacks: {
              label(tooltipItem) {
                return `${I18n.t('common.total')} - ${formattedDuration(tooltipItem.value)}`;
              },
            },
          },
        },
      });
      setChart(newChartInstance);
    }
  }, [chartRef]);

  useEffect(() => {
    updateChartWithData();
  }, [chart, workTimes]);

  return (
    <canvas ref={chartRef} />
  );
}

export default MilestoneProgressChart;
