import React from 'react';
import { Container, Header, Grid } from 'semantic-ui-react';
import FileExplorerComponent from './components/file-explorer/file-explorer.component';

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
                        <FileExplorerComponent />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row divided>
                    {/* Parcel list */}
                    <Grid.Column width="4">Parcel list</Grid.Column>
                    {/* Parcel details */}
                    <Grid.Column width="12">Parcel details</Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>
    );
}

export default App;
