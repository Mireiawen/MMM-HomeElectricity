/* vim: set tabstop=2 softtabstop=2 shiftwidth=2 expandtab smarttab autoindent: */

/** 
 * Magic Mirror
 * Module: MMM-HomeElectricity
 *
 * MIT Licensed
 */

Module.register('MMM-HomeElectricity',
{
  /**
   * Set the default values
   */
  defaults:
  {
    url: "https://localhost:8086/",
    database: "magicmirror",
    measurement: "electricity",
    spot: "spot",
    consumed: "consumed",
    range: 1,
    margin: 0.0,
    monthlyFee: 0.0,
    textPre: '',
    textPost: ''
  },

  /**
   * Get the scripts for the module
  */
  getScripts: function()
  {
    return [
      this.file('node_modules/jquery/dist/jquery.min.js'),
      this.file('node_modules/sprintf-js/dist/sprintf.min.js'),
      this.file('luxon.min.js')
    ];
  },

  /**
   * Start the module
   */
	start: function()
  {
    this.config = Object.assign({}, this.defaults, this.config);
		Log.info('Starting module: ' + this.name);
	},

  /**
   * Read the data points and labels from the InfluxDB
   */
  getData: function()
  {
    // Define the DateTime from luxon
    var DateTime = luxon.DateTime;

    // Get the times
    start = DateTime.local().minus({ months: this.config.range}).startOf('month').toISODate();
    end = DateTime.local().minus({months: this.config.range}).endOf('month').toISODate();

    // Build the URL for InfluxDB query
    query = sprintf('SELECT (%s * %s + %f)/100 AS cost FROM %s WHERE Time > \'%s\' AND Time < \'%s\'',
      this.config.consumed, this.config.spot, this.config.margin,
      this.config.measurement, start, end);
    var url = this.config.url + 'query?db=' + encodeURIComponent(this.config.database) + '&q=' + encodeURIComponent(query);
    
    // Execute the query and go through the result points for first serie
    var sum = this.config.monthlyFee;
    $.ajax({url: url, async: false}).done(function(data)
    {
      console.log(url);
      console.log(data);
      let serie = data.results[0].series[0];
      for (const value of serie.values)
      {
        sum += parseFloat(value[1]);
      }
    });

    // Return the data sum
    return sum;
  },

  /**
   * Get the DOM element for Magic Mirror
   */
	getDom: function()
  {
    // Create wrapper element
    var wrapper = $('<div>');

    // Load the data sum
    var sum = this.getData();

    var text = $('<p>');
    text.html(this.config.textPre + sum.toFixed(2) + this.config.textPost);
    wrapper.append(text);
    
    // And return the DOM element of the wrapper
		return wrapper.get(0);
	}
});
