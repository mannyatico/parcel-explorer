import React from 'react';
import { Container, Header, Grid } from 'semantic-ui-react';
import { FileExplorer, ParcelsList, ParcelDetails } from './components';

function App() {
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
                        <FileExplorer />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row divided>
                    {/* Parcel list */}
                    <Grid.Column width="4">
                        <ParcelsList />
                    </Grid.Column>
                    {/* Parcel details */}
                    <Grid.Column width="12">
                        <ParcelDetails />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>
    );
}

export default App;
