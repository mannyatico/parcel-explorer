This project receives a json file with an array of parcels and retrieves the appropriate information from the Fedex API.

## Requeriments
You will need `yarn` installed on your computer to be able to run this project.

## How to run

First exec `yarn` and then when all the dependencies are installed run `yarn server-start`.

## Available Scripts

In the project directory, you can run:

### `yarn`
Installs all the dependencies needed to run this project.

### `yarn server-start`

Runs the app and start the express server needed to perform requests to Fedex's API.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.


## Misc

This app will reject any file that is not a _json_ file, and also will reject all the _json_ files that don't comply with the expected schema.

### JSON schema used

You can see the schema used to validate json files:

* It should be an array of objects.
* Each object should have 3 properties (all of them are required):
	* `tracking_number`: Type `string`
	* `carrier`: Type `string`
	* `parcel`: Type `object`
* Also `parcel` should comply with the following schema (all properties mentioned are mandatory):
	* `length`: Type `number`
	* `width`: Type `number`
	* `height`: Type `number`
	* `weight`: Type `number`
	* `distance_unit`: Type `string` and only accept one of the following values:
		* `CM`
		* `cm`
		* `Cm`
		* `cM`
	* `mass_unit`: Type `string` and only accept one of the following values:
		* `KG`
		* `kg`
		* `Kg`
		* `kG`

If the schema conditions are not fullfilled, then the json file/object is rejected.