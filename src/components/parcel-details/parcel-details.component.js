import React from 'react';
import { Label, Segment, Header, Message, Accordion, Icon } from 'semantic-ui-react';
import { ensure } from '../../utils';
import PropTypes from 'prop-types';

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

    handleClick(e, titleProps) {
        console.log(titleProps);
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
                ? parcel.weight
                : volumetricWeight
        );

        const segmentColor = (
            !isParcelSelected || APIQueryInfo.isOverweight === undefined
                ? 'grey'
                : (
                    APIQueryInfo.isOverweight === true
                        ? 'red'
                        : 'green'
                )
        );
        const label = (
            isParcelSelected && APIQueryInfo.isOverweight === false
                ? <Label ribbon color="green">No overweight</Label>
                : ''
        );

        let content = "";

        if (isParcelSelected) {
            content = (
                <Segment.Group raised>
                    <Segment color={segmentColor}>
                        {label}
                        <Header
                            textAlign="center"
                            content={trackingNumber}
                            subheader={carrier}
                        />

                    </Segment>
                    <Segment>
                        <Header as="h3">Parcel details</Header>
                    </Segment>
                    <Segment as={Accordion} onClick={this.handleClick.bind(self)} index={0}>
                        <Accordion.Title active={true}>
                            <Icon name="dropdown" />
                            More details
                        </Accordion.Title>
                        <Accordion.Content active={true}>
                            Content
                        </Accordion.Content>
                    </Segment>
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
    APIQueryInfo: PropTypes.object.isRequired
};
