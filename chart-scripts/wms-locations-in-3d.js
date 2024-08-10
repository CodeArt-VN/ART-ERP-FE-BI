var series = [];
for (var z = 0; z < 3; z++) {
  let s = {
    type: 'bar3D',
    name: 'z_' + z,
    data: [],
    stack: 'stack',
    shading: 'color',
    itemStyle: { opacity: z % 2 === 0 ? 0.7 : 0 },
    emphasis: {
      label: {
        fontSize: 20,
        color: '#900'
      },
      itemStyle: { color: '#900' }
    }
  };

  for (var x = 1; x <= 25; x++) {
    for (var y = 1; y <= 48; y++) {
      //X route
      let yRoutes = [5, 6, 11, 12, 17, 18, 23, 24, 29, 30, 35, 36, 41, 42];
      let xRoutes = [8, 9, 17, 18];
      let value = 0;
      if (xRoutes.includes(x) || yRoutes.includes(y) || (x == 10 && y <= 10)) {
        value = 0;
      } else {
        if (z % 2 === 0) {
          value = Math.random().toFixed(2);
        } else {
          //previous series value
          let preValue = series[z - 1].data.find(
            (d) => d[0] === x && d[1] === y
          );
          value = 1 + (1 - preValue[2]);
        }
      }

      if (value === 0) {
        s.data.push({ itemStyle: { opacity: 0 }, value: [x, y, value] });
      } else {
        s.data.push([x, y, value]);
      }
    }
  }

  series.push(s);
}

option = {
  tooltip: {},
  visualMap: {
    max: 1,
    inRange: {
      color: [
        '#313695',
        '#4575b4',
        '#74add1',
        '#abd9e9',
        '#e0f3f8',
        '#ffffbf',
        '#fee090',
        '#fdae61',
        '#f46d43',
        '#d73027',
        '#a50026'
      ]
    }
  },

  xAxis3D: {
    type: 'category'
  },
  yAxis3D: {
    type: 'category'
  },
  zAxis3D: {
    type: 'value'
  },
  grid3D: {
    boxWidth: 125,
    boxDepth: 240,
    boxHeight: 50,
    viewControl: {
      //autoRotate: true
    },
    show: false,
    light: {
      main: {
        intensity: 1.2
      },
      ambient: {
        intensity: 0.3
      }
    }
  },

  series: series
}
