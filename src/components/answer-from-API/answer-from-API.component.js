import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Placeholder, Header, Icon, Message, List, Button, Popup } from 'semantic-ui-react';
import { ensure } from '../../utils';

class AnswerFromAPIComponent extends React.Component {
    render() {
        const loading = (
            <Segment loading attached>
                <Placeholder>
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                </Placeholder>
            </Segment>
        );

        const overweightContent = (
            ensure.boolean(this.props.isOverweight, false)
                ? (
                    <Segment>
                        <List>
                            <List.Item>
                                <Icon name="boxes" />
                                <List.Content>
                                    <List.Header>Overweight</List.Header>
                                    <List.Description>{this.props.overweight} KG</List.Description>
                                </List.Content>
                            </List.Item>
                        </List>
                    </Segment>
                )
                : ''
        );

        const APIAnswerDetails = (
            ensure.boolean(this.props.error, false) === true
                ? (
                    <React.Fragment>
                        <Segment>
                            <Message
                                warning
                                icon="warning sign"
                                header="An error occurred when requesting the info"
                                content={ensure.string(this.props.errorMsg)}
                            />
                        </Segment>
                    </React.Fragment>
                )
                : (
                    <React.Fragment>
                        <Segment>
                            <List>
                                <List.Item>
                                    <Icon name="boxes" />
                                    <List.Content>
                                        <List.Header>Real Weight</List.Header>
                                        <List.Description>
                                            {this.props.realWeight.toFixed(3)} KG
                                            <Popup trigger={<Icon name="info circle" />}>
                                                Received from server: {this.props.realWeightLb} LB
                                            </Popup>
                                        </List.Description>
                                    </List.Content>
                                </List.Item>
                            </List>
                        </Segment>
                        {overweightContent}
                    </React.Fragment>
                )
        );

        const parcelDetails = (
            <Segment>
                <List>
                    <List.Item>
                        <Icon name="boxes" />
                        <List.Content>
                            <List.Header>Total Weight</List.Header>
                            <List.Description>{Math.ceil(this.props.totalWeight.weight)} {this.props.totalWeight.units}</List.Description>
                        </List.Content>
                    </List.Item>
                </List>
            </Segment>
        );

        const cachedContent = (
            ensure.boolean(this.props.cached, false)
                ? (
                    <Message info attached icon>
                        <Icon name="bell outline" />
                        <Message.Content>
                            <Message.Header>The data from this request was retrieved from a cached version</Message.Header>
                            You can&nbsp;
                            <Button
                                color="blue"
                                animated="fade"
                            >
                                <Button.Content visible>reload the data</Button.Content>
                                <Button.Content hidden onClick={() => { this.props.forceRequestFn(this.props.parcelID) }}>
                                    <Icon name="sync alternate" />
                                </Button.Content>
                            </Button>
                            &nbsp;from the servers.
                        </Message.Content>
                    </Message>
                )
                : ''
        );

        const finalContent = (
            ensure.boolean(this.props.loading, true)
                ? loading
                : (
                    <React.Fragment>
                        {parcelDetails}
                        {APIAnswerDetails}
                    </React.Fragment>
                )
        );

        return (
            <React.Fragment>
                <Header as="h3" attached="top">
                    <Icon name="clipboard list" />
                    <Header.Content>Parcel Details</Header.Content>
                </Header>
                {cachedContent}
                <Segment.Group horizontal attached as={Segment}>
                    {finalContent}
                </Segment.Group>
            </React.Fragment>
        );
    }

}

export default AnswerFromAPIComponent;

AnswerFromAPIComponent.propTypes = {
    loading: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
    cached: PropTypes.bool.isRequired,
    totalWeight: PropTypes.object.isRequired,
    forceRequestFn: PropTypes.func.isRequired,
    parcelID: PropTypes.string.isRequired,
    isOverweight: PropTypes.bool,
    errorMsg: PropTypes.string,
    realWeight: PropTypes.number,
    realWeightLb: PropTypes.number,
    overweight: PropTypes.number
};
