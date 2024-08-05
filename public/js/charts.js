export function createSubDiagram1(data) {
    console.log("Creating sub-diagram1 visualization");
 
    d3.select('#sub-diagram1 svg').remove();
 
    const subdiagramDiv1 = document.querySelector('#sub-diagram1');
    const width = subdiagramDiv1.clientWidth;
    const height = subdiagramDiv1.clientHeight;
 
    const svg = d3.select('#sub-diagram1')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`);
 
    const initialLabel = getInitialLabel(data.searchType, data.initialRecord);
 
    const nodes = [
      { id: 'initial', label: initialLabel, color: '#000000', data: data.initialRecord, type: 'initial' },
      { id: 'bank', label: 'Bank Records', color: '#d93954', data: data.matchedBankRecords },
      { id: 'twitter', label: 'X Data', color: '#d04a02', data: data.matchedTwitterData },
      { id: 'call', label: 'Call Records', color: '#d62728', data: data.matchedCallRecords },
      { id: 'sanctioned', label: 'Sanctioned Data', color: '#ff9900', data: data.matchedSanctionedData },
      { id: 'facebook', label: 'Facebook Data', color: '#1877f2', data: data.matchedFacebookData },
      { id: 'immigration', label: 'Immigration Data', color: '#2ca02c', data: data.matchedImmigrationData },
      { id: 'importExport', label: 'Import and Export Data', color: '#9467bd', data: data.matchedImportExportData }
    ];
 
    const links = nodes.slice(1).map(node => ({ source: 'initial', target: node.id, count: node.data.length }));
 
    let simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(125))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));
 
    updateVisualization();
 
    function updateVisualization() {
      svg.selectAll('*').remove();
 
      const link = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', d => Math.sqrt(d.count));
 
      const linkLabels = svg.append('g')
        .selectAll('text')
        .data(links)
        .enter().append('text')
        .attr('font-size', 12)
        .attr('fill', '#666')
        .text(d => d.count);
 
      const node = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', d => d.expanded ? 30 : 20)
        .attr('fill', d => d.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .call(drag(simulation));
 
      const label = svg.append('g')
        .selectAll('text')
        .data(nodes)
        .enter().append('text')
        .text(d => d.label)
        .attr('font-size', 12)
        .attr('dx', 15)
        .attr('dy', 4);
 
      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
 
        linkLabels
          .attr('x', d => (d.source.x + d.target.x) / 2)
          .attr('y', d => (d.source.y + d.target.y) / 2);
 
        node
          .attr('cx', d => Math.max(20, Math.min(width - 20, d.x)))
          .attr('cy', d => Math.max(20, Math.min(height - 20, d.y)));
 
        label
          .attr('x', d => Math.max(20, Math.min(width - 20, d.x)))
          .attr('y', d => Math.max(20, Math.min(height - 20, d.y)));
      });
 
      node.on('click', (event, d) => {
        showDetailedInfo(d);
      });
 
      node.on('mouseover', function(event, d) {
        d3.select(this).transition()
          .duration(300)
          .attr('r', d => d.expanded ? 35 : 25);
      }).on('mouseout', function(event, d) {
        d3.select(this).transition()
          .duration(300)
          .attr('r', d => d.expanded ? 30 : 20);
      });
    }
 
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
 
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
 
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
 
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }
  
  export function createSubDiagram2(allSearches) {
    console.log("Creating sub-diagram2 visualization");
 
    d3.select('#sub-diagram2 svg').remove();
 
    const subdiagramDiv2 = document.querySelector('#sub-diagram2');
    const width = subdiagramDiv2.clientWidth;
    const height = subdiagramDiv2.clientHeight;
 
    const svg = d3.select('#sub-diagram2')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
 
    const nodes = [];
    const links = [];
 
    allSearches.forEach((search, index) => {
      const initialLabel = getInitialLabel(search.searchType, search.initialRecord);
      const initialNodeColor = (search.matchedSanctionedData && search.matchedSanctionedData.length > 0) ? '#ff4136' : '#2ecc40';
      const initialNodeId = `initial-${index}`;
 
      if (!deletedNodes.includes(initialLabel) || initialLabel.includes(currentSearchTerm)) {
        const nodeSize = 20;
  
        nodes.push({
          id: initialNodeId,
          label: initialLabel,
          color: initialNodeColor,
          data: search.initialRecord,
          size: nodeSize,
          storedSize: nodeSize,
          totalLinks: 0  
        });
      }
    });
 

    for (let i = 0; i < allSearches.length; i++) {
      for (let j = i + 1; j < allSearches.length; j++) {
        const sourceLabel = getInitialLabel(allSearches[i].searchType, allSearches[i].initialRecord);
        const targetLabel = getInitialLabel(allSearches[j].searchType, allSearches[j].initialRecord);
  
        if ((!deletedNodes.includes(sourceLabel) && !deletedNodes.includes(targetLabel)) ||
            sourceLabel.includes(currentSearchTerm) || targetLabel.includes(currentSearchTerm)) {
          if (haveCommonData(allSearches[i], allSearches[j])) {
            links.push({
              source: `initial-${i}`,
              target: `initial-${j}`,
              color: i === 0 || j === 0 ? '#1E90FF' : '#999'
            });
            
            if (i === 0 || j === 0) {
              const firstNode = nodes.find(n => n.id === 'initial-0');
              if (firstNode) {
                firstNode.size += 5;
                firstNode.storedSize += 5;
                firstNode.totalLinks += 1;
              }
            }
          }
        }
      }
    }
  
  
 
    const radius = Math.min(width, height) / 3;
 
    const radialForce = d3.forceRadial(radius, 0, 0)
      .strength(node => node.totalLinks === 0 ? 0.1 : 0.01);
 
      let simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100).strength(1))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(0, 0).strength(0.1))
      .force('collision', d3.forceCollide().radius(30))
      .force('radial', radialForce);
 
    svg.datum(simulation);
 
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(links)
      .enter().append('path')
      .attr('stroke', d => d.color)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('fill', 'none');
 
    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', d => d.storedSize)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .call(drag(simulation));
 
    const label = svg.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(d => d.label)
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .attr('dy', 30);
 
    simulation.on('tick', () => {
      link.attr('d', d => {
        const dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });
 
      node
        .attr('cx', d => Math.max(-width/2 + 20, Math.min(width/2 - 20, d.x)))
        .attr('cy', d => Math.max(-height/2 + 20, Math.min(height/2 - 20, d.y)));
 
      label
        .attr('x', d => Math.max(-width/2 + 20, Math.min(width/2 - 20, d.x)))
        .attr('y', d => Math.max(-height/2 + 20, Math.min(height/2 - 20, d.y)));
    });
 
    node.on('click', (event, d) => {
      showDetailedInfo(d);
    });
 
    node.on('mouseover', function (event, d) {
      d3.select(this).transition().duration(300).attr('r', d.storedSize + 5);
      if (d.id === 'initial-0') {
        d3.select(this).append('title').text(`There are: ${d.totalLinks} connections`);
      }
    });
 
    node.on('mouseout', function (event, d) {
      d3.select(this).transition().duration(300).attr('r', d.storedSize);
      d3.select(this).select('title').remove();
    });
 
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
 
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
 
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
 
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }
  
  export function createCallBarChart(callRecords) {
    const subResult2 = document.querySelector('#sub-result2');
    
    // Create SVG
    const margin = {top: 20, right: 20, bottom: 70, left: 60};
    const width = subResult2.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select('#sub-result2')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    // Process data
    const data = callRecords.map(record => ({
      CallerID: record.CallerName,
      CallDuration: parseInt(record.CallDuration),
      ReceiverID: record.ReceiverName
    }));
  
    // Set up scales
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.CallerID))
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.CallDuration)])
      .range([height, 0]);
  
    // Create bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.CallerID))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.CallDuration))
      .attr('height', d => height - y(d.CallDuration))
      .attr('fill', '#D04A02');
  
    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');
  
    // Add y-axis
    svg.append('g')
      .call(d3.axisLeft(y));
  
    // Add labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .text('Caller Name');
  
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 20)
      .attr('text-anchor', 'middle')
      .text('Call Duration (seconds)');
  
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 0 - (margin.top / 2))
      .attr('text-anchor', 'middle')
      .style('font-size', '16px');
      
  
    // Add hover effect
    const tooltip = d3.select('#sub-result2')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '1px')
      .style('border-radius', '5px')
      .style('padding', '10px');
  
    svg.selectAll('.bar')
      .on('mouseover', function(event, d) {
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
          tooltip.html(`
            <strong>Receiver Name:</strong> ${d.ReceiverID}<br>
            <strong>Call Duration:</strong> ${d.CallDuration} seconds
          `)
          .style('left', (event.pageX) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function(d) {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
  }
  
  export function createTwitterBarChart(twitterData) {
    const subResult2 = document.querySelector('#sub-result2');
    
    // Create SVG
    const margin = {top: 20, right: 20, bottom: 100, left: 100};
    const width = subResult2.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select('#sub-result2')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    // Process data
    const data = twitterData.map(record => ({
      UserName: record.UserName,
      Timestamp: new Date(record.Timestamp),
      Tweet: Array.isArray(record.Tweet) ? record.Tweet.join(', ') : record.Tweet
    })).sort((a, b) => a.Timestamp - b.Timestamp);
  
    // Set up scales
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.UserName))
      .padding(0.1);
  
    const y = d3.scaleTime()
      .range([height, 0])
      .domain(d3.extent(data, d => d.Timestamp));
  
    // Create bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.UserName))
      .attr('y', d => y(d.Timestamp))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.Timestamp))
      .attr('fill', 'steelblue');
  
    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');
  
    // Add y-axis
    svg.append('g')
      .call(d3.axisLeft(y));
  
    // Add labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 20)
      .attr('text-anchor', 'middle')
      .text('Username');
  
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 20)
      .attr('text-anchor', 'middle')
      .text('Timestamp');
  
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 0 - (margin.top / 2))
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Twitter Activity by User');
  
    // Add hover effect
    const tooltip = d3.select('#sub-result2')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '1px')
      .style('border-radius', '5px')
      .style('padding', '10px');
  
    svg.selectAll('.bar')
      .on('mouseover', function(event, d) {
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        tooltip.html(`
          <strong>Username:</strong> ${d.UserName}<br>
          <strong>Timestamp:</strong> ${d.Timestamp.toLocaleString()}<br>
          <strong>Tweet:</strong> ${d.Tweet}
        `)
          .style('left', (event.pageX) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function(d) {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
  }