d3.csv("data.csv").then(data => {
    data.forEach(d => {
        d.date = new Date(d.date);
        d.cases = +d.cases;
        d.deaths = +d.deaths;
    });

    const stateData = d3.rollup(data, v => {
        return {
            cases: d3.sum(v, d => d.cases),
            deaths: d3.sum(v, d => d.deaths)
        };
    }, d => d.state);

    const stateArray = Array.from(stateData, ([state, values]) => ({
        state, 
        cases: values.cases,
        deaths: values.deaths
    }));

    initVisualization(data, stateArray);
});

function initVisualization(data, stateData) {
    const svg = d3.select("#visualization")
                  .append("svg")
                  .attr("width", 800)
                  .attr("height", 800);

    const narrativeText = d3.select("#narrative");

    let currentScene = 0;
    const scenes = [introScene, scene1, scene2, scene3, scene4];

    function renderScene() {
        svg.selectAll("*").remove(); 
        scenes[currentScene](svg, data, stateData);

        const narrative = [
            "Introduction - The COVID-19 pandemic and outbreak is an important event that has been documented rigorously. The following pages aim to inform and display the effect of the pandemic in the US. Here is a link to the data being used in the following analysis: https://github.com/nytimes/covid-19-data/blob/master/us-states.csv. The data will focus on dates ranging from January 2020 to March 2023. ",
            "Cases in the US - This scene shows the total number of COVID-19 cases over time across the United States. We can observe the rise in cases as the pandemic progresses.",
            "Deaths Over Time - This scene highlights the total number of COVID-19 deaths over time. It allows us to see the impact of the virus in terms of fatalities.",
            "New York Focus - This scene focuses on New York, one of the hardest-hit states during the early stages of the pandemic starting from January 2020 to March 2023.",
            "Comparative Analysis - This scene provides a comparison of COVID-19 cases and deaths across different states from January 2020 to March 2023."
        ];

        narrativeText.text(narrative[currentScene]);

        document.getElementById("prev").style.display = currentScene === 0 ? "none" : "inline";
        document.getElementById("next").innerText = currentScene === scenes.length - 1 ? "Return to Start" : "Next";
    }

    document.getElementById("prev").addEventListener("click", () => {
        if (currentScene > 0) {
            currentScene--;
            renderScene();
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        if (currentScene < scenes.length - 1) {
            currentScene++;
        } else {
            currentScene = 0; 
        }
        renderScene();
    });

    renderScene();
}

function introScene(svg) {
    svg.append("text")
       .attr("x", 400)
       .attr("y", 300)
       .attr("text-anchor", "middle")
       .style("font-size", "24px")
       .style("font-weight", "bold")
       .text("COVID-19 in the United States");

    svg.append("text")
       .attr("x", 400)
       .attr("y", 340)
       .attr("text-anchor", "middle")
       .style("font-size", "18px")
       .text("This visualization tells the story of the COVID-19 pandemic");

    svg.append("text")
       .attr("x", 400)
       .attr("y", 370)
       .attr("text-anchor", "middle")
       .style("font-size", "18px")
       .text("through data on cases and deaths across the United States.");

    svg.append("text")
       .attr("x", 400)
       .attr("y", 400)
       .attr("text-anchor", "middle")
       .style("font-size", "18px")
       .text("Click 'Next' to begin.");
}

function scene1(svg, data) {
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const g = svg.append("g")
                 .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width]);

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.cases)])
                .range([height, 0]);

    g.append("g")
     .attr("transform", `translate(0,${height})`)
     .call(d3.axisBottom(x));

    g.append("g")
     .call(d3.axisLeft(y).tickFormat(d3.format(",.0f"))); 

    g.append("path")
     .datum(data)
     .attr("fill", "none")
     .attr("stroke", "steelblue")
     .attr("stroke-width", 1.5)
     .attr("d", d3.line()
                  .x(d => x(d.date))
                  .y(d => y(d.cases)));

    g.append("text")
     .attr("x", width / 2)
     .attr("y", -2)
     .attr("text-anchor", "middle")
     .style("font-size", "16px")
     .text("Total COVID-19 Cases Over Time");

    const firstCase = data.find(d => d.cases > 0);
    const peakCase = data.reduce((prev, current) => (prev.cases > current.cases) ? prev : current);

    g.append("circle")
     .attr("cx", x(firstCase.date))
     .attr("cy", y(firstCase.cases))
     .attr("r", 5)
     .attr("fill", "red");

    g.append("text")
     .attr("x", x(firstCase.date) + 70)
     .attr("y", y(firstCase.cases) - 10)
     .attr("text-anchor", "middle")
     .style("font-size", "12px")
     .text(`First Case: ${d3.timeFormat("%B %d, %Y")(firstCase.date)}`)
     .style("fill", "black");

    g.append("circle")
     .attr("cx", x(peakCase.date))
     .attr("cy", y(peakCase.cases))
     .attr("r", 5)
     .attr("fill", "red");

    g.append("text")
     .attr("x", x(peakCase.date) - 90)
     .attr("y", y(peakCase.cases) + 20)
     .attr("text-anchor", "middle")
     .style("font-size", "12px")
     .text(`Peak Cases: ${d3.format(",")(peakCase.cases)} on ${d3.timeFormat("%B %d, %Y")(peakCase.date)}`)
     .style("fill", "black");
}

function scene2(svg, data) {
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const g = svg.append("g")
                 .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width]);

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.deaths)])
                .range([height, 0]);

    g.append("g")
     .attr("transform", `translate(0,${height})`)
     .call(d3.axisBottom(x));

    g.append("g")
     .call(d3.axisLeft(y).tickFormat(d3.format(",.0f")));

    g.append("path")
     .datum(data)
     .attr("fill", "none")
     .attr("stroke", "red")
     .attr("stroke-width", 1.5)
     .attr("d", d3.line()
                  .x(d => x(d.date))
                  .y(d => y(d.deaths)));

    g.append("text")
     .attr("x", width / 2)
     .attr("y", -2)
     .attr("text-anchor", "middle")
     .style("font-size", "16px")
     .text("Total COVID-19 Deaths Over Time");

    const firstDeath = data.find(d => d.deaths > 0);
    const peakDeath = data.reduce((prev, current) => (prev.deaths > current.deaths) ? prev : current);

    g.append("circle")
     .attr("cx", x(firstDeath.date))
     .attr("cy", y(firstDeath.deaths))
     .attr("r", 5)
     .attr("fill", "blue");

    g.append("text")
     .attr("x", x(firstDeath.date))
     .attr("y", y(firstDeath.deaths) - 10)
     .attr("text-anchor", "right")
     .style("font-size", "12px")
     .text(`First Death: ${d3.timeFormat("%B %d, %Y")(firstDeath.date)}`)
     .style("fill", "black");

    g.append("circle")
     .attr("cx", x(peakDeath.date))
     .attr("cy", y(peakDeath.deaths))
     .attr("r", 5)
     .attr("fill", "blue");

    g.append("text")
     .attr("x", x(peakDeath.date)-90)
     .attr("y", y(peakDeath.deaths)+20)
     .attr("text-anchor", "middle")
     .style("font-size", "12px")
     .text(`Peak Deaths: ${d3.format(",")(peakDeath.deaths)} on ${d3.timeFormat("%B %d, %Y")(peakDeath.date)}`)
     .style("fill", "black");
}


function scene3(svg, data) {
    const margin = { top: 50, right: 60, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const gCases = svg.append("g")
                      .attr("transform", `translate(${margin.left},${margin.top})`);

    const gDeaths = svg.append("g")
                       .attr("transform", `translate(${margin.left},${margin.top + height + margin.top})`);

    const nyData = data.filter(d => d.state === "New York");

    console.log(nyData);

    const x = d3.scaleTime()
                .domain(d3.extent(nyData, d => d.date))
                .range([0, width]);

    const yCases = d3.scaleLinear()
                     .domain([0, d3.max(nyData, d => d.cases)])
                     .range([height, 0]);

    const yDeaths = d3.scaleLinear()
                      .domain([0, d3.max(nyData, d => d.deaths)])
                      .range([height, 0]);

    gCases.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x));

    gCases.append("g")
          .call(d3.axisLeft(yCases).tickFormat(d3.format(",.0f"))); 

    gCases.append("path")
          .datum(nyData)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
                       .x(d => x(d.date))
                       .y(d => yCases(d.cases)));

    gCases.append("text")
          .attr("x", width / 2)
          .attr("y", -10)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .text("COVID-19 Cases in New York Over Time");

    gDeaths.append("g")
           .attr("transform", `translate(0,${height})`)
           .call(d3.axisBottom(x));

    gDeaths.append("g")
           .call(d3.axisLeft(yDeaths).tickFormat(d3.format(",.0f"))); 

    gDeaths.append("path")
           .datum(nyData)
           .attr("fill", "none")
           .attr("stroke", "red")
           .attr("stroke-width", 1.5)
           .attr("d", d3.line()
                        .x(d => x(d.date))
                        .y(d => yDeaths(d.deaths)));

    gDeaths.append("text")
           .attr("x", width / 2)
           .attr("y", -10)
           .attr("text-anchor", "middle")
           .style("font-size", "16px")
           .text("COVID-19 Deaths in New York Over Time");

    const lastDataPointCases = nyData[nyData.length - 1];
    const lastDataPointDeaths = nyData[nyData.length - 1];

    gCases.append("circle")
          .attr("cx", x(lastDataPointCases.date))
          .attr("cy", yCases(lastDataPointCases.cases))
          .attr("r", 5)
          .attr("fill", "red");

    gCases.append("text")
          .attr("x", x(lastDataPointCases.date))
          .attr("y", yCases(lastDataPointCases.cases) - 10)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .text(`Cases: ${lastDataPointCases.cases}`);

    gDeaths.append("circle")
           .attr("cx", x(lastDataPointDeaths.date))
           .attr("cy", yDeaths(lastDataPointDeaths.deaths))
           .attr("r", 5)
           .attr("fill", "blue");

    gDeaths.append("text")
           .attr("x", x(lastDataPointDeaths.date))
           .attr("y", yDeaths(lastDataPointDeaths.deaths) - 10)
           .attr("text-anchor", "middle")
           .style("font-size", "12px")
           .text(`Deaths: ${lastDataPointDeaths.deaths}`);
}

function scene4(svg, data, stateData) {
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const g = svg.append("g")
                 .attr("transform", `translate(${margin.left},${margin.top})`);

    const color = d3.scaleOrdinal()
                    .domain(["cases", "deaths"])
                    .range(["#98abc5", "#8a89a6"]);

    // Parse the date and sort data by date
    data.forEach(d => {
        d.date = new Date(d.date);
    });
    data.sort((a, b) => a.date - b.date);

    // Filter data to get the last date's values for each state
    const latestData = Array.from(d3.rollup(data, v => v[v.length - 1], d => d.state).values());

    latestData.sort((a, b) => b.cases - a.cases);
    const topStateData = latestData.slice(0, 25);

    const treemap = d3.treemap()
                      .size([width, height])
                      .padding(1);

    const root = d3.hierarchy({ values: topStateData }, d => d.values)
                   .sum(d => d.cases)
                   .sort((a, b) => b.value - a.value);

    treemap(root);

    const nodes = g.selectAll("g")
                   .data(root.leaves())
                   .enter()
                   .append("g")
                   .attr("transform", d => `translate(${d.x0},${d.y0})`);

    nodes.append("rect")
         .attr("id", d => d.data.state)
         .attr("width", d => d.x1 - d.x0)
         .attr("height", d => d.y1 - d.y0)
         .attr("fill", d => color(d.data.type));

    nodes.append("text")
         .attr("x", 3)
         .attr("y", 20)
         .text(d => d.data.state);

    const tooltip = d3.select("body")
                      .append("div")
                      .attr("class", "tooltip")
                      .style("position", "absolute")
                      .style("background", "#f4f4f4")
                      .style("padding", "5px")
                      .style("border", "1px solid #d4d4d4")
                      .style("border-radius", "3px")
                      .style("display", "none")
                      .style("pointer-events", "none");

    const formatNumber = d3.format(",");

    nodes.on("mouseover", function (event, d) {
        tooltip.style("display", "block")
               .html(`State: ${d.data.state}<br>Cases: ${formatNumber(d.data.cases)}<br>Deaths: ${formatNumber(d.data.deaths)}`);
    })
    .on("mousemove", function (event) {
        const tooltipWidth = parseInt(tooltip.style("width"));
        const tooltipHeight = parseInt(tooltip.style("height"));
        const xOffset = event.pageX + tooltipWidth > window.innerWidth ? -tooltipWidth - 10 : 10;
        const yOffset = event.pageY + tooltipHeight > window.innerHeight ? -tooltipHeight - 10 : 10;

        tooltip.style("top", `${event.pageY + yOffset}px`)
               .style("left", `${event.pageX + xOffset}px`);
    })
    .on("mouseout", function () {
        tooltip.style("display", "none");
    });

    g.append("text")
     .attr("x", width / 2)
     .attr("y", -2)
     .attr("text-anchor", "middle")
     .style("font-size", "16px")
     .text("Top 25 States by COVID-19 Cases and Deaths");
}

