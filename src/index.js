/*
 * LightningChart JS Example on using `MapChart` with real-time animated data set and dynamic region coloring.
 */
// Import LightningChartJS
const lcjs = require("@arction/lcjs");

// Extract required parts from LightningChartJS.
const {
  lightningChart,
  MapTypes,
  PalettedFill,
  LUT,
  ColorRGBA,
  emptyFill,
  emptyLine,
  UIOrigins,
  LegendBoxBuilders,
  UIElementBuilders,
  UILayoutBuilders,
  Themes,
} = lcjs;

// Specify color look up table for coloring countries. Color depends on % of population change
const palette = new PalettedFill({
  lut: new LUT({
    steps: [
      {
        value: -5,
        color: ColorRGBA(0, 0, 100),
        label: "-5%",
      },
      {
        value: -2.5,
        color: ColorRGBA(0, 0, 255),
        label: "-2.5%",
      },
      {
        value: 0,
        color: ColorRGBA(200, 200, 200),
        label: "0%",
      },
      {
        value: 2.5,
        color: ColorRGBA(255, 0, 0),
        label: "+2.5%",
      },
      {
        value: 5,
        color: ColorRGBA(100, 0, 0),
        label: "+5%",
      },
    ],
    interpolate: true,
    // This property is used to specify fallback color for regions which have no data.
    color: ColorRGBA(255, 255, 255),
  }),
});

// Create Dashboard and Charts.
const dashboard = lightningChart().Dashboard({
  // theme: Themes.darkGold
  numberOfColumns: 3,
  numberOfRows: 2,
});

// Specify cursor result table formatter for all map charts.
const cursorResultTableFormatter = (
  builder,
  region,
  value,
  longitude,
  latitude
) => {
  builder
    .addRow("", region.name, "")
    .addRow("", `Population change ${currentYear}`, "");
  if (value) {
    builder.addRow("", `${value > 0 ? "+" : ""}${value.toFixed(2)} %`, "");
  }
  return builder;
};

// North America region
const chartNA = dashboard
  .createMapChart({
    type: MapTypes.NorthAmerica,
    columnIndex: 0,
    rowIndex: 0,
    columnSpan: 1,
  })
  .setTitle("North America")
  .setFillStyle(palette)
  .setCursorResultTableFormatter(cursorResultTableFormatter);

// South America region
const chartSA = dashboard
  .createMapChart({
    type: MapTypes.SouthAmerica,
    columnIndex: 1,
    rowIndex: 0,
    columnSpan: 1,
  })
  .setTitle("South America")
  .setFillStyle(palette)
  .setCursorResultTableFormatter(cursorResultTableFormatter);

// Europe region
const chartEurope = dashboard
  .createMapChart({
    type: MapTypes.Europe,
    columnIndex: 0,
    rowIndex: 1,
    columnSpan: 3,
    rowSpan: 1
  })
  .setTitle("Europe")
  .setFillStyle(palette)
  .setCursorResultTableFormatter(cursorResultTableFormatter);

// Create UI panel inside Dashboard for placing legend and some extra controls.
const panel = dashboard.createUIPanel({
  columnIndex: 2,
  rowIndex: 0,
  columnSpan: 1,
  rowSpan: 1
});

panel.onResize((chart, width, height, engineWidth, engineHeight) => {
  block.style.width = width  + 'px'
  block.style.left = engineWidth - width + 'px'
})
chartEurope.onResize((chart, width, height, engineWidth, engineHeight) => {
  block.style.top = (engineHeight - height ) - 82 +'px'
})

// NOTE: Custom Legend Box is created with UI elements.
const legendLayout = panel
  .addUIElement(UILayoutBuilders.Column)
  .setPosition({
    x: 0,
    y: 20,
  })
  .setOrigin(UIOrigins.LeftBottom)
  .setMargin(6)
  .setMouseInteractions(false)
  .setBackground(bg => bg
      .setFillStyle(emptyFill)
      .setStrokeStyle(emptyLine)
  )

const legendTitle = legendLayout
  .addElement(UIElementBuilders.TextBox)
  .setText("Population change (% / year)")

const legendBuilder = LegendBoxBuilders.HorizontalLegendBox.addStyler(
  (legendBox) =>
    legendBox
      .setBackground((background) =>
        background.setFillStyle(emptyFill).setStrokeStyle(emptyLine)
      )
      .setTitle("")
);

const legendNA = legendLayout.addElement(legendBuilder).add(chartNA);
const legendSA = legendLayout.addElement(legendBuilder).add(chartSA);
const legendEurope = legendLayout.addElement(legendBuilder).add(chartEurope);

// Add dynamically injected HTML elements for active Year slider.
const yearDiv = document.createElement("div");
yearDiv.id = "block";
const yearSlider = document.createElement("input");
yearSlider.type = "range";
yearSlider.min = 1961;
yearSlider.max = 2018;
yearSlider.value = yearSlider.min;
yearSlider.id = "slider";
const yearMarker = document.createElement("span");
yearMarker.id = "marker";
yearDiv.appendChild(yearMarker);
yearDiv.appendChild(yearSlider);
dashboard.engine.container.append(yearDiv);

const markerColorGreen = "rgb(0, 0, 200, 0.6)";
const markerColorDarkGreen = "rgb(0, 0, 150)";
const markerColorRed = "rgb(200, 0, 0)";
const markerColorDarkRed = "rgb(150, 0, 0)";

// Keep track of animation properties.
let currentYear = yearSlider.min;
let yearAnimationActive = true;
let interval;

// Fetch data set used in example.
fetch(
  document.head.baseURI +
    "examples/assets/lcjs_example_1102_mapChartTimeline-population60-21.json"
)
  .then((r) => r.json())
  .then((populationData) => {
    // stop timeline, change the year  and change bg color of slider by clicking on slider
    yearSlider.oninput = () => {
      currentYear = yearSlider.value;
      clearInterval(interval);
      yearAnimationActive = false;
      yearMarker.style.background = markerColorRed;
      setMap(populationData, currentYear);
      const value =
        ((yearSlider.value - yearSlider.min) * 100) /
        (yearSlider.max - yearSlider.min);
      yearSlider.style.background =
        "linear-gradient(to right, rgba(0,0,255,.6)" +
        value +
        "%, #fff " +
        value +
        "%, white 100%)";
    };

    // change the color of the marker on hover
    yearMarker.onmouseover = () => {
      if (yearAnimationActive) {
        yearMarker.style.background = markerColorDarkRed;
      } else {
        yearMarker.style.background = markerColorDarkGreen;
      }
    };

    // reset the color of the marker on mouse out
    yearMarker.onmouseout = () => {
      if (yearAnimationActive) {
        yearMarker.style.background = markerColorGreen;
      } else {
        yearMarker.style.background = markerColorRed;
      }
    };

    // pause/start timeline by clicking the marker
    yearMarker.onclick = () => {
      if (yearAnimationActive) {
        clearInterval(interval);
        yearAnimationActive = false;
        yearMarker.style.background = markerColorRed;
      } else {
        intervalHandler();
        yearAnimationActive = true;
        yearMarker.style.background = markerColorGreen;
      }
    };

    // set timeline
    const intervalHandler = () => {
      // subscribe var. 'interval' to 'setInterval'
      interval = setInterval(() => {
        // Map data to format expected by MapChart.
        setMap(populationData, currentYear);
        // if timeline is over wait for 2sec and start it again
        if (currentYear >= 2019 && yearAnimationActive) {
          setTimeout(() => {
            currentYear = yearSlider.min;
          }, 1800);
        } else {
          yearSlider.value = currentYear;
          // change BG of slider
          const value =
            ((yearSlider.value - yearSlider.min) * 100) /
            (yearSlider.max - yearSlider.min);
          yearSlider.style.background =
            "linear-gradient(to right, rgba(0,0,255,.6)" +
            value +
            "%, #fff " +
            value +
            "%, white 100%)";
          currentYear++;
        }
      }, 200);
    };

    intervalHandler();

    const setMap = (populationData, year) => {
      // set year for marker
      yearMarker.textContent = year;

      // calculate population change from previous year and put into map chart data format.
      const regionValuesData = populationData.map((item) => ({
        ISO_A3: item["Country Code"],
        value: ((item[year] - item[year - 1]) * 100) / item[year],
      }));

      // update map chart region values
      chartEurope.invalidateRegionValues(regionValuesData);
      chartSA.invalidateRegionValues(regionValuesData);
      chartNA.invalidateRegionValues(regionValuesData);
    };
  });

// Dynamically inject some CSS to example.
function addStyle(styleString) {
  const style = document.createElement("style");
  style.textContent = styleString;
  document.head.append(style);
}

addStyle(`

  * {
    box-sizing: border-box;
  }
  
  #block{
    width: 33%;
    height: 60px;
    top: calc(40% - 13px);
    right: -2px;
    position: absolute;
    display: flex;
    justify-content: space-evenly;
    padding: 30px 10px;
    z-index: 1;
    box-sizing: border-box
  }

  #slider{
    -webkit-appearance: none;
    margin: 0;
    padding: 0;
    width: 75%;
    height: 5px;
    position: relative;
    cursor: pointer;
    border-radius: 10px;
    border: solid 1px; 
    background: linear-gradient(to right, #fff 0%, white 100%)
  }
  
  #slider::-webkit-slider-thumb{
    -webkit-appearance: none;
    height: 20px;
    width: 20px;
    padding: 0;
    background-color: lightgray;
    cursor: pointer;
    border-radius: 50%;
    border: solid 1px gray
  }

  #marker {
    background: rgb(0, 0, 200, 0.6);
    color: white;
    height: 30px;
    width: 50px;
    top: -13px;
    position: relative;
    border-radius: 4px;
    text-align:center; 
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  #marker::after {
    content: "";
    text-align: center;
    position: absolute;
    left: 100%;
    border-bottom: 5px solid transparent;
    border-top: 5px solid transparent;
    border-left: 5px solid lightgray;
  }

  #marker:active {
    transform: scale(0.9);
  }

  `);
