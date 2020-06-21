# MMM-HomeElectricity
[MagicMirror²](https://github.com/MichMich/MagicMirror) module to display a electricity bill estimate from InfluxDB data. Can likely be used for other purposes as well where data summing from InfluxDB last month serie is needed.

## Requirements
* [Node.js](https://nodejs.org/en/download/)

## Installation
In short, clone the repository to your MagicMirror modules directory and run `npm install` inside the module folder to install the dependencies.

These commands show bit of example of how it could be done, you should modify them to match your own MagicMirror path.

1. In your terminal, go to your MagicMirror module folder
    ```bash
    cd MagicMirror/modules
    ```

2. Clone the repository
    ```bash
    git clone git@github.com:Mireiawen/MMM-HomeElectricity.git
    ```

3. Install the dependencies
    ```bash
    cd MagicMirror/modules/MMM-HomeElectricity
    npm install
    ```
## Configuring the module
To use this module, add it to the modules array in the `config/config.js` file, for example:
```javascript
modules: [
    ...
    {
      module: "MMM-HomeElectricity",
      position: "bottom_left",
      header: "Magic Used",
      config: {
        url: "http://influxdb.localdomain/",
        database: "magic_mirror",
        measurement: "magic",
        spot: "magic_price",
        consumed: "magic_use",
        margin: 0.10,
        monthlyFee: 2.00,
        template: 'Last month: {{= it.consumed }} magic spent, worth of {{= it.cost }} magic stones',
        textPost: ' magic units'
      }
    }
]
```
### Configuration options
| Option        | Type   | Description                                    | Default value              |
| --------------|--------|------------------------------------------------|----------------------------|
| `name`        | string | Unique name for the module, if multiple in use | `'default'`                |
| `url`         | string | The InfluxDB API URL                           | `'http://localhost:8086/'` |
| `database`    | string | The InfluxDB database to query                 | `'magicmirror'`            |
| `measurement` | string | The InfluxDB measurement to read from          | `'electricity`'            |
| `spot`        | string | The SPOT price, or similar cost of use field   | `'spot'`                   |
| `consumed`    | string | The field for the consumed units               | `'consumed'`               |
| `range`       | int    | The month to look back, 0 means this month, 1 previous and so on | `1`      |
| `margin`      | float  | Margin to add to the cost of use               | `0.0`                      |
| `monthlyFee`  | float  | The monthly fee to add to the total sum        | `0.0`                      |
| `template`    | string | Text template for cost and consumption texts   | `'Consumed: {{= it.consumed }} magic, {{= it.cost }} money'` |
