d3.csv("data.csv").then(data => {
    // Parse data
    data.forEach(d => {
        d.date = new Date(d.date);
        d.cases = +d.cases;
        d.deaths = +d.deaths;
    });

    // Initialize visualization
    initVisualization(data);
});

function initVisualization(data) {
    const svg = d3.select("#visualization")
                  .append("svg")
                  .attr("width", 800)
                  .attr("height", 600);

    let currentScene = 0;
    const scenes = [scene1, scene2, scene3]; // Add more scenes as needed

    function renderScene() {
        svg.selectAll("*").remove(); // Clear the SVG
        scenes[currentScene](svg, data);
    }

    d3.select("#prev").on("click", () => {
        currentScene = (currentScene > 0) ? currentScene - 1 : scenes.length - 1;
        renderScene();
    });

    d3.select("#next").on("click", () => {
        currentScene = (currentScene < scenes.length - 1) ? currentScene + 1 : 0;
        renderScene();
    });

    renderScene();
}

function scene1(svg, data) {
    // Example: Plot total cases over time
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
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
     .call(d3.axisLeft(y));

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
     .attr("y", -10)
     .attr("text-anchor", "middle")
     .style("font-size", "16px")
     .text("Total Covid-19 Cases Over Time");
}

function scene2(svg, data) {
    // Example: Plot total deaths over time
    // Similar structure to scene1 but plotting deaths
}

function scene3(svg, data) {
    // Example: Comparison between states or any other visualization
}
