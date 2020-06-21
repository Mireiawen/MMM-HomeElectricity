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
    name: 'default',
    url: 'https://localhost:8086/',
    database: 'magicmirror',
    measurement: 'electricity',
    spot: 'spot',
    consumed: 'consumed',
    range: 1,
    margin: 0.0,
    monthlyFee: 0.0,
    template: 'Consumed: {{= it.consumed }} magic, {{= it.cost }} money',
    updateInterval: 5 * 60 * 1000
  },

  /**
   * This module's text element
   */
  textElement: null,

  /**
   * The template for the text
   */
  textTemplate: null,

  /**
   * Get the scripts for the module
  */
  getScripts: function()
  {
    return [
      this.file('node_modules/jquery/dist/jquery.min.js'),
      this.file('node_modules/dot/doT.min.js')
    ];
  },

  /**
   * Start the module
   */
	start: function()
  {
    this.config = Object.assign({}, this.defaults, this.config);
		Log.info('Starting module: ' + this.name);
    this.textTemplate = doT.template(this.config.template);
	},

  /**
   * Get the DOM element for Magic Mirror
   */
	getDom: function()
  {
    // Create wrapper element
    var wrapper = $('<div>');

    this.textElement = $('<p>');
    wrapper.append(this.textElement);
    
    // And return the DOM element of the wrapper
		return wrapper.get(0);
	},

  /**
   * Handle the notifications
   */
  notificationReceived: function(notification, payload, sender)
  {
    switch (notification)
    {
    case 'DOM_OBJECTS_CREATED':
      // Get the initial data after DOM element is created
      this.sendSocketNotification('GET_DATA', {config: this.config, element: this.textElement});

      // Set up timer to update the DOM element periodically
      var timer = setInterval(() => 
      {
        this.sendSocketNotification('GET_DATA', {config: this.config, element: this.textElement});
      },
      this.config.updateInterval);
      break;
    }
  },

  /**
   * Handle the socket notifications
   */
  socketNotificationReceived: function(notification, payload)
  {
    switch (notification)
    {
    case 'DATA':
      // Check for own data
      if (payload.name === this.config.name)
      {
        this.textElement.html(this.getText(payload.cost, payload.consumption));
      }
      break;
    }
  },

  /**
   * Create the text field
   */
  getText(cost, consumed)
  {
    // Generate the templated text
    return this.textTemplate(
    {
      cost: cost.toFixed(2),
      consumed: consumed.toFixed(2)
    });
  }
});
