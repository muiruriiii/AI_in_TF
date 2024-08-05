export function displayFormattedResults(data) {
    const resultContainer = document.querySelector('#sub-result1');
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
  
  export function formatRecord(record, recordType) {
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
