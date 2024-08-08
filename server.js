const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 5500;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static JavaScript file
app.get('/js/script.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'public/js/script.js'));
});

// MongoDB connection
mongoose.connect('mongodb+srv://muiruricynthiaaa:Y9Wh0wgDWJVRMr7g@tfc.ifktyna.mongodb.net/AI_in_TF', {
//mongoose.connect('mongodb://localhost:27017/AI_in_tf', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('MongoDB connected');
  await testConnection();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});



// Define MongoDB schemas
const twitterSchema = new mongoose.Schema({
  UserName: String,
  Country: String,
  phoneNumber: Number,
  Tweet: [String],
  Timestamp: String,
  email: String,
  IP_Address: String
}, { collection: 'Twitter_data' });

const cryptocurrencySchema = new mongoose.Schema({
  
Transaction_ID: String,
Timestamp: Number,
Sender_Address: String,
Recipient_Address: String,
Amount: Number,
Transaction_Fee: Number,
Block_Number: Number,
Inputs: String,
Outputs: String,
Signature: String,
ScriptPubKey: String,
ScriptSig: String,
Confirmations: Number,
IP_Address: String
}, { collection: 'Cryptocurrency_data' });


const immigrationSchema = new mongoose.Schema({
  Name: String,
  ID_Number: Number,
  phoneNumber: Number,
  Flight_Number: String,
  Departure_Country: String,
  Arrival_Country: String,
  Date_and_Time_of_Departure: String,
  Date_and_Time_of_Arrival: String,
  Reason_for_Travel: String
}, {collection: 'Immigration'});

const sanctionedSchema = new mongoose.Schema({
  name: String,
  aliases: [String],
  country_of_origin: String,
  email: String,
  Leader: String,
  date_of_sanction: String,
  reason_for_sanction: String,
  activities: String,
  affiliations: [String],
  sanctioning_authority: String,
  status: String,
}, { collection: 'Sanctioned_list' });

const bankSchema = new mongoose.Schema({
  account_number: Number,
  first_name: String,
  last_name: String,
  Name: String,
  email: String,
  SenderID: Number,
  gender: String,
  phoneNumber: Number,
  Country: String,
  receiver: Number,
  receiver1: Number,
  receiver2: Number,
  receiver3: Number,
  receiver4: Number
}, { collection: 'Bank_information' });

const callSchema = new mongoose.Schema({
  CallerID: Number,
  CallerName: String,
  ReceiverID: Number,
  ReceiverName: String,
  TimeStamp: String,
  Caller_country: String,
  Receiver_Country: String,
  CallDuration: Number
}, { collection: 'Call_records' });

const facebookSchema = new mongoose.Schema({
  Username: String,
  Email: String,
  Country: String,
  phoneNumber: Number,
  Post: String
}, { collection: 'Facebook_data' });

const importExportSchema = new mongoose.Schema({
  HSCode: Number,
  Commodity: String,
  value: Number,
  Origin_Country: String,
  year: Number,
  Supplier_Entity: String,
  Contact_phone_number: Number
}, {collection: 'Import_Export_data'});

// Define MongoDB models
const Twitter = mongoose.model('Twitter', twitterSchema);
const Sanctioned = mongoose.model('Sanctioned', sanctionedSchema);
const Immigration = mongoose.model('Immigration', immigrationSchema);
const Bank = mongoose.model('Bank', bankSchema);
const Call = mongoose.model('Call', callSchema);
const Facebook = mongoose.model('Facebook', facebookSchema);
const ImportExport = mongoose.model('ImportExport', importExportSchema);
const Cryptocurrency = mongoose.model('Cryptocurrency', cryptocurrencySchema);

// Test connection function
const testConnection = async () => {
  try {

    const collections = ['Bank_information', 'Twitter_data', 'Sanctioned_list', 'Call_records', 'Facebook_data', 'Immigration', 'Import_Export_data', 'Cryptocurrency_data'];
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection).countDocuments();
      console.log(`Number of documents in ${collection}: ${count}`);
    }

  } catch (error) {
    console.error('Error testing database connection:', error);
  }
};


// D3.js library visualization
app.get('/js/d3.v7.min.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  fs.readFile(path.join(__dirname, 'public/js/d3.v7.min.js'), (err, data) => {
    if (err) {
      res.status(500).send('Error loading D3 library');
    } else {
      res.send(data);
    }
  });
});


app.post('/search', async (req, res) => {
  const searchTerm = req.body.term;
  console.log('Received search term:', searchTerm);

  try {
    // Determine the search type 
    const searchType = await determineSearchType(searchTerm);

    let initialRecord = null;
    let matchedBankRecords = [];
    let matchedCallRecords = [];
    let matchedTwitterData = [];
    let matchedSanctionedData = [];
    let matchedFacebookData = [];
    let matchedImmigrationData = [];
    let matchedImportExportData = [];
    let matchedCryptocurrencyData = [];


    // Initial search 
    switch (searchType) {
      case 'email':
        initialRecord = await Bank.findOne({ email: searchTerm }) ||
                        await Twitter.findOne({ email: searchTerm }) ||
                        await Sanctioned.findOne({ email: searchTerm }) ||
                        await Facebook.findOne({ Email: searchTerm });
        break;
      case 'account_number':
        initialRecord = await Bank.findOne({ account_number: parseInt(searchTerm, 10) });
        break;

        case 'IP_Address':
          initialRecord = await Twitter.findOne({ IP_Address: parseInt(searchTerm, 10) });
                          await Cryptocurrency.findOne({ IP_Address: parseInt(searchTerm, 10) });
          break;
      case 'SenderID':
        initialRecord = await Bank.findOne({ SenderID: parseInt(searchTerm, 10) }) ||
                        await Immigration.findOne({ ID_Number: parseInt(searchTerm, 10) })   
        break;
      case 'phone':
        initialRecord = await Bank.findOne({ phoneNumber: searchTerm }) ||
                        await Twitter.findOne({ phoneNumber: searchTerm }) ||
                        await Call.findOne({ $or: [{ CallerID: searchTerm }, { ReceiverID: searchTerm }] }) ||
                        await Facebook.findOne({ phoneNumber: searchTerm }) ||
                        await ImportExport.findOne({ Contact_phone_number: searchTerm });
        break;
        case 'name':
          // New name search logic
          initialRecord = await Bank.findOne({
            $or: [
              { first_name: { $regex: searchTerm, $options: 'i' } },
              { last_name: { $regex: searchTerm, $options: 'i' } },
              { Name: { $regex: searchTerm, $options: 'i' } }
            ] }) ||
                          await Twitter.findOne({ UserName: { $regex: searchTerm, $options: 'i' } }) ||
                          await Call.findOne({ 
                            $or: [
                              { CallerName: { $regex: searchTerm, $options: 'i' } },
                              { ReceiverName: { $regex: searchTerm, $options: 'i' } }
                            ]
                          }) ||
                          await Sanctioned.findOne({ name: { $regex: searchTerm, $options: 'i' } }) ||
                          await Facebook.findOne({ Username: { $regex: searchTerm, $options: 'i' } });
          
          break;
      default:
        res.status(400).json({ error: 'Invalid search term' });
        return;
    }

    if (initialRecord) {
      // Use the found record's details for further searching
      const searchCriteria = {
        $or: [
          { phoneNumber: initialRecord.phoneNumber || initialRecord.CallerID || initialRecord.ReceiverID || initialRecord.Contact_phone_number },          { account_number: initialRecord.account_number },
          { SenderID: initialRecord.SenderID },
          { first_name: { $regex: initialRecord.first_name || initialRecord.last_name || initialRecord.UserName || initialRecord.CallerName || initialRecord.ReceiverName || initialRecord.name || initialRecord.Username || initialRecord.Name, $options: 'i' } },
          { last_name: { $regex: initialRecord.first_name || initialRecord.last_name || initialRecord.UserName || initialRecord.CallerName || initialRecord.ReceiverName || initialRecord.name || initialRecord.Username || initialRecord.Name, $options: 'i' } },
          { Name: { $regex: initialRecord.first_name || initialRecord.last_name || initialRecord.UserName || initialRecord.CallerName || initialRecord.ReceiverName || initialRecord.name || initialRecord.Username || initialRecord.Name, $options: 'i' } }

        ]
      };

      // Search in Bank data
      matchedBankRecords = await Bank.find(searchCriteria);

      // Search in Call records
      matchedCallRecords = await Call.find({
        $or: [
          { CallerID: initialRecord.phoneNumber || initialRecord.CallerID || initialRecord.ReceiverID || initialRecord.Contact_phone_number},
          { ReceiverID: initialRecord.phoneNumber || initialRecord.CallerID || initialRecord.ReceiverID || initialRecord.Contact_phone_number},
          { CallerName: { $regex: initialRecord.first_name || initialRecord.last_name || initialRecord.UserName || initialRecord.CallerName || initialRecord.ReceiverName || initialRecord.name || initialRecord.Username || initialRecord.Name, $options: 'i' } },
          { ReceiverName: { $regex: initialRecord.first_name || initialRecord.last_name || initialRecord.UserName || initialRecord.CallerName || initialRecord.ReceiverName || initialRecord.name || initialRecord.Username || initialRecord.Name, $options: 'i' } }
        ]
      });

      // Search in Twitter data
      matchedTwitterData = await Twitter.find({
        $or: [
          { phoneNumber: initialRecord.phoneNumber || initialRecord.CallerID || initialRecord.ReceiverID || initialRecord.Contact_phone_number },
          { email: initialRecord.email },
          { UserName: { $regex: initialRecord.first_name || initialRecord.last_name || initialRecord.UserName || initialRecord.CallerName || initialRecord.ReceiverName || initialRecord.name || initialRecord.Username || initialRecord.Name, $options: 'i' } },
          { IP_Address: initialRecord.IP_Address}
        ]
      });

      // Search in Sanctioned data
      matchedSanctionedData = await Sanctioned.find({
        $or: [
          { email: initialRecord.email },
          { name: { $regex: initialRecord.first_name || initialRecord.last_name || initialRecord.UserName || initialRecord.CallerName || initialRecord.ReceiverName || initialRecord.name || initialRecord.Username || initialRecord.Name, $options: 'i' } },
          { aliases: { $regex: initialRecord.first_name || initialRecord.last_name || initialRecord.UserName || initialRecord.CallerName || initialRecord.ReceiverName || initialRecord.name || initialRecord.Username || initialRecord.Name, $options: 'i' } }
        ]
      });

      // Search in Facebook data
      matchedFacebookData = await Facebook.find({
        $or: [
          { phoneNumber: initialRecord.phoneNumber || initialRecord.CallerID || initialRecord.ReceiverID || initialRecord.Contact_phone_number },
          { Email: initialRecord.email },
          { Username: { $regex: initialRecord.first_name || initialRecord.last_name || initialRecord.UserName || initialRecord.CallerName || initialRecord.ReceiverName || initialRecord.name || initialRecord.Username || initialRecord.Name, $options: 'i' } }
        ]
      });

      // Search in Immigration data
      matchedImmigrationData = await Immigration.find({
        $or: [
          { phoneNumber: initialRecord.phoneNumber || initialRecord.CallerID || initialRecord.ReceiverID || initialRecord.Contact_phone_number },
          { ID_Number: initialRecord.SenderID },
          { Name: { $regex: initialRecord.first_name || initialRecord.last_name || initialRecord.UserName || initialRecord.CallerName || initialRecord.ReceiverName || initialRecord.name || initialRecord.Username || initialRecord.Name, $options: 'i' } }
        ]
      });

      // Search in Import and Export data
      matchedImportExportData = await ImportExport.find({
        Contact_phone_number: {
          $in: [
            initialRecord.phoneNumber,
            ...matchedBankRecords.map(record => record.phoneNumber),
            ...matchedTwitterData.map(record => record.phoneNumber),
            ...matchedFacebookData.map(record => record.phoneNumber),
            ...matchedCallRecords.map(record => record.CallerID),
            ...matchedCallRecords.map(record => record.ReceiverID)
          ].filter(Boolean) // Remove any undefined or null values
        }
      });
      matchedCryptocurrencyData = await Cryptocurrency.findOne({ IP_Address: initialRecord.IP_Address })
    }

    console.log('Initial record found:', initialRecord);
    console.log('Matched Bank Records:', matchedBankRecords.length);
    console.log('Matched Call Records:', matchedCallRecords.length);
    console.log('Matched Twitter Data:', matchedTwitterData.length);
    console.log('Matched Sanctioned Data:', matchedSanctionedData.length);
    console.log('Matched Facebook Data:', matchedFacebookData.length);
    console.log('Matched Immigration Data:', matchedImmigrationData.length);
    console.log('Matched Import and Export Data:', matchedImportExportData.length);


    // To display the results
    const results = {
      initialRecord,
      matchedBankRecords,
      matchedCallRecords,
      matchedTwitterData,
      matchedSanctionedData,
      matchedFacebookData,
      matchedImmigrationData,
      matchedImportExportData,
      matchedCryptocurrencyData,
      searchType
    };

    console.log('Sending results:', JSON.stringify(results, null, 2));
    res.json(results);

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// To determine search type
async function determineSearchType(searchTerm) {
  if (await Bank.exists({ email: searchTerm }) ||
      await Twitter.exists({ email: searchTerm }) ||
      await Sanctioned.exists({ email: searchTerm }) ||
      await Facebook.exists({ Email: searchTerm })) {
    return 'email';
  }
  if (
      await Bank.exists({ $or: [{ first_name: { $regex: new RegExp(searchTerm, 'i')} }, { last_name: { $regex: new RegExp(searchTerm, 'i')} }, {Name: { $regex: new RegExp(searchTerm, 'i')} }] }) ||
      await Twitter.exists({ UserName: { $regex: new RegExp(searchTerm, 'i')} }) ||
      await Sanctioned.exists({ name: { $regex: new RegExp(searchTerm, 'i')} }) ||
      await Facebook.exists({ Username: { $regex: new RegExp(searchTerm, 'i')} }) ||
      await Call.exists({ $or: [{ CallerName: { $regex: new RegExp(searchTerm, 'i')} }, { ReceiverName: { $regex: new RegExp(searchTerm, 'i')} }] }) ||
      await Twitter.exists ({ Name: { $regex: new RegExp(searchTerm, 'i')} })
  ) {
    return 'name';
  }
  if (await Bank.exists({ account_number: parseInt(searchTerm, 10) })) {
    return 'account_number';
  }
  if (await Bank.exists({ SenderID: parseInt(searchTerm, 10) })) {
    return 'SenderID';
  }
  if (await Twitter.exists({ IP_Address: parseInt(searchTerm, 10) }) ||
      await Cryptocurrency.exists({ IP_Address: parseInt(searchTerm, 10) })
  ) {
    return 'IP_Address';
  }
  if (await Bank.exists({ phoneNumber: searchTerm }) ||
      await Twitter.exists({ phoneNumber: searchTerm }) ||
      await Call.exists({ $or: [{ CallerID: searchTerm }, { ReceiverID: searchTerm }] }) ||
      await Facebook.exists({ phoneNumber: searchTerm }) ||
      await ImportExport.exists({ Contact_phone_number: searchTerm }) ||
      await Immigration.exists({ phoneNumber: searchTerm })) {
    return 'phone';
  }

  return 'other';
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
