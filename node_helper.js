/* vim: set tabstop=2 softtabstop=2 shiftwidth=2 expandtab smarttab autoindent: */

/** 
 * Magic Mirror
 * Module: MMM-HomeElectricity
 *
 * MIT Licensed
 */

// sprintf implementation
const sprintf = require('sprintf-js').sprintf;

// Date and time handling
const { DateTime } = require('luxon');

// jQuery requires DOM, create for it
const { JSDOM } = require( 'jsdom' );
const { window } = new JSDOM( '' );
const $ = require( 'jquery' )( window );

const NodeHelper = require('node_helper');
module.exports = NodeHelper.create({
  /**
   * Start the helper
   */
  start: function()
  {
		console.log('Starting helper: ' + this.name);
  },

  /**
   * Handle the socket notifications
   */
  socketNotificationReceived: function(notification, payload)
  {
    switch (notification)
    {
      case 'GET_DATA':
        this.getData(payload.config);
        break;
    }
  },

  /**
   * Read the data from the InfluxDB and sum it
   */
  getData: function(config)
  {
    // Get the times
    let start = DateTime.local().minus({ months: config.range}).startOf('month').toISODate();
    let end = DateTime.local().minus({months: config.range}).endOf('month').toISODate();

    // Build the URL for InfluxDB query
    query = sprintf('SELECT (%s * %s + %f)/100 AS cost, %s as consumption FROM %s WHERE Time > \'%s\' AND Time < \'%s\'',
      config.consumed, config.spot, config.margin,
      config.consumed,
      config.measurement, start, end);
    var url = config.url + 'query?db=' + encodeURIComponent(config.database) + '&q=' + encodeURIComponent(query);
    
    // Execute the query and go through the result points for first serie
    var sum_cost = config.monthlyFee;
    var sum_consumed = 0.0;

    // Create instance of this object for the done function
    var self = this;

    // Run the query
    $.get(url).done(function(data)
    {
      let serie = data.results[0].series[0];
      for (const value of serie.values)
      {
        sum_cost += parseFloat(value[1]);
        sum_consumed += parseFloat(value[2]);
      }

      // Notify the modules with data
      self.sendSocketNotification('DATA', { name: config.name, cost: sum_cost, consumption: sum_consumed });
    });
  },
})
