import React from 'react';
import { Container, Header, Grid, Loader, Dimmer, Message, Icon } from 'semantic-ui-react';
import { FileExplorer, ParcelsList, ParcelDetails } from './components';
import { ensure, prefixedSequence } from './utils';
import Ajv from 'ajv';
import axios from 'axios';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            error: false,
            message: '',
            parcelsList: {},
            selectedParcel: '',
            APIQueryInfo: {
                loading: false,
                error: false,
                errorMsg: '',
                cached: false,
                canRetry: false,
                realWeight: 0
            },
            cache: {}
        };
    }

    componentDidMount() {
        this.ajv = new Ajv({ allErrors: true });

        const parcelSchema = {
            "required": ["length", "width", "height", "weight", "distance_unit", "mass_unit"],
            "properties": {
                "length": { "type": "number" },
                "width": { "type": "number" },
                "height": { "type": "number" },
                "weight": { "type": "number" },
                "distance_unit": { "type": "string", "enum": ["CM", "cm", "Cm", "cM"] },
                "mass_unit": { "type": "string", "enum": ["KG", "kg", "Kg", "kG"] }
            }
        };

        const objSchema = {
            "required": ["tracking_number", "carrier", "parcel"],
            "properties": {
                "tracking_number": { "type": "string" },
                "carrier": { "type": "string" },
                "parcel": parcelSchema
            }
        };

        const schema = {
            "type": "array",
            "items": objSchema
        };

        this.validator = this.ajv.compile(schema);
    }

    isValidJson(jsonStr) {
        let validationResult = {
            valid: true,
            message: '',
            parsedJson: {}
        };

        try {
            const json = JSON.parse(jsonStr);
            validationResult.parsedJson = json;
        } catch (e) {
            validationResult = {
                valid: false,
                message: 'The file provided does not have a valid JSON structure.',
                parsedJson: {}
            }
        }
        return validationResult;
    }

    isValidStructure(jsonStr) {
        const self = this;
        const valid = self.validator(jsonStr);
        let validationResult = Object.freeze({
            valid: true,
            message: ''
        });

        if (!valid) {
            validationResult = {
                valid: false,
                message: 'The JSON provided does not complies with the expected schema (note that data refers to the json data), ' + self.ajv.errorsText(self.validator.errors)
            };
        }

        return validationResult;
    }

    getFormattedParcelsObj(strJson) {
        const prefixedSeqFn = prefixedSequence('parcel');
        const obj = {};

        strJson.forEach((value, index) => Object.assign(obj, { [prefixedSeqFn()]: value }));

        return obj;
    }

    setJsonFile(file) {
        const self = this;
        const fr = new FileReader();

        let formattedParcelsJson = {};
        let jsonStr = '';
        let valid = true;

        fr.onloadstart = function () {
            self.setState({
                loading: true
            });
        }

        fr.onloadend = function (e) {
            jsonStr = e.target.result;
            let objState = {
                error: true,
                message: '',
                parcelsList: {}
            };

            self.setState({
                loading: false
            });

            // Valid if the file provided has a valid JSON string
            valid = self.isValidJson(jsonStr);

            if (valid.valid) {
                jsonStr = valid.parsedJson;
                // Valid if the JSON string complies with the schema
                valid = self.isValidStructure(jsonStr);

                if (valid.valid) {
                    formattedParcelsJson = self.getFormattedParcelsObj(jsonStr);

                    Object.assign(objState, {
                        error: false,
                        parcelsList: formattedParcelsJson
                    });
                } else {
                    Object.assign(objState, { message: valid.message });
                }
            } else {
                Object.assign(objState, { message: valid.message });
            }

            self.setState(objState);
        }
        fr.readAsText(file);
    }

    requestParcelDetailsFn(parcelID) {
        parcelID = ensure.string(parcelID);

        this.setState({
            selectedParcel: parcelID,
            APIQueryInfo: {
                loading: true
            }
        });

        this.requestInfoFromAPIFn(ensure.string(this.state.parcelsList[parcelID]['tracking_number']));
    }

    requestInfoFromAPIFn(trackingNumber, force) {
        force = ensure.boolean(force, false);
        trackingNumber = ensure.string(trackingNumber);

        const self = this;
        const reqURL = `http://localhost:3001/parcel/${trackingNumber}`;
        let response;
        let defaultAPIQueryInfo = {
            loading: false,
            error: false,
            errorMsg: '',
            cached: false,
            canRetry: false,
            realWeight: 0
        };
        const cachedRequest = ensure.object(this.state.cache[trackingNumber]);

        (async () => {
            try {
                if (force || Object.entries(cachedRequest).length === 0) {
                    response = await axios.get(reqURL);

                    if (response.status === 200) {
                        let { result, resultMsg, canRetry, parcelDetails } = response.data;
                        let cache = this.state.cache;
                        parcelDetails = ensure.object(parcelDetails, { shipmentWeight: { weight: 0 } });

                        const updatedAPIQueryInfo = {
                            error: !(result === 'SUCCESS'),
                            errorMsg: resultMsg,
                            canRetry: canRetry,
                            realWeight: parcelDetails.shipmentWeight.weight
                        };

                        Object.assign(defaultAPIQueryInfo, updatedAPIQueryInfo);
                        // Only cache when we can't retry
                        if (!canRetry) {
                            Object.assign(cache, { [trackingNumber]: updatedAPIQueryInfo });
                        }

                        self.setState({
                            cache
                        });
                    } else {
                        self.setState({
                            APIQueryInfo: {
                                error: true,
                                errorMsg: 'An server related error occurred.'
                            }
                        });
                    }
                } else {
                    Object.assign(defaultAPIQueryInfo, {
                        cached: true,
                        ...cachedRequest
                    });
                }
            } catch (e) {
                Object.assign(defaultAPIQueryInfo, {
                    error: true,
                    errorMsg: e.message
                });
            } finally {
                self.setState({
                    APIQueryInfo: defaultAPIQueryInfo
                })
            }
        })();
    }

    render() {
        let message = '';

        if (this.state.error) {
            const errorMsgs = this.state.message.split(',');
            message = (
                <Grid.Column width="16">
                    <Message warning icon>
                        <Icon name="warning sign" />
                        <Message.Content>
                            <Message.Header>An has error ocurred</Message.Header>
                            <Message.List items={errorMsgs} />
                        </Message.Content>
                    </Message>
                </Grid.Column>
            );
        }

        return (
            <Container>
                <Grid padded>
                    <Grid.Row>
                        {/* Title */}
                        <Grid.Column width="16">
                            <Header dividing as="h1">
                                Parcels Explorer
                        </Header>
                        </Grid.Column>
                        {/* File explorer */}
                        <Grid.Column width="16">
                            <FileExplorer setJsonFile={(file) => this.setJsonFile(file)} />
                        </Grid.Column>
                    </Grid.Row>
                    {message}
                    <Grid.Row divided>
                        <Dimmer active={this.state.loading}>
                            <Loader />
                        </Dimmer>

                        {/* Parcel list */}
                        <Grid.Column width="4">
                            <ParcelsList
                                parcelsList={this.state.parcelsList}
                                requestParcelDetailsFn={this.requestParcelDetailsFn.bind(this)}
                            />
                        </Grid.Column>
                        {/* Parcel details */}
                        <Grid.Column width="12">
                            <ParcelDetails
                                selectedParcel={ensure.object(this.state.parcelsList[this.state.selectedParcel])}
                                APIQueryInfo={this.state.APIQueryInfo}
                                requestInfoFromAPIFn={this.requestInfoFromAPIFn.bind(this)}
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        );
    }
}

export default App;
