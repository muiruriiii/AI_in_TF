document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.querySelector('#search-button');
  const searchInput = document.querySelector('#search-input');
  const resultContainer = document.querySelector('#sub-result1');
  const subdiagramContainer1 = document.querySelector('#sub-diagram1');
  const subdiagramContainer2 = document.querySelector('#sub-diagram2');
  const searchHistoryList = document.querySelector('#search-history-list');
  const clearHistoryBtn = document.querySelector('#clear-history-btn');
  const clearVisualizationBtn = document.querySelector('#clear-visualization-btn');
  const loaders = document.querySelectorAll('.loader-container');
  const autocompleteContainer = document.createElement('div');
  autocompleteContainer.id = 'autocomplete-container';
  searchInput.parentNode.insertBefore(autocompleteContainer, searchInput.nextSibling);


  searchInput.addEventListener('input', () => {
    const inputValue = searchInput.value.trim();
    if (inputValue === '') {
      clearResults();
      autocompleteContainer.innerHTML = '';
    } else {
      updateAutocompleteSuggestions(inputValue);
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const firstSuggestion = autocompleteContainer.querySelector('.autocomplete-suggestion');
      if (firstSuggestion) {
        searchInput.value = firstSuggestion.textContent;
        autocompleteContainer.innerHTML = '';
      }
      performSearch(searchInput.value.trim());
    }
  });

  const style = document.createElement('style');
style.textContent = `
  #autocomplete-container {
    position: absolute;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    background-color: white;
    border: 1px solid #ddd;
    border-top: none;
    z-index: 1000;
  }
  .autocomplete-suggestion {
    padding: 10px;
    cursor: pointer;
  }
  .autocomplete-suggestion:hover {
    background-color: #f0f0f0;
  }
`;
document.head.appendChild(style);

function addToSearchMemory(searchTerm) {
  let searchMemory = JSON.parse(localStorage.getItem('searchMemory')) || [];
  if (!searchMemory.includes(searchTerm)) {
    searchMemory.unshift(searchTerm);
    localStorage.setItem('searchMemory', JSON.stringify(searchMemory));
  }
}

function getSearchMemory() {
  return JSON.parse(localStorage.getItem('searchMemory')) || [];
}

  const fieldDisplayNames = {
    bank: {
      '_id': 'ID',
      'account_number': 'Account Number',
      'first_name': 'First Name',
      'last_name': 'Last Name',
      'email': 'Email Address',
      'SenderID': 'Sender ID',
      'phoneNumber': 'Phone Number',
      'gender': 'Gender',
      'reciever': 'Receiver',
      'reciever1': 'First Receiver',  
      'reciever2': 'Second Receiver',  
      'reciever3': 'Third Receiver',  
      'reciever4': 'Fourth Receiver',  
    },
    twitter: {
      '_id': 'ID',
      'UserName': 'Username',
      'Country': 'Country',
      'phoneNumber': 'Phone Number',
      'email': 'Email Address',
      'Tweet': 'Tweets',
      'Timestamp': 'Time',
    },
    call: {
       '_id': 'ID',
       'CallerID': 'Caller ID',
       'CallerName': 'Caller Name',
       'ReceiverID': 'Receiver ID',
       'ReceiverName': 'Receiver Name',
       'Caller_country': 'Caller Country',
       'Receiver_country': 'Receiver Country',
       'CallDuration': 'Call Duration',
       'TimeStamp': 'Time'
    },
    facebook: {
       '_id': 'ID',
       'Username': 'Username',
       'Email': 'Email',
       'Country': 'Country',
       'phoneNumber': 'Phone Number',
       'Post': 'Post'  
    },
    immigration: {
        '_id': 'ID',
        'Name': 'Full Name',
        'ID_Number': 'ID Number',
        'phoneNumber': 'Phone Number',
        'Flight_Number': 'Flight Number',
        'Departure_Country': 'Departure Country',
        'Arrival_Country': 'Arrival Country',
        'Date_and_Time_of_Departure': 'Date and Time of Departure',
        'Date_and_Time_of_Arrival': 'Date and Time of Arrival',
        'Reason_for_Travel': 'Reason for Travel'
    },
    sanctioned: {
         '_id': 'ID',
         'name': 'Name',
         'aliases': 'Aliases',
         'country_of-origin': 'Country of Origin',
         'email': 'Email',
         'leader': 'Leader',
         'date_of_sanction': 'Date of Sanction',
         'reason_for_sanction': 'Reason for sanction',
         'activities': 'Activities',
         'affiliations': 'Affiliations',
         'sanction_authority': 'Sanction Authority',
         'status': 'Status'
    }
  };

  function hideLoaders() {
    loaders.forEach(loader => {
        loader.style.display = 'none';
    });
  }

  function showLoaders() {
    loaders.forEach(loader => {
        loader.style.display = 'flex';
    });
  }

  hideLoaders();
  let searches = [];
  let deletedNodes = [];
  let currentSearchTerm = '';

  clearHistoryBtn.addEventListener('click', () => {
    clearSearchHistory();
    clearVisualization();
  });
  clearVisualizationBtn.addEventListener('click', clearVisualization);
  searchButton.addEventListener('click', () => performSearch(searchInput.value.trim()));

  searchInput.addEventListener('input', () => {
    if (searchInput.value.trim() === '') {
      clearResults();
    }
  });

  function clearResults() {
    resultContainer.innerHTML = '';
  }

  function clearVisualization() {
    searches = [];
    deletedNodes = [];
    d3.select('#sub-diagram1 svg').remove();
    d3.select('#sub-diagram2 svg').remove();
  }

  function fuzzyMatch(input, target) {
    input = input.toLowerCase();
    target = target.toLowerCase();
    let i = 0;
    let j = 0;
    while (i < input.length && j < target.length) {
      if (input[i] === target[j]) {
        i++;
      }
      j++;
    }
    return i === input.length;
  }
  
function updateAutocompleteSuggestions(input) {
  const searchMemory = getSearchMemory();
  const matchingTerms = searchMemory.filter(term => fuzzyMatch(input, term));
  
  const autocompleteContainer = document.querySelector('#autocomplete-container');
  autocompleteContainer.innerHTML = '';

  matchingTerms.forEach(term => {
    const suggestion = document.createElement('div');
    suggestion.classList.add('autocomplete-suggestion');
    suggestion.textContent = term;
    suggestion.addEventListener('click', () => {
      searchInput.value = term;
      autocompleteContainer.innerHTML = '';
      performSearch(term);
    });
    autocompleteContainer.appendChild(suggestion);
  });
}

  async function performSearch(searchTerm) {
    showLoaders();
    if (searchTerm === '') return;
  
    currentSearchTerm = searchTerm;
  
    deletedNodes = deletedNodes.filter(term => term !== searchTerm);
  
    addSearchToHistory(searchTerm);
    addToSearchMemory(searchTerm);
  
    try {
      const data = await fetchSearchResults(searchTerm);
      searches.push(data);
      createVisualization(searches);
      displayFormattedResults(data);
    } catch (error) {
      hideLoaders();
      console.error('Error fetching search results:', error);
      resultContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
  }

  function addSearchToHistory(searchTerm) {
    let searches = JSON.parse(localStorage.getItem('searchHistory')) || [];
    searches = searches.filter(term => term !== searchTerm);
    searches.unshift(searchTerm);
    if (searches.length > 10) {
      searches.pop();
    }
    localStorage.setItem('searchHistory', JSON.stringify(searches));
    addToSearchMemory(searchTerm); // Add to search memory as well
    renderSearchHistory();
  }

  function renderSearchHistory() {
    searchHistoryList.innerHTML = '';
    const searches = JSON.parse(localStorage.getItem('searchHistory')) || [];
    searches.forEach((term, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        ${term}
        <i class="fas fa-times delete-search" data-index="${index}"></i>
      `;
      li.querySelector('.delete-search').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteSearch(index);
      });
      li.addEventListener('click', () => performSearch(term));
      searchHistoryList.appendChild(li);
    });
  }

  function deleteSearch(index) {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const deletedTerm = searchHistory[index];
    searchHistory.splice(index, 1);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    renderSearchHistory();
    removeNodeFromSubdiagram2(deletedTerm);
    
    deletedNodes.push(deletedTerm);
    
    searches = searches.filter(search => !getInitialLabel(search.searchType, search.initialRecord).includes(deletedTerm));
  
    createVisualization(searches);
  }

  function removeNodeFromSubdiagram2(searchTerm) {
    const svg = d3.select('#sub-diagram2 svg');
    if (svg.empty()) return;
 
    const nodes = svg.selectAll('.nodes circle');
    const labels = svg.selectAll('.labels text');
    const links = svg.selectAll('.links path');
 
    const nodeToRemove = nodes.filter(d => d.label.includes(searchTerm));
    const labelToRemove = labels.filter(d => d.label.includes(searchTerm));
 
    if (nodeToRemove.empty()) return;
 
    deletedNodes.push(searchTerm);
    nodeToRemove.remove();
    labelToRemove.remove();
 
    links.filter(d => d.source.label.includes(searchTerm) || d.target.label.includes(searchTerm)).remove();
 
    const simulation = d3.select('#sub-diagram2 svg').datum();
    if (simulation) {
      simulation.nodes(simulation.nodes().filter(n => !n.label.includes(searchTerm)));
      simulation.force('link').links(simulation.force('link').links().filter(l => !l.source.label.includes(searchTerm) && !l.target.label.includes(searchTerm)));
      simulation.alpha(0.3).restart();
    }
  }

  function clearSearchHistory() {
    localStorage.removeItem('searchHistory');
    searchHistoryList.innerHTML = '';
  }

  async function fetchSearchResults(searchTerm) {
    //const response = await fetch('https://25f5-105-161-108-223.ngrok-free.app/search', {
    const response = await fetch('http://localhost:5500/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term: searchTerm })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }

    return response.json();
  }

  function createVisualization(allSearches) {
    console.log("Creating visualization");

    d3.select('#sub-diagram1 svg').remove();
    d3.select('#sub-diagram2 svg').remove();

    hideLoaders();
    createSubDiagram1(allSearches[allSearches.length - 1]);
    createSubDiagram2(allSearches);
  }

  function createSubDiagram1(data) {
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
 
  function createSubDiagram2(allSearches) {
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

 
  function displayFormattedResults(data) {
    resultContainer.innerHTML = '';
 
    const formattedResults = document.createElement('div');
    formattedResults.className = 'formatted-results';
 
    const initialRecord = document.createElement('div');
    initialRecord.className = 'initial-record';
    initialRecord.innerHTML = `<h3>Initial Search Record</h3>${formatRecord(data.initialRecord, data.searchType)}`;
    formattedResults.appendChild(initialRecord);

    const matchedRecords = [
      { name: 'Bank Records', data: data.matchedBankRecords, formatter: formatBankRecord },
      { name: 'Twitter Data', data: data.matchedTwitterData, formatter: formatTwitterRecord },
      { name: 'Call Records', data: data.matchedCallRecords, formatter: formatCallRecord },
      { name: 'Sanctioned Data', data: data.matchedSanctionedData, formatter: formatSanctionedRecord },
      { name: 'Facebook Data', data: data.matchedFacebookData, formatter: formatFacebookRecord },
      { name: 'Immigration Data', data: data.matchedImmigrationData, formatter: formatImmigrationRecord },
      { name: 'Import and Export Data', data: data.matchedImportExportData, formatter: formatImportExportRecord }
    ];

    matchedRecords.forEach(recordType => {
      if (recordType.data && recordType.data.length > 0) {
        const recordContainer = document.createElement('div');
        recordContainer.className = 'matched-records';
        recordContainer.innerHTML = `<h3>${recordType.name}</h3>`;
        recordType.data.forEach(record => {
          recordContainer.innerHTML += recordType.formatter(record);
        });
        formattedResults.appendChild(recordContainer);
      }
    });

    resultContainer.appendChild(formattedResults);
  }

  function haveCommonData(search1, search2) {
    return search1.initialRecord.phoneNumber === search2.initialRecord.phoneNumber ||
           search1.initialRecord.email === search2.initialRecord.email ||
           search1.initialRecord.account_number === search2.initialRecord.account_number;
  }

  function getInitialLabel(searchType, initialRecord) {
    switch (searchType) {
      case 'email':
        return `Email: ${initialRecord.email}`;
      case 'phone':
        return `Phone: ${initialRecord.phoneNumber}`;
      case 'account_number':
        return `Account Number: ${initialRecord.account_number}`;
      case 'SenderID':
        return `Sender ID: ${initialRecord.SenderID}`;
      default:
        return 'Search Term';
    }
  }

  function getLabelForRecord(nodeId, record, index) {
    switch (nodeId) {
      case 'bank':
        return `${record.first_name} ${record.last_name}`;
      case 'twitter':
        return `@${record.UserName}`;
      case 'call':
        return `${record.ReceiverName}`;
      case 'sanctioned':
        return record.name;
      case 'facebook':
        return record.Username;
      case 'immigration':
        return `${record.Name} (${record.Departure_Country} to ${record.Arrival_Country})`;
      case 'importExport':
        return `${record.Commodity} (${record.year})`;
      default:
        return `Record ${index + 1}`;
    }
  }

  function formatInitialRecord(record) {
    if (!record) return '<p>No record found</p>';
 
    let html = '<div class="record">';
    for (let [key, value] of Object.entries(record)) {
      let displayName;
      if (key === 'email' || key === 'phoneNumber' || key === 'account_number' || key === 'SenderID') {
        displayName = fieldDisplayNames.bank[key] || key;
      } else {
        // For other fields, try to find a match in any of the fieldDisplayNames objects
        displayName = Object.values(fieldDisplayNames).reduce((acc, curr) => {
          return acc || curr[key] || key;
        }, null);
      }
      html += `<p><strong>${displayName}:</strong> ${value}</p>`;
    }
    html += '</div>';
    return html;
  }

  function createCallDurationHistogram(callRecords) {
    const subResult2 = document.querySelector('#sub-result2');
    
    // Create SVG
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = subResult2.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
  
    const svg = d3.select('#sub-result2')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    // Process data
    const durations = callRecords.map(record => parseInt(record.CallDuration));
    const binCount = 10;
    const bins = d3.histogram()
      .domain(d3.extent(durations))
      .thresholds(binCount)
      (durations);
  
    // Set up scales
    const x = d3.scaleLinear()
      .domain([bins[0].x0, bins[bins.length - 1].x1])
      .range([0, width]);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height, 0]);
  
    // Create bars
    svg.selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', d => x(d.x0) + 1)
      .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr('y', d => y(d.length))
      .attr('height', d => height - y(d.length))
      .attr('fill', 'steelblue');
  
    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));
  
    // Add y-axis
    svg.append('g')
      .call(d3.axisLeft(y));
  
    // Add labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom)
      .attr('text-anchor', 'middle')
      .text('Call Duration (seconds)');
  
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left)
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .text('Frequency');
  
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 0 - (margin.top / 2))
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Call Duration Histogram');
  }
  function createCallBarChart(callRecords) {
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

  function createTwitterBarChart(twitterData) {
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

  function showDetailedInfo(node) {
    const subResult1 = document.querySelector('#sub-result1');
    const subResult2 = document.querySelector('#sub-result2');
    
    subResult1.innerHTML = '';
    subResult2.innerHTML = '';
  
    if (node.id === 'call') {
      if (Array.isArray(node.data)) {
        const detailedInfo = formatMultipleRecords(node.id, node.data);
        const detailContainer = document.createElement('div');
        detailContainer.innerHTML = `<h3>${node.label} Details</h3>${detailedInfo}`;
        subResult1.appendChild(detailContainer);
  
        createCallBarChart(node.data);
      }
    } else if (node.id === 'twitter') {
      if (Array.isArray(node.data)) {
        const detailedInfo = formatMultipleRecords(node.id, node.data);
        const detailContainer = document.createElement('div');
        detailContainer.innerHTML = `<h3>${node.label} Details</h3>${detailedInfo}`;
        subResult1.appendChild(detailContainer);
  
        createTwitterBarChart(node.data);
      }
    } else {
      let detailedInfo = '';
      if (node.id === 'initial' || node.id.startsWith('initial-')) {
        detailedInfo = formatInitialRecord(node.data);
      } else if (Array.isArray(node.data)) {
        detailedInfo = formatMultipleRecords(node.id, node.data);
      } else {
        detailedInfo = formatSingleRecord(node.id, node.data);
      }
      const detailContainer = document.createElement('div');
      detailContainer.innerHTML = `<h3>${node.label} Details</h3>${detailedInfo}`;
      subResult1.appendChild(detailContainer);
    }
  }

  function formatMultipleRecords(nodeId, records) {
    let html = '<div class="record-list">';
    records.forEach(record => {
      html += formatSingleRecord(nodeId, record);
    });
    html += '</div>';
    return html;
  }

  function formatBankRecord(record) {
    return formatRecord(record, 'bank');
  }
 
  function formatTwitterRecord(record) {
    return formatRecord(record, 'twitter');
  }
 
  function formatCallRecord(record) {
    return formatRecord(record, call);
  }

  function formatFacebookRecord(record) {
    return formatRecord(record, facebook);
  }

  function formatImmigrationRecord(record) {
    return formatRecord(record, immigration);
  }

  function formatSanctionedRecord(record) {
    return formatRecord(record, sanctioned)
  }

  function formatSingleRecord(nodeId, record) {
    if (nodeId === 'initial' || nodeId.startsWith('initial-')) {
      return formatInitialRecord(record);
    }
    switch (nodeId) {
      case 'bank':
        return formatBankRecord(record);
      case 'call':
        return formatCallRecord(record);
      case 'twitter':
        return formatTwitterRecord(record);
      case 'sanctioned':
        return formatSanctionedRecord(record);
      case 'facebook':
        return formatFacebookRecord(record);
      case 'immigration':
        return formatImmigrationRecord(record);
      case 'importExport':
        return formatImportExportRecord(record);
      default:
        return formatRecord(record);
    }
  }

  function getDisplayName(recordType, field) {
    if (recordType === 'email' || recordType === 'phone' || recordType === 'account_number' || recordType === 'SenderID') {
      return fieldDisplayNames['bank'][field] || field;
    }
    return fieldDisplayNames[recordType] && fieldDisplayNames[recordType][field]
      ? fieldDisplayNames[recordType][field]
      : field;
  }

  function formatRecord(record, recordType) {
    if (!record) return '<p>No record found</p>';
 
    let html = '<div class="record">';
    for (let [key, value] of Object.entries(record)) {
      const displayName = getDisplayName(recordType, key);
      html += `<p><strong>${displayName}:</strong> ${value}</p>`;
    }
    html += '</div>';
    return html;
  }

  function formatBankRecord(record) {
    if (!record) return '<p>No record found</p>';
 
    const fieldsToShow = ['_id', 'first_name', 'last_name', 'account_number', 'email', 'phoneNumber', 'SenderID', 'gender'];
    let html = '<div class="record">';
   
    fieldsToShow.forEach(field => {
      if (record[field] !== undefined) {
        const displayName = fieldDisplayNames.bank[field] || field;
        html += `<p><strong>${displayName}:</strong> ${record[field]}</p>`;
      }
    });
   
    html += '</div>';
    return html;
  }
  function formatImmigrationRecord(record) {
    if (!record) return '<p>No record found</p>';

    let html = '<div class="record">';
    html += `<p><strong>Name:</strong> ${record.Name}</p>`;
    html += `<p><strong>Departure Country: </strong> ${record.Departure_Country}</p>`;
    html += `<p><strong>Arrival Country: </strong> ${record.Arrival_Country}</p>`;
    html += `<p><strong>Reason for Travel: </strong> ${record.Reason_for_Travel}</p>`;
    html += '</div>';
    return html;
  }

  function formatCallRecord(record) {
    if (!record) return '<p>No record found</p>';

    let html = '<div class="record">';
    html += `<p><strong>Caller:</strong> ${record.CallerName} (ID: ${record.CallerID})</p>`;
    html += `<p><strong>Receiver:</strong> ${record.ReceiverName} (ID: ${record.ReceiverID})</p>`;
    html += `<p><strong>Time:</strong> ${record.TimeStamp}</p>`;
    html += `<p><strong>Duration:</strong> ${record.CallDuration} seconds</p>`;
    html += '</div>';
    return html;
  }

  function formatTwitterRecord(record) {
    if (!record) return '<p>No record found</p>';

    let html = '<div class="record">';
    html += `<p><strong>Username:</strong> ${record.UserName}</p>`;
    html += `<p><strong>Country:</strong> ${record.Country}</p>`;
    html += `<p><strong>Phone:</strong> ${record.phoneNumber}</p>`;
    html += `<p><strong>Email:</strong> ${record.email}</p>`;
    html += `<p><strong>Tweet:</strong> ${record.Tweet.join(', ')}</p>`;
    html += `<p><strong>Timestamp:</strong> ${record.Timestamp}</p>`;
    html += '</div>';
    return html;
  }

  function formatSanctionedRecord(record) {
    if (!record) return '<p>No record found</p>';

    let html = '<div class="record">';
    html += `<p><strong>Name:</strong> ${record.name}</p>`;
    html += `<p><strong>Aliases:</strong> ${record.aliases.join(', ')}</p>`;
    html += `<p><strong>Country of Origin:</strong> ${record.country_of_origin}</p>`;
    html += `<p><strong>Email:</strong> ${record.email}</p>`;
    html += `<p><strong>Leader:</strong> ${record.leader}</p>`;
    html += `<p><strong>Date of Sanction:</strong> ${record.date_of_sanction}</p>`;
    html += `<p><strong>Reason for Sanction:</strong> ${record.reason_for_sanction}</p>`;
    html += `<p><strong>Activities:</strong> ${record.activities}</p>`;
    html += `<p><strong>Affiliations:</strong> ${record.affiliations.join(', ')}</p>`;
    html += `<p><strong>Sanctioning Authority:</strong> ${record.sanctioning_authority}</p>`;
    html += `<p><strong>Status:</strong> ${record.status}</p>`;
    html += '</div>';
    return html;
  }

  function formatFacebookRecord(record) {
    if (!record) return '<p>No record found</p>';

    let html = '<div class="record">';
    html += `<p><strong>Username:</strong> ${record.Username}</p>`;
    html += `<p><strong>Email:</strong> ${record.Email}</p>`;
    html += `<p><strong>Country:</strong> ${record.Country}</p>`;
    html += `<p><strong>Phone:</strong> ${record.phoneNumber}</p>`;
    html += `<p><strong>Post:</strong> ${record.Post}</p>`;
    html += '</div>';
    return html;
  }

  function formatImportExportRecord(record) {
    if (!record) return '<p>No record found</p>';

    let html = '<div class="record">';
    html += `<p><strong>HSCode:</strong> ${record.HSCode}</p>`;
    html += `<p><strong>Commodity:</strong> ${record.Commodity}</p>`;
    html += `<p><strong>Value:</strong> ${record.value}</p>`;
    html += `<p><strong>Origin Country:</strong> ${record.Origin_Country}</p>`;
    html += `<p><strong>Year:</strong> ${record.year}</p>`;
    html += `<p><strong>Supplier Entity:</strong> ${record.Supplier_Entity}</p>`;
    html += `<p><strong>Contact Phone Number:</strong> ${record.Contact_phone_number}</p>`;

    html += '</div>';
    return html;
  }
});

