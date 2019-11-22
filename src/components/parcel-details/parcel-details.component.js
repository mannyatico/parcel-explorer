import React from 'react';
import { Label, Segment, Header, Message, Accordion, Icon, List, Grid, Popup } from 'semantic-ui-react';
import { ensure } from '../../utils';
import PropTypes from 'prop-types';
import { AnswerFromAPI } from '../index';

class ParcelDetailsComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOverweight: false
        };
    }

    getVolumetricWeight(width, height, length) {
        width = ensure.number(width);
        height = ensure.number(height);
        length = ensure.number(length);

        return ((width * height * length) / 5000);
    }

    forceRequestFn(trackingNumber) {
        const fn = ensure.function(this.props.requestInfoFromAPIFn);
        trackingNumber = ensure.string(trackingNumber);

        fn(trackingNumber, true);
    }

    convertLb2Kg(lb) {
        return lb / 2.205;
    }

    render() {
        const self = this;

        const selectedParcel = ensure.object(this.props.selectedParcel);
        const isParcelSelected = Object.keys(selectedParcel).length > 0;
        const trackingNumber = ensure.string(selectedParcel.tracking_number);
        const carrier = ensure.string(selectedParcel.carrier);
        const parcel = ensure.object(selectedParcel.parcel);
        parcel.width = ensure.number(parcel.width);
        parcel.height = ensure.number(parcel.height);
        parcel.length = ensure.number(parcel.length);
        parcel.weight = ensure.number(parcel.weight);
        parcel.distanceUnit = ensure.string(parcel.distance_unit);
        parcel.massUnit = ensure.string(parcel.mass_unit);

        const APIQueryInfo = ensure.object(self.props.APIQueryInfo);

        const volumetricWeight = self.getVolumetricWeight(parcel.width, parcel.height, parcel.length);
        const totalWeight = (
            parcel.weight > volumetricWeight
                ? { weight: parcel.weight, units: parcel.massUnit }
                : { weight: volumetricWeight, units: parcel.distanceUnit }
        );
        let overweightObj = {
            isOverweight: undefined,
            overweight: 0
        };
        if (!APIQueryInfo.loading && !APIQueryInfo.error) {
            const realWeightKg = self.convertLb2Kg(ensure.number(APIQueryInfo.realWeight));

            overweightObj = (
                realWeightKg > totalWeight.weight
                    ? { isOverweight: true, overweight: Math.ceil(realWeightKg - totalWeight.weight) }
                    : { isOverweight: false, overweight: 0 }
            );
        }




        const segmentColor = (
            !isParcelSelected || overweightObj.isOverweight === undefined
                ? 'grey'
                : (
                    overweightObj.isOverweight === true
                        ? 'red'
                        : 'green'
                )
        );
        const label = (
            isParcelSelected && overweightObj.isOverweight === false
                ? <Label ribbon color="green">No overweight</Label>
                : ''
        );

        let content = "";

        const accordionContent = [{
            key: 'parcel-details',
            title: 'More parcel related details',
            content: {
                content: (
                    <List as={Grid}>
                        <Grid.Row>
                            <Grid.Column width={8} as={List}>
                                <List.Item>
                                    <Icon name="boxes" />
                                    <List.Content>
                                        <List.Header>Width</List.Header>
                                        <List.Description>{parcel.width} {parcel.distanceUnit}</List.Description>
                                    </List.Content>
                                </List.Item>
                                <List.Item>
                                    <Icon name="boxes" />
                                    <List.Content>
                                        <List.Header>Height</List.Header>
                                        <List.Description>{parcel.height} {parcel.distanceUnit}</List.Description>
                                    </List.Content>
                                </List.Item>
                                <List.Item>
                                    <Icon name="boxes" />
                                    <List.Content>
                                        <List.Header>Length</List.Header>
                                        <List.Description>{parcel.length} {parcel.distanceUnit}</List.Description>
                                    </List.Content>
                                </List.Item>
                            </Grid.Column>
                            <Grid.Column width={8} as={List}>
                                <List.Item>
                                    <Icon name="boxes" />
                                    <List.Content>
                                        <List.Header>Weight</List.Header>
                                        <List.Description>
                                            {Math.ceil(parcel.weight)} {parcel.massUnit}
                                            <Popup trigger={<Icon name="info circle" />}>
                                                Real: {parcel.weight} {parcel.massUnit}
                                            </Popup>
                                        </List.Description>
                                    </List.Content>
                                </List.Item>
                                <List.Item>
                                    <Icon name="boxes" />
                                    <List.Content>
                                        <List.Header>Volumetric Weight</List.Header>
                                        <List.Description>
                                            {Math.ceil(volumetricWeight)} {parcel.distanceUnit}
                                            <Popup trigger={<Icon name="info circle" />}>
                                                Real: {volumetricWeight} {parcel.distanceUnit}
                                            </Popup>
                                        </List.Description>
                                    </List.Content>
                                </List.Item>
                            </Grid.Column>
                        </Grid.Row>
                    </List>
                )
            }
        }];

        if (isParcelSelected) {
            content = (
                <Segment.Group raised>

                    {/* Header title */}
                    <Segment color={segmentColor}>
                        {/* Label when no overweight */}
                        {label}
                        <Header
                            textAlign="center"
                            content={trackingNumber}
                            subheader={carrier}
                        />

                    </Segment>
                    {/* Answer from API */}
                    <Segment>
                        <AnswerFromAPI
                            loading={ensure.boolean(this.props.APIQueryInfo.loading, true)}
                            error={ensure.boolean(this.props.APIQueryInfo.error, false)}
                            errorMsg={ensure.string(this.props.APIQueryInfo.errorMsg)}
                            cached={ensure.boolean(this.props.APIQueryInfo.cached)}
                            isOverweight={overweightObj.isOverweight}
                            totalWeight={totalWeight}
                            realWeight={self.convertLb2Kg(ensure.number(this.props.APIQueryInfo.realWeight))}
                            realWeightLb={ensure.number(this.props.APIQueryInfo.realWeight)}
                            overweight={overweightObj.overweight}
                            parcelID={trackingNumber}
                            forceRequestFn={this.forceRequestFn.bind(this)}
                        />
                    </Segment>
                    {/* More info */}
                    <Segment
                        as={Accordion}
                        panels={accordionContent}
                    />
                </Segment.Group>
            );
        } else {
            content = (
                <Segment color={segmentColor}>
                    <Message
                        icon="comment alternate"
                        header="Please select a parcel"
                        content="All the details will be displayed here."
                    />
                </Segment>
            );
        }

        return content;
    }
}

export default ParcelDetailsComponent;

ParcelDetailsComponent.propTypes = {
    selectedParcel: PropTypes.object.isRequired,
    APIQueryInfo: PropTypes.object.isRequired,
    requestInfoFromAPIFn: PropTypes.func.isRequired
};
