const mongoose = require('mongoose');
const domain = new mongoose.Schema({
  domainName: {
    type: String,
  },
});

const Domain = mongoose.model('domain', domain);

module.exports = Domain;
