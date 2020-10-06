import Chart from 'chart.js';
import React, { useState, useEffect, useRef } from 'react';
import { tagColors } from '../../shared/constants';
import { formattedDuration } from '../../shared/helpers';

function MilestonePieChart(props) {
  const { workTimesSumByTag, handleChartClick } = props;
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);

  function updateChartWithData() {
    if (chart) {
      const values = Object.values(workTimesSumByTag);
      const colors = Object.keys(workTimesSumByTag).map((key) => tagColors[key]);
      const labels = Object.keys(workTimesSumByTag);

      chart.config.data = {
        datasets: [{
          data: values,
          backgroundColor: colors,
        }],
        labels,
      };

      chart.update();
    }
  }

  useEffect(() => {
    if (chartRef && chartRef.current) {
      const newChartInstance = new Chart(chartRef.current.getContext('2d'), {
        type: 'pie',
        options: {
          onClick: (_evt, element) => { if (element[0]) handleChartClick(element[0]); },
          legend: { display: false },
          tooltips: {
            callbacks: {
              label(tooltipItem, data) {
                const label = data.labels[tooltipItem.index];
                const value = data.datasets[0].data[tooltipItem.index];
                return `${label} - ${formattedDuration(value)}`;
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
  }, [workTimesSumByTag]);

  return (
    <div className="mt-3">
      <h4>
        {I18n.t('apps.milestone_reports.by_type')}
        {Object.keys(workTimesSumByTag).length === 1 && `: ${Object.keys(workTimesSumByTag)[0]}`}
      </h4>
      <canvas ref={chartRef} />
    </div>
  );
}

export default MilestonePieChart;
