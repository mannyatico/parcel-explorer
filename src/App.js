import React from 'react';
import { Container, Header, Grid, Loader, Dimmer, Message, Icon } from 'semantic-ui-react';
import { FileExplorer, ParcelsList, ParcelDetails } from './components';
import Ajv from 'ajv';
import { scheduled } from 'rxjs';


class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            error: false,
            message: ''
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
        let validationResult = Object.freeze({
            valid: true,
            message: ''
        });

        try {
            JSON.parse(jsonStr);
        } catch (e) {
            validationResult = {
                valid: false,
                message: 'The file provided does not have a valid JSON structure.'
            }
        }

        return validationResult;
    }

    isValidStructure(jsonStr) {
        const self = this;
        const valid = self.validator(JSON.parse(jsonStr));
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

    setJsonFile(file) {
        const self = this;
        const fr = new FileReader();

        let jsonStr = '';
        let valid = true;

        fr.onloadstart = function () {
            self.setState({
                loading: true
            });
        }

        fr.onloadend = function (e) {
            jsonStr = e.target.result;

            self.setState({
                loading: false
            });

            // Valid if the file provided has a valid JSON string
            valid = self.isValidJson(jsonStr);

            if (valid.valid) {
                // Valid if the JSON string complies with the schema
                valid = self.isValidStructure(jsonStr);

                if (valid.valid) {
                    self.setState({
                        error: false,
                        message: ''
                    });
                } else {
                    self.setState({
                        error: true,
                        message: valid.message
                    });
                }
            } else {
                self.setState({
                    error: true,
                    message: valid.message
                });
            }
        }
        fr.readAsText(file);
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
                                Parcel Explorer
                        </Header>
                        </Grid.Column>
                        {/* File explorer */}
                        <Grid.Column width="16" padded>
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
                            <ParcelsList isValidFile={this.state.isValidFile} />
                        </Grid.Column>
                        {/* Parcel details */}
                        <Grid.Column width="12">
                            <ParcelDetails />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container >
        );
    }
}

export default App;
