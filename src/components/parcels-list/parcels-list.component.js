import React from 'react';
import PropTypes from 'prop-types';
import { Header, Icon, List } from 'semantic-ui-react';
import { ensure } from '../../utils';

class ParcelsListComponent extends React.Component {
    render() {
        const listParcels = Object.entries(this.props.parcelsList).map((parcel) => (
            <List.Item
                key={parcel[0]}
                onClick={
                    () => (ensure.function(this.props.requestParcelDetailsFn)(parcel[0]))
                }>
                <Icon name="shipping fast" />
                <List.Content>
                    <List.Header>{parcel[1]['tracking_number']}</List.Header>
                </List.Content>
            </List.Item >
        ));

        return (
            <div>
                <Header size="medium">
                    <Icon name="list alternate outline" />
                    <Header.Content>Parcels List</Header.Content>
                </Header>
                <List selection verticalAlign="middle">
                    {listParcels}
                </List>
            </div>
        );
    }
}

export default ParcelsListComponent;

ParcelsListComponent.propTypes = {
    parcelsList: PropTypes.object.isRequired,
    requestParcelDetailsFn: PropTypes.func.isRequired
};

